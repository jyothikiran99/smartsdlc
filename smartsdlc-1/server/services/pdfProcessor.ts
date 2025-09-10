import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

interface PDFProcessingResult {
  text: string;
  pages: number;
}

export class PDFProcessor {
  async extractText(buffer: Buffer): Promise<PDFProcessingResult> {
    try {
      // Convert buffer to Uint8Array for pdf.js
      const uint8Array = new Uint8Array(buffer);
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const numPages = pdf.numPages;
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str)
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return {
        text: fullText.trim(),
        pages: numPages
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  validatePDF(buffer: Buffer): boolean {
    // Check for PDF signature
    const signature = buffer.slice(0, 4).toString();
    return signature === '%PDF';
  }
  
  getFileSize(buffer: Buffer): number {
    return buffer.length;
  }
  
  isFileSizeValid(buffer: Buffer, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return this.getFileSize(buffer) <= maxSizeBytes;
  }
}

export const pdfProcessor = new PDFProcessor();
