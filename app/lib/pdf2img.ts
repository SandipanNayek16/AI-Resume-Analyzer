import PdfWorker from '../workers/pdf.worker.ts?worker';

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    return new Promise(async (resolve) => {
        try {
            const arrayBuffer = await file.arrayBuffer();

            // Instantiate the worker using Vite's ?worker import
            const worker = new PdfWorker();

            worker.onmessage = (e: MessageEvent) => {
                const { success, blob, fileName, error } = e.data;
                
                // Cleanup worker
                worker.terminate();

                if (success && blob) {
                    const originalName = fileName.replace(/\.pdf$/i, "");
                    const imageFile = new File([blob], `${originalName}.jpg`, {
                        type: "image/jpeg",
                    });

                    resolve({
                        imageUrl: URL.createObjectURL(blob),
                        file: imageFile,
                    });
                } else {
                    resolve({
                        imageUrl: "",
                        file: null,
                        error: error || "Failed to create image blob in worker",
                    });
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                resolve({
                    imageUrl: "",
                    file: null,
                    error: `Worker error: ${err.message}`,
                });
            };

            // Start the worker
            worker.postMessage({
                arrayBuffer,
                fileName: file.name
            });

        } catch (err) {
            resolve({
                imageUrl: "",
                file: null,
                error: `Failed to initialize PDF conversion: ${err}`,
            });
        }
    });
}
