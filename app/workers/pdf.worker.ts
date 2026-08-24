// app/workers/pdf.worker.ts

import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

self.onmessage = async (e: MessageEvent) => {
    const { arrayBuffer, fileName } = e.data;

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            standardFontDataUrl: "/pdfjs/standard_fonts/",
            cMapUrl: "/pdfjs/cmaps/",
            cMapPacked: true,
        }).promise;
        const numPages = Math.min(pdf.numPages, 3); // Cap at 3 pages to prevent memory issues
        const pages = [];
        let totalHeight = 0;
        let maxWidth = 0;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            pages.push({ page, viewport });
            totalHeight += viewport.height;
            maxWidth = Math.max(maxWidth, viewport.width);
            
            // Yield control back to the event loop
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        const masterCanvas = new OffscreenCanvas(maxWidth, totalHeight);
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
            const tempCanvas = new OffscreenCanvas(viewport.width, viewport.height);
            const tempContext = tempCanvas.getContext("2d");
            
            await page.render({ canvasContext: tempContext as any, viewport }).promise;
            
            if (masterContext) {
                masterContext.drawImage(tempCanvas, 0, currentY);
            }
            
            currentY += viewport.height;
            
            // Notify main thread of progress and yield
            self.postMessage({ type: 'progress', current: i + 1, total: numPages });
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        const blob = await masterCanvas.convertToBlob({
            type: "image/jpeg",
            quality: 0.8
        });

        // Send the blob back to the main thread
        self.postMessage({ success: true, blob, fileName });
    } catch (error) {
        self.postMessage({ success: false, error: String(error) });
    }
};
