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
    <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
      {/* Left: Canvas preview */}
      <div
        className="preview-wrapper"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          minHeight: 360,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Zoom controls overlay */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', gap: 6, zIndex: 2,
        }}>
          <button className="btn-secondary" style={{ padding: '5px 8px' }}
            onClick={() => setPreviewScale(s => Math.max(0.4, s - 0.15))}
            id="zoom-out-preview" type="button" title="Zoom out">
            <ZoomOut size={13} />
          </button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            {Math.round(previewScale * 100)}%
          </span>
          <button className="btn-secondary" style={{ padding: '5px 8px' }}
            onClick={() => setPreviewScale(s => Math.min(2, s + 0.15))}
            id="zoom-in-preview" type="button" title="Zoom in">
            <ZoomIn size={13} />
          </button>
        </div>

        <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
          <canvas
            ref={canvasRef}
            id="layout-preview-canvas"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)', borderRadius: 3, display: 'block' }}
          />
        </div>
      </div>

      {/* Right: Info + CTA */}
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Layout stats */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sheet Summary
          </div>
          {[
            { label: 'Photo size', val: `${passDims.width}×${passDims.height}mm` },
            { label: 'Paper', val: `${pageDims.width}×${pageDims.height}mm` },
            { label: 'Grid', val: `${layout.cols} × ${layout.rows}` },
            { label: 'Photos', val: String(photoCount) },
            { label: 'Border', val: border === 0 ? 'None' : `${border}mm` },
            { label: 'Spacing', val: `${spacing}mm` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Print tip */}
        <div className="warning-box" style={{ fontSize: 11, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>⚠️ Print at 100%</div>
          <span style={{ color: 'var(--text-secondary)' }}>
            Disable "Fit to Page". Select "Actual Size" to preserve exact photo dimensions.
          </span>
        </div>

        {/* Error */}
        {pdfError && (
          <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--danger)', fontSize: 12 }}>
            ❌ {pdfError}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setStep(3)}
            id="back-settings-btn" type="button" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={13} /> Back to Settings
          </button>
          <button
            className="btn-success"
            onClick={handleGeneratePDF}
            disabled={isGeneratingPdf || !croppedImageBlob}
            id="generate-pdf-btn"
            type="button"
            style={{ justifyContent: 'center' }}
          >
            {isGeneratingPdf ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Generating...
              </>
            ) : (
              <>
                <FileDown size={15} />
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
