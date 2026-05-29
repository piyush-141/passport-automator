// Global app state with Zustand (no localStorage/IndexedDB - RAM only)

import { create } from 'zustand';
import { PAGE_SIZES, PASSPORT_SIZES } from '../utils/measurement';

export type Step = 1 | 2 | 3 | 4 | 5;

export interface AppState {
  // Navigation
  currentStep: Step;
  setStep: (s: Step) => void;

  // Image upload (object URLs live in RAM, revoked on change)
  rawImageUrl: string | null;
  rawImageFile: File | null;
  setRawImage: (file: File, url: string) => void;
  clearRawImage: () => void;

  // Cropped image
  croppedImageBlob: Blob | null;
  croppedImageUrl: string | null;
  setCroppedImage: (blob: Blob, url: string) => void;
  clearCroppedImage: () => void;

  // Crop settings
  cropZoom: number;
  setCropZoom: (z: number) => void;

  // Passport size
  passportSizeId: string;
  customPassportW: number;
  customPassportH: number;
  setPassportSize: (id: string) => void;
  setCustomPassport: (w: number, h: number) => void;
  getPassportDimensions: () => { width: number; height: number };

  // Page size
  pageSizeId: string;
  customPageW: number;
  customPageH: number;
  setPageSize: (id: string) => void;
  setCustomPage: (w: number, h: number) => void;
  getPageDimensions: () => { width: number; height: number };

  // Layout
  copies: number;          // 0 = auto-fit
  margin: number;          // mm
  spacing: number;         // mm
  border: number;          // mm
  gridColsOverride: number | null;
  gridRowsOverride: number | null;
  alignment: 'center' | 'left';
  setCopies: (n: number) => void;
  setMargin: (n: number) => void;
  setSpacing: (n: number) => void;
  setBorder: (n: number) => void;
  setGridColsOverride: (n: number | null) => void;
  setGridRowsOverride: (n: number | null) => void;
  setAlignment: (a: 'center' | 'left') => void;
  resetSettings: () => void;

  // PDF result
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  pdfLayout: { cols: number; rows: number; total: number } | null;
  setPdfResult: (blob: Blob, url: string, layout: { cols: number; rows: number; total: number }) => void;
  clearPdf: () => void;

  // UI state
  isGeneratingPdf: boolean;
  setGeneratingPdf: (v: boolean) => void;
  pdfError: string | null;
  setPdfError: (e: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: 1,
  setStep: (s) => set({ currentStep: s }),

  // Raw image
  rawImageUrl: null,
  rawImageFile: null,
  setRawImage: (file, url) => {
    const prev = get().rawImageUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ rawImageUrl: url, rawImageFile: file });
  },
  clearRawImage: () => {
    const url = get().rawImageUrl;
    if (url) URL.revokeObjectURL(url);
    set({ rawImageUrl: null, rawImageFile: null });
  },

  // Cropped image
  croppedImageBlob: null,
  croppedImageUrl: null,
  setCroppedImage: (blob, url) => {
    const prev = get().croppedImageUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ croppedImageBlob: blob, croppedImageUrl: url });
  },
  clearCroppedImage: () => {
    const url = get().croppedImageUrl;
    if (url) URL.revokeObjectURL(url);
    set({ croppedImageBlob: null, croppedImageUrl: null });
  },

  cropZoom: 1,
  setCropZoom: (z) => set({ cropZoom: z }),

  // Passport size
  passportSizeId: '28x32',
  customPassportW: 28,
  customPassportH: 32,
  setPassportSize: (id) => set({ passportSizeId: id }),
  setCustomPassport: (w, h) => set({ customPassportW: w, customPassportH: h }),
  getPassportDimensions: () => {
    const { passportSizeId, customPassportW, customPassportH } = get();
    if (passportSizeId === 'custom') return { width: customPassportW, height: customPassportH };
    const found = PASSPORT_SIZES.find(p => p.id === passportSizeId);
    return found ? { width: found.width, height: found.height } : { width: 28, height: 32 };
  },

  // Page size
  pageSizeId: '4x6',
  customPageW: 101.6,
  customPageH: 152.4,
  setPageSize: (id) => set({ pageSizeId: id }),
  setCustomPage: (w, h) => set({ customPageW: w, customPageH: h }),
  getPageDimensions: () => {
    const { pageSizeId, customPageW, customPageH } = get();
    if (pageSizeId === 'custom') return { width: customPageW, height: customPageH };
    const found = PAGE_SIZES.find(p => p.id === pageSizeId);
    return found ? { width: found.width, height: found.height } : { width: 210, height: 297 };
  },

  // Layout
  copies: 12,     // fixed 12 copies by default
  margin: 5,      // mm
  spacing: 2,     // mm
  border: 0.5,    // mm
  gridColsOverride: null,
  gridRowsOverride: null,
  alignment: 'center',
  setCopies: (n) => set({ copies: n }),
  setMargin: (n) => set({ margin: n }),
  setSpacing: (n) => set({ spacing: n }),
  setBorder: (n) => set({ border: n }),
  setGridColsOverride: (n) => set({ gridColsOverride: n }),
  setGridRowsOverride: (n) => set({ gridRowsOverride: n }),
  setAlignment: (a) => set({ alignment: a }),
  resetSettings: () => set({
    copies: 12,
    margin: 5,
    spacing: 2,
    border: 0.5,
    gridColsOverride: null,
    gridRowsOverride: null,
    alignment: 'center',
    passportSizeId: '28x32',
    customPassportW: 28,
    customPassportH: 32,
    pageSizeId: '4x6',
    customPageW: 101.6,
    customPageH: 152.4,
    cropZoom: 1,
  }),

  // PDF
  pdfBlob: null,
  pdfUrl: null,
  pdfLayout: null,
  setPdfResult: (blob, url, layout) => {
    const prev = get().pdfUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ pdfBlob: blob, pdfUrl: url, pdfLayout: layout });
  },
  clearPdf: () => {
    const url = get().pdfUrl;
    if (url) URL.revokeObjectURL(url);
    set({ pdfBlob: null, pdfUrl: null, pdfLayout: null });
  },

  // UI
  isGeneratingPdf: false,
  setGeneratingPdf: (v) => set({ isGeneratingPdf: v }),
  pdfError: null,
  setPdfError: (e) => set({ pdfError: e }),
}));
