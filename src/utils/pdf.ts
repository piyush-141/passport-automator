// PDF generation using pdf-lib (100% client-side, no backend)

import { PDFDocument, rgb } from 'pdf-lib';
import { mmToPt, calculateLayout } from './measurement';

export interface PDFGenerationOptions {
  croppedImageBlob: Blob;
  pageWidthMm: number;
  pageHeightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  marginMm: number;
  spacingMm: number;
  borderMm: number;
  copies: number;       // 0 = auto-fit
  borderColor?: { r: number; g: number; b: number };
  gridColsOverride?: number | null;
  gridRowsOverride?: number | null;
  alignment?: 'center' | 'left';
}

export interface PDFResult {
  blob: Blob;
  url: string;
  layout: { cols: number; rows: number; total: number };
}

/**
 * Generate a print-accurate PDF from a cropped image blob.
 * All measurements use mm → PDF points conversion (1mm = 2.83465pt).
 * The image is embedded once and reused for all copies.
 */
export async function generatePassportPDF(opts: PDFGenerationOptions): Promise<PDFResult> {
  const {
    croppedImageBlob,
    pageWidthMm, pageHeightMm,
    photoWidthMm, photoHeightMm,
    marginMm, spacingMm, borderMm,
    copies,
    borderColor = { r: 0, g: 0, b: 0 },
    gridColsOverride,
    gridRowsOverride,
    alignment,
  } = opts;

  const layout = calculateLayout(
    pageWidthMm, pageHeightMm,
    photoWidthMm, photoHeightMm,
    marginMm, spacingMm, borderMm,
    gridColsOverride,
    gridRowsOverride,
    alignment,
  );

  // Determine how many photos per page, and how many copies
  const photosPerPage = layout.total;
  const actualCopies = copies > 0 ? Math.min(copies, photosPerPage) : photosPerPage;

  const pdfDoc = await PDFDocument.create();

  // Set document metadata
  pdfDoc.setTitle('Passport Photos');
  pdfDoc.setAuthor('Passport Photo Generator (Client-Side)');
  pdfDoc.setSubject('Print-ready passport photo sheet');
  pdfDoc.setKeywords(['passport', 'photo', 'print']);

  const page = pdfDoc.addPage([mmToPt(pageWidthMm), mmToPt(pageHeightMm)]);
  const pageH = mmToPt(pageHeightMm);

  // Embed image once (reused for all copies → memory efficient)
  const imageBytes = await croppedImageBlob.arrayBuffer();
  let embeddedImage;
  if (croppedImageBlob.type === 'image/png') {
    embeddedImage = await pdfDoc.embedPng(imageBytes);
  } else {
    embeddedImage = await pdfDoc.embedJpg(imageBytes);
  }

  const totalPhotoW = photoWidthMm + borderMm * 2;
  const totalPhotoH = photoHeightMm + borderMm * 2;

  let photoCount = 0;

  for (let r = 0; r < layout.rows; r++) {
    for (let c = 0; c < layout.cols; c++) {
      if (photoCount >= actualCopies) break;

      const xMm = layout.offsetX + c * (totalPhotoW + spacingMm);
      const yMm = layout.offsetY + r * (totalPhotoH + spacingMm);

      const xPt = mmToPt(xMm);
      // PDF y-axis is bottom-up; convert from top-down
      const yPt = pageH - mmToPt(yMm) - mmToPt(totalPhotoH);

      // Draw border rectangle
      if (borderMm > 0) {
        page.drawRectangle({
          x: xPt,
          y: yPt,
          width: mmToPt(totalPhotoW),
          height: mmToPt(totalPhotoH),
          color: rgb(borderColor.r / 255, borderColor.g / 255, borderColor.b / 255),
        });
      }

      // Draw photo image
      page.drawImage(embeddedImage, {
        x: xPt + mmToPt(borderMm),
        y: yPt + mmToPt(borderMm),
        width: mmToPt(photoWidthMm),
        height: mmToPt(photoHeightMm),
      });

      photoCount++;
    }
    if (photoCount >= actualCopies) break;
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    layout: { cols: layout.cols, rows: layout.rows, total: actualCopies },
  };
}
