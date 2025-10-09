import { PDFDocument } from 'pdf-lib';

export interface PDFDocumentData {
    type: string;
    title: string;
    filename: string;
    data: string; // base64 encoded PDF
    source: string;
}

export interface BundleResponse {
    type: 'bundle_base64';
    documents: PDFDocumentData[];
    bundle_filename: string;
    patient_info: {
        nomor_sep: string;
        nama_pasien: string;
        pengajuan_id: number;
    };
}

/**
 * Decode base64 PDF data to Uint8Array
 */
export function decodeBase64PDF(base64Data: string): Uint8Array {
    try {
        // Remove data URL prefix if present
        const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
        
        // Decode base64 to binary string
        const binaryString = atob(cleanBase64);
        
        // Convert binary string to Uint8Array
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return bytes;
    } catch (error) {
        console.error('Error decoding base64 PDF:', error);
        throw new Error(`Failed to decode base64 PDF data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Merge multiple PDF documents into a single PDF
 */
export async function mergePDFs(documents: PDFDocumentData[]): Promise<Uint8Array> {
    try {
        console.log('Starting PDF merge process', {
            documentCount: documents.length,
            documents: documents.map(doc => ({ type: doc.type, title: doc.title, source: doc.source }))
        });

        // Create a new PDF document for the merged result
        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            
            try {
                console.log(`Processing document ${i + 1}/${documents.length}: ${doc.title}`, {
                    type: doc.type,
                    source: doc.source,
                    dataLength: doc.data.length
                });

                // Decode the base64 PDF data
                const pdfBytes = decodeBase64PDF(doc.data);
                
                // Load the PDF document
                const pdfDoc = await PDFDocument.load(pdfBytes);
                
                // Get all pages from the current document
                const pageIndices = pdfDoc.getPageIndices();
                
                // Copy all pages to the merged document
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
                
                // Add the copied pages to the merged document
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
                
                console.log(`Successfully merged document: ${doc.title}`, {
                    pagesAdded: pageIndices.length,
                    totalPagesNow: mergedPdf.getPageCount()
                });
                
            } catch (docError) {
                console.error(`Error processing document: ${doc.title}`, {
                    error: docError,
                    documentType: doc.type,
                    documentSource: doc.source
                });
                
                // Continue with other documents instead of failing completely
                throw new Error(`Failed to process ${doc.title}: ${docError instanceof Error ? docError.message : 'Unknown error'}`);
            }
        }
        
        if (mergedPdf.getPageCount() === 0) {
            throw new Error('No pages were successfully merged. All documents may be invalid.');
        }
        
        console.log('PDF merge completed successfully', {
            totalPages: mergedPdf.getPageCount(),
            documentsProcessed: documents.length
        });
        
        // Serialize the merged PDF to bytes
        const mergedPdfBytes = await mergedPdf.save();
        
        return mergedPdfBytes;
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        throw new Error(`PDF merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Download a Uint8Array as a file
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    try {
        // Create a blob from the PDF bytes
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        
        // Create a download URL
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element for download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL
        URL.revokeObjectURL(url);
        
        console.log('PDF download initiated successfully', { filename });
        
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Merge and download PDF bundle from backend response
 */
export async function mergeAndDownloadBundle(bundleResponse: BundleResponse): Promise<void> {
    try {
        console.log('Starting bundle merge and download process', {
            bundleFilename: bundleResponse.bundle_filename,
            documentCount: bundleResponse.documents.length,
            patientInfo: bundleResponse.patient_info
        });

        if (!bundleResponse.documents || bundleResponse.documents.length === 0) {
            throw new Error('No documents found in bundle response');
        }
        
        // Merge all PDFs
        const mergedPdfBytes = await mergePDFs(bundleResponse.documents);
        
        // Download the merged PDF
        downloadPDF(mergedPdfBytes, bundleResponse.bundle_filename);
        
        console.log('Bundle merge and download completed successfully');
        
    } catch (error) {
        console.error('Error in bundle merge and download:', error);
        throw error; // Re-throw to let the caller handle it
    }
}

/**
 * Download individual PDF from base64 data
 */
export function downloadIndividualPDF(base64Data: string, filename: string): void {
    try {
        console.log('Starting individual PDF download', { filename });
        
        // Decode base64 to bytes
        const pdfBytes = decodeBase64PDF(base64Data);
        
        // Download the PDF
        downloadPDF(pdfBytes, filename);
        
        console.log('Individual PDF download completed successfully');
        
    } catch (error) {
        console.error('Error downloading individual PDF:', error);
        throw error;
    }
}

/**
 * Preview PDF from base64 data in new tab
 */
export function previewPDF(base64Data: string): void {
    try {
        console.log('Starting PDF preview');
        
        // Decode base64 to bytes
        const pdfBytes = decodeBase64PDF(base64Data);
        
        // Create blob and URL
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Open in new tab
        const previewWindow = window.open(url, '_blank');
        
        if (!previewWindow) {
            URL.revokeObjectURL(url);
            throw new Error('Popup blocked. Please allow popups for this site.');
        }
        
        // Clean up URL after a delay (to allow browser to load)
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
        
        console.log('PDF preview opened successfully');
        
    } catch (error) {
        console.error('Error previewing PDF:', error);
        throw error;
    }
}

/**
 * Validate if a string is valid base64
 */
export function isValidBase64(str: string): boolean {
    try {
        // Remove data URL prefix if present
        const cleanBase64 = str.replace(/^data:application\/pdf;base64,/, '');
        
        // Basic pattern check
        const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Pattern.test(cleanBase64)) {
            return false;
        }
        
        // Try to decode
        const decoded = atob(cleanBase64);
        
        // Check if decoded string can be encoded back to the same result
        return btoa(decoded) === cleanBase64;
    } catch {
        return false;
    }
}