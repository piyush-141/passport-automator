// Preview step — compact 2-column layout: canvas left, info+CTA right

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, FileDown, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { calculateLayout } from '../../utils/measurement';
import { renderPreviewCanvas } from '../../utils/canvas';
import { generatePassportPDF } from '../../utils/pdf';

export default function PreviewStep() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const store = useAppStore();
  const {
    croppedImageBlob,
    margin, spacing, border, copies,
    setStep, setPdfResult, setGeneratingPdf,
    isGeneratingPdf, pdfError, setPdfError,
  } = store;

  const passDims = store.getPassportDimensions();
  const pageDims = store.getPageDimensions();

  const layout = calculateLayout(
    pageDims.width, pageDims.height,
    passDims.width, passDims.height,
    margin, spacing, border,
    store.gridColsOverride,
    store.gridRowsOverride,
    store.alignment,
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    renderPreviewCanvas({
      pageWidthMm: pageDims.width,
      pageHeightMm: pageDims.height,
      photoWidthMm: passDims.width,
      photoHeightMm: passDims.height,
      marginMm: margin,
      spacingMm: spacing,
      borderMm: border,
      cols: layout.cols,
      rows: layout.rows,
      offsetXMm: layout.offsetX,
      offsetYMm: layout.offsetY,
      croppedImageBlob: croppedImageBlob,
      canvasEl: canvasRef.current,
    });
  }, [pageDims, passDims, margin, spacing, border, layout, croppedImageBlob]);

  const handleGeneratePDF = async () => {
    if (!croppedImageBlob) return;
    setGeneratingPdf(true);
    setPdfError(null);
    try {
      const result = await generatePassportPDF({
        croppedImageBlob,
        pageWidthMm: pageDims.width,
        pageHeightMm: pageDims.height,
        photoWidthMm: passDims.width,
        photoHeightMm: passDims.height,
        marginMm: margin,
        spacingMm: spacing,
        borderMm: border,
        copies,
        gridColsOverride: store.gridColsOverride,
        gridRowsOverride: store.gridRowsOverride,
        alignment: store.alignment,
      });
      setPdfResult(result.blob, result.url, result.layout);
      setStep(5);
    } catch (err) {
      setPdfError(String(err));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const photoCount = copies === 0 ? layout.total : Math.min(copies, layout.total);

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Left: Canvas preview */}
      <div
        className="preview-wrapper"
        style={{
          flex: '2 1 450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          minHeight: 400,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Zoom controls overlay */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          display: 'flex', gap: 8, zIndex: 2,
          background: 'rgba(var(--bg-secondary), 0.7)',
          backdropFilter: 'blur(8px)',
          padding: '4px',
          borderRadius: 9999,
          border: '1px solid var(--border)',
        }}>
          <button className="btn-secondary" style={{ padding: '6px 10px', borderRadius: 9999, fontSize: 13, height: 32, width: 32, border: 'none' }}
            onClick={() => setPreviewScale(s => Math.max(0.4, s - 0.15))}
            id="zoom-out-preview" type="button" title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600 }}>
            {Math.round(previewScale * 100)}%
          </span>
          <button className="btn-secondary" style={{ padding: '6px 10px', borderRadius: 9999, fontSize: 13, height: 32, width: 32, border: 'none' }}
            onClick={() => setPreviewScale(s => Math.min(2, s + 0.15))}
            id="zoom-in-preview" type="button" title="Zoom in">
            <ZoomIn size={14} />
          </button>
        </div>

        <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
          <canvas
            ref={canvasRef}
            id="layout-preview-canvas"
            style={{ boxShadow: 'var(--shadow-product)', borderRadius: 4, display: 'block' }}
          />
        </div>
      </div>

      {/* Right: Info + CTA */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Layout stats */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Sheet Specification
          </div>
          {[
            { label: 'Photo size', val: `${passDims.width}×${passDims.height}mm` },
            { label: 'Paper size', val: `${pageDims.width}×${pageDims.height}mm` },
            { label: 'Grid dimensions', val: `${layout.cols} × ${layout.rows}` },
            { label: 'Copies selected', val: `${photoCount} photos` },
            { label: 'Border thickness', val: border === 0 ? 'None' : `${border}mm` },
            { label: 'Photo spacing', val: `${spacing}mm` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, borderBottom: '1px solid rgba(var(--border), 0.1)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Print tip */}
        <div className="warning-box warning-yellow" style={{ fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 6, fontSize: 14 }}>⚠️ Print at 100% Scale</div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Ensure "Fit to Page" is disabled. Select "Actual Size" in your printer settings to guarantee correct physical dimensions.
          </span>
        </div>

        {/* Error */}
        {pdfError && (
          <div className="warning-box" style={{ color: 'var(--danger)', fontSize: 14 }}>
            ❌ {pdfError}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setStep(3)}
            id="back-settings-btn" type="button" style={{ justifyContent: 'center', width: '100%' }}>
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <button
            className="btn-success"
            onClick={handleGeneratePDF}
            disabled={isGeneratingPdf || !croppedImageBlob}
            id="generate-pdf-btn"
            type="button"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            {isGeneratingPdf ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Generating...
              </>
            ) : (
              <>
                <FileDown size={16} />
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
