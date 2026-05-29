import { useEffect, useState } from 'react';
import './index.css';
import { useAppStore } from './store/appStore';
import StepProgress from './components/StepProgress';
import UploadStep from './components/Upload/UploadStep';
import CropStep from './components/Cropper/CropStep';
import SettingsStep from './components/Settings/SettingsStep';
import PreviewStep from './components/LayoutPreview/PreviewStep';
import PDFPreviewStep from './components/PDFPreview/PDFPreviewStep';
import { Shield, Sun, Moon } from 'lucide-react';

function App() {
  const { currentStep, setStep, rawImageUrl, croppedImageUrl, pdfUrl } = useAppStore();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sync theme with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'background-color 0.4s ease' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 'auto' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              color: '#ffffff',
              boxShadow: 'var(--accent-glow) 0 4px 12px',
              transition: 'transform 0.3s ease',
            }}>
              📷
            </div>
            <div>
              <div className="apple-h1" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                PassportSnap
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                Privacy-First Photo Generator
              </div>
            </div>
          </div>

          {/* Privacy pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            fontSize: 13,
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
            100% Local
          </div>

          {/* Elegant Sun/Moon Sliding Toggle */}
          <div 
            className="theme-switch"
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle light/dark mode"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setTheme(t => t === 'light' ? 'dark' : 'light')}
          >
            <div className="theme-switch-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'light' ? <Sun size={14} style={{ color: '#ff9f0a' }} /> : <Moon size={14} style={{ color: '#0066cc' }} />}
            </div>
            <Sun size={14} style={{ position: 'absolute', left: 9, color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <Moon size={14} style={{ position: 'absolute', right: 9, color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Step Progress */}
        <div>
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
          style={{ padding: '32px', transition: 'background-color 0.4s ease, border-color 0.4s ease' }}
          key={currentStep}
        >
          {/* Accessible, readable step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '4px 12px',
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent)',
              borderRadius: 20,
              fontSize: 12, fontWeight: 700,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}>
              Step {currentStep}/5
            </div>
            <h1 className="apple-h1" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {{
                1: 'Upload Your Passport Photo',
                2: 'Crop & Frame',
                3: 'Configure Layout',
                4: 'Preview Your Sheet',
                5: 'Download PDF',
              }[currentStep]}
            </h1>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', marginLeft: 6 }}>
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
        padding: '32px 24px',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        transition: 'background-color 0.4s ease, border-color 0.4s ease',
      }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
          🔒 PassportSnap — All image processing happens in your browser. Zero server uploads. Zero storage. Zero tracking.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
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
