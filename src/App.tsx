import './index.css';
import { useAppStore } from './store/appStore';
import StepProgress from './components/StepProgress';
import UploadStep from './components/Upload/UploadStep';
import CropStep from './components/Cropper/CropStep';
import SettingsStep from './components/Settings/SettingsStep';
import PreviewStep from './components/LayoutPreview/PreviewStep';
import PDFPreviewStep from './components/PDFPreview/PDFPreviewStep';
import { Shield } from 'lucide-react';

function App() {
  const { currentStep, setStep, rawImageUrl, croppedImageUrl, pdfUrl } = useAppStore();

  // Determine max reachable step for back-navigation
  const maxReachable = pdfUrl ? 5 : croppedImageUrl ? 4 : rawImageUrl ? 3 : 1;

  const stepContent = {
    1: <UploadStep />,
    2: <CropStep />,
    3: <SettingsStep />,
    4: <PreviewStep />,
    5: <PDFPreviewStep />,
  }[currentStep];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="top-glow" />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent), #22d3a5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}>
              📷
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
                <span className="gradient-text">PassportSnap</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Privacy-First Photo Generator
              </div>
            </div>
          </div>

          {/* Privacy pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'rgba(34,211,165,0.08)',
            border: '1px solid rgba(34,211,165,0.2)',
            borderRadius: 20,
            fontSize: 11,
            color: 'var(--success)',
            fontWeight: 600,
          }}>
            <Shield size={12} />
            100% Local
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1160, width: '100%', margin: '0 auto', padding: '20px 24px' }}>
        {/* Step Progress */}
        <div style={{ marginBottom: 24 }}>
          <StepProgress
            currentStep={currentStep}
            onStepClick={(s) => {
              if (s <= maxReachable) setStep(s as 1 | 2 | 3 | 4 | 5);
            }}
            maxReachableStep={maxReachable}
          />
        </div>

        {/* Step Content Card */}
        <div
          className="glass-card"
          style={{ padding: '20px 28px' }}
          key={currentStep}
        >
          {/* Compact step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '3px 10px',
              background: 'var(--accent-glow)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 20,
              fontSize: 10, fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}>
              {currentStep}/5
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
              {{
                1: 'Upload Your Passport Photo',
                2: 'Crop & Frame',
                3: 'Configure Layout',
                4: 'Preview Your Sheet',
                5: 'Download PDF',
              }[currentStep]}
            </h1>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 4 }}>
              {{
                1: '— JPG/PNG, nothing is sent to any server',
                2: '— Fixed aspect ratio, drag to reposition',
                3: '— Page size, copies, margins & borders',
                4: '— Review layout before generating',
                5: '— Print at 100% scale, Actual Size',
              }[currentStep]}
            </span>
          </div>

          {/* Step content */}
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {stepContent}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          🔒 PassportSnap — All image processing happens in your browser. Zero server uploads. Zero storage. Zero tracking.
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Built with React + pdf-lib · Fully open source · Privacy by design
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
