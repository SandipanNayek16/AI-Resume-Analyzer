import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// Ensure the worker is set for PDF.js parsing (this is safe even on main thread for the parsing chunk)
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : "";

        // Run parsing on main thread so that it can inject @font-face rules into the DOM
        const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            standardFontDataUrl: `${baseUrl}/pdfjs/standard_fonts/`,
            cMapUrl: `${baseUrl}/pdfjs/cmaps/`,
            cMapPacked: true,
            useSystemFonts: true,
            // Do NOT use disableFontFace: true so embedded fonts are rendered correctly!
        }).promise;

        const numPages = Math.min(pdf.numPages, 3); // Cap at 3 pages to prevent memory issues
        const pages = [];
        let totalHeight = 0;
        let maxWidth = 0;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 3.0 });
            pages.push({ page, viewport });
            totalHeight += viewport.height;
            maxWidth = Math.max(maxWidth, viewport.width);
            
            // Yield control back to the event loop to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        const masterCanvas = document.createElement("canvas");
        masterCanvas.width = maxWidth;
        masterCanvas.height = totalHeight;
        const masterContext = masterCanvas.getContext("2d");
        
        if (masterContext) {
            masterContext.fillStyle = "white";
            masterContext.fillRect(0, 0, maxWidth, totalHeight);
            masterContext.imageSmoothingEnabled = true;
            masterContext.imageSmoothingQuality = "high";
        }

        let currentY = 0;
        for (let i = 0; i < pages.length; i++) {
            const { page, viewport } = pages[i];
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const tempContext = tempCanvas.getContext("2d");
            
            await page.render({ canvasContext: tempContext as any, viewport }).promise;
            
            if (masterContext) {
                masterContext.drawImage(tempCanvas, 0, currentY);
            }
            
            currentY += viewport.height;
            
            // Notify UI indirectly by yielding
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        const blob = await new Promise<Blob | null>(resolve => 
            masterCanvas.toBlob(resolve, "image/webp", 0.95)
        );

        if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.jpg`, {
                type: "image/jpeg",
            });

            return {
                imageUrl: URL.createObjectURL(blob),
                file: imageFile,
            };
        } else {
             return { imageUrl: "", file: null, error: "Failed to create blob" };
        }
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to initialize PDF conversion: ${err}`,
        };
    }
}
