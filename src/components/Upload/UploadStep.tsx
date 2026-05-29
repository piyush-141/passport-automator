import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function UploadStep() {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setRawImage, setStep } = useAppStore();

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG or PNG image.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    const url = URL.createObjectURL(file);
    setRawImage(file, url);
    setStep(2);
  }, [setRawImage, setStep]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Left: Drop zone */}
      <div
        className={`dropzone${dragOver ? ' drag-over' : ''}`}
        style={{
          flex: '2 1 500px',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          textAlign: 'center',
          minHeight: 340,
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        role="button"
        tabIndex={0}
        id="upload-dropzone"
        aria-label="Upload passport photo"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--accent)',
          transition: 'transform 0.3s ease',
        }}>
          {dragOver
            ? <ImageIcon size={32} color="var(--accent)" />
            : <Upload size={32} color="var(--accent)" />
          }
        </div>
        <div>
          <div className="apple-h2" style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {dragOver ? 'Drop your photo here' : 'Upload Passport Photo'}
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Drag & drop or click to browse · JPG, PNG · Max 10MB
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          id="browse-btn"
          type="button"
          style={{ fontSize: 16 }}
        >
          <Upload size={16} />
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={onFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />

        {error && (
          <div className="warning-box" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            color: 'var(--danger)',
            fontSize: 15,
            width: '100%',
            maxWidth: 460,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}
      </div>

      {/* Right: Info column */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Privacy banner */}
        <div className="privacy-banner" style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>🔒</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              100% Private Processing
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your photo never leaves your device. Everything is processed locally in your browser.
            </div>
          </div>
        </div>

        {/* Tips */}
        {[
          { icon: '📸', title: 'Good Lighting', desc: 'Use a well-lit, white background photo' },
          { icon: '😐', title: 'Neutral Expression', desc: 'Face forward, eyes open, mouth closed' },
          { icon: '🎯', title: 'High Resolution', desc: 'Highest quality original for best prints' },
        ].map((tip) => (
          <div key={tip.title} className="glass-card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
