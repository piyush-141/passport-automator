// PDF Preview and Download step

import { useEffect, useRef } from 'react';
import { Download, RotateCcw, Printer, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export default function PDFPreviewStep() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { pdfUrl, pdfBlob, pdfLayout, setStep, clearPdf, clearCroppedImage, clearRawImage } = useAppStore();

  useEffect(() => {
    if (iframeRef.current && pdfUrl) {
      iframeRef.current.src = pdfUrl;
    }
  }, [pdfUrl]);

  const handleDownload = () => {
    if (!pdfBlob) return;
    const a = document.createElement('a');
    const tempUrl = URL.createObjectURL(pdfBlob);
    a.href = tempUrl;
    a.download = `passport-photos-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke the temp URL, the main pdfUrl stays for preview
    setTimeout(() => URL.revokeObjectURL(tempUrl), 2000);
  };

  const handleStartOver = () => {
    clearPdf();
    clearCroppedImage();
    clearRawImage();
    setStep(1);
  };

  if (!pdfUrl) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
        No PDF generated yet. Go back to generate one.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Success header */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: 'linear-gradient(135deg, rgba(34,211,165,0.08), rgba(108,99,255,0.08))',
        borderColor: 'rgba(34,211,165,0.2)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--success-glow)',
          border: '1px solid rgba(34,211,165,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={24} color="var(--success)" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)', marginBottom: 2 }}>
            PDF Generated Successfully!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {pdfLayout
              ? `${pdfLayout.total} passport photos · ${pdfLayout.cols}×${pdfLayout.rows} layout · Print-accurate sizing`
              : 'Your print-ready PDF is ready to download.'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button
            className="btn-secondary"
            onClick={() => setStep(4)}
            id="back-preview-btn"
            type="button"
          >
            ← Back
          </button>
          <button
            className="btn-success"
            onClick={handleDownload}
            id="download-pdf-btn"
            type="button"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Print Warning */}
      <div className="warning-box" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Printer size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>
            Important Printing Instructions
          </div>
          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Print at <strong style={{ color: 'var(--text-primary)' }}>100% scale</strong> or <strong style={{ color: 'var(--text-primary)' }}>Actual Size</strong></li>
            <li>Disable <strong style={{ color: 'var(--text-primary)' }}>"Fit to Page"</strong> or <strong style={{ color: 'var(--text-primary)' }}>"Shrink to Page"</strong></li>
            <li>Use the <strong style={{ color: 'var(--text-primary)' }}>50mm calibration ruler</strong> at the bottom of the page to verify scaling</li>
            <li>Select <strong style={{ color: 'var(--text-primary)' }}>Photo Paper</strong> for best print quality</li>
          </ul>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="preview-wrapper"
        style={{ height: 600, position: 'relative' }}
      >
        <iframe
          ref={iframeRef}
          id="pdf-preview-frame"
          className="pdf-preview-frame"
          title="PDF Preview"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
        />
      </div>

      {/* Stats & privacy reminder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Download again */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            📥 Download & Print
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            Your PDF is ready. Click download and open with your printer software.
          </p>
          <button className="btn-success" onClick={handleDownload} id="download-pdf-2" type="button" style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={14} />
            Download PDF
          </button>
        </div>

        {/* Start over */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            🔄 Create Another
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            All images will be cleared from memory. Start fresh with a new photo.
          </p>
          <button className="btn-secondary" onClick={handleStartOver} id="start-over-btn" type="button" style={{ width: '100%', justifyContent: 'center' }}>
            <RotateCcw size={14} />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
