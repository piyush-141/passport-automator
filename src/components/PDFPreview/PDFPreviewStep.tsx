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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Success header */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        background: 'linear-gradient(135deg, var(--bg-card-hover), var(--bg-primary))',
        borderColor: 'var(--border)',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--success-glow)',
          border: '1.5px solid var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Check size={28} style={{ color: 'var(--success)' }} />
        </div>
        <div>
          <div className="apple-h2" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            PDF Generated Successfully!
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {pdfLayout
              ? `${pdfLayout.total} passport photos · ${pdfLayout.cols}×${pdfLayout.rows} layout · Print-accurate sizing`
              : 'Your print-ready PDF is ready to download.'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => setStep(4)}
            id="back-preview-btn"
            type="button"
            style={{ padding: '10px 20px', fontSize: 15 }}
          >
            ← Back
          </button>
          <button
            className="btn-success"
            onClick={handleDownload}
            id="download-pdf-btn"
            type="button"
            style={{ padding: '10px 20px', fontSize: 15 }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Print Warning */}
      <div className="warning-box warning-yellow" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Printer size={22} color="var(--warning)" style={{ flexShrink: 0, marginTop: 4 }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)', marginBottom: 6 }}>
            Important Printing Instructions
          </div>
          <ul style={{ fontSize: 14, color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 2.0, fontWeight: 500 }}>
            <li>Print at <strong style={{ color: 'var(--text-primary)' }}>100% scale</strong> or <strong style={{ color: 'var(--text-primary)' }}>Actual Size</strong> (Do NOT select Fit/Shrink to page)</li>
            <li>Use the <strong style={{ color: 'var(--text-primary)' }}>50mm calibration ruler</strong> printed at the bottom of the sheet to verify scaling</li>
            <li>Select <strong style={{ color: 'var(--text-primary)' }}>Photo Paper</strong> and set the print quality to <strong style={{ color: 'var(--text-primary)' }}>High/Best</strong></li>
          </ul>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="preview-wrapper"
        style={{ height: 640, position: 'relative' }}
      >
        <iframe
          ref={iframeRef}
          id="pdf-preview-frame"
          className="pdf-preview-frame"
          title="PDF Preview"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 18 }}
        />
      </div>

      {/* Stats & privacy reminder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Download again */}
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="apple-h3" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            📥 Download & Print
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your print-accurate PDF is saved in local memory. Click download to save it to your device and open it with your printer.
          </p>
          <button className="btn-success" onClick={handleDownload} id="download-pdf-2" type="button" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', height: 44 }}>
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {/* Start over */}
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="apple-h3" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            🔄 Start a New Sheet
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            All current images, crops, and layouts will be securely wiped from your browser's memory. Start fresh with another photo.
          </p>
          <button className="btn-secondary" onClick={handleStartOver} id="start-over-btn" type="button" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', height: 44 }}>
            <RotateCcw size={16} />
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
