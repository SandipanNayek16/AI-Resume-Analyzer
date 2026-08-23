// app/workers/pdf.worker.ts

import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

self.onmessage = async (e: MessageEvent) => {
    const { arrayBuffer, fileName } = e.data;

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
            cMapPacked: true,
        }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        // Use OffscreenCanvas in the worker
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext("2d");
        
        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context as any, viewport }).promise;

        const blob = await canvas.convertToBlob({
            type: "image/jpeg",
            quality: 0.8
        });

        // Send the blob back to the main thread
        self.postMessage({ success: true, blob, fileName });
    } catch (error) {
        self.postMessage({ success: false, error: String(error) });
    }
};
