// Measurement utilities

export const MM_TO_PT = 2.83465; // 1mm = 2.83465 PDF points

export interface PageSize {
  id: string;
  label: string;
  width: number;  // mm
  height: number; // mm
}

export const PAGE_SIZES: PageSize[] = [
  { id: 'a4',     label: 'A4 (210×297mm)',       width: 210,   height: 297 },
  { id: 'a5',     label: 'A5 (148×210mm)',        width: 148,   height: 210 },
  { id: 'letter', label: 'Letter (216×279mm)',    width: 215.9, height: 279.4 },
  { id: 'legal',  label: 'Legal (216×356mm)',     width: 215.9, height: 355.6 },
  { id: '4x6',    label: '4×6 Photo (102×152mm)', width: 101.6, height: 152.4 },
  { id: '5x7',    label: '5×7 Photo (127×178mm)', width: 127,   height: 177.8 },
  { id: 'custom', label: 'Custom',                width: 210,   height: 297 },
];

export interface PassportSize {
  id: string;
  label: string;
  width: number;  // mm
  height: number; // mm
}

export const PASSPORT_SIZES: PassportSize[] = [
  { id: '28x32',    label: 'Indian Print (28×32mm)',    width: 28,   height: 32 },
  { id: 'standard', label: 'Standard (35×45mm)',        width: 35,   height: 45 },
  { id: 'india',    label: 'India Passport (35×45mm)',  width: 35,   height: 45 },
  { id: 'us',       label: 'US Passport (51×51mm)',     width: 51,   height: 51 },
  { id: 'schengen', label: 'Schengen Visa (35×45mm)',   width: 35,   height: 45 },
  { id: 'custom',   label: 'Custom Size',               width: 28,   height: 32 },
];

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

export function mmToPx(mm: number, dpi = 96): number {
  return (mm / 25.4) * dpi;
}

export function pxToMm(px: number, dpi = 96): number {
  return (px / dpi) * 25.4;
}

export interface LayoutResult {
  cols: number;
  rows: number;
  total: number;
  usableWidth: number;   // mm
  usableHeight: number;  // mm
  offsetX: number;       // mm - centering offset
  offsetY: number;       // mm - centering offset
}

export function calculateLayout(
  pageW: number,       // mm
  pageH: number,       // mm
  photoW: number,      // mm
  photoH: number,      // mm
  margin: number,      // mm (all sides)
  spacing: number,     // mm
  border: number,      // mm (each side)
): LayoutResult {
  const totalPhotoW = photoW + border * 2;
  const totalPhotoH = photoH + border * 2;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  const cols = Math.max(1, Math.floor((usableW + spacing) / (totalPhotoW + spacing)));
  const rows = Math.max(1, Math.floor((usableH + spacing) / (totalPhotoH + spacing)));

  const totalUsedW = cols * totalPhotoW + (cols - 1) * spacing;
  const totalUsedH = rows * totalPhotoH + (rows - 1) * spacing;

  // Center within usable area
  const offsetX = margin + (usableW - totalUsedW) / 2;
  const offsetY = margin + (usableH - totalUsedH) / 2;

  return {
    cols,
    rows,
    total: cols * rows,
    usableWidth: usableW,
    usableHeight: usableH,
    offsetX,
    offsetY,
  };
}
