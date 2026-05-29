// Crop step — compact 2-column layout: cropper left, controls right

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, Check, ArrowLeft, RotateCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getCroppedImg } from '../../utils/canvas';
import { PASSPORT_SIZES } from '../../utils/measurement';

interface CropAreaResult {
  x: number; y: number; width: number; height: number;
}

export default function CropStep() {
  const {
    rawImageUrl, passportSizeId,
    getPassportDimensions, setCroppedImage, setStep,
    cropZoom, setCropZoom, setPassportSize,
  } = useAppStore();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropAreaResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);

  const dims = getPassportDimensions();
  const aspect = dims.width / dims.height;

  const onCropComplete = useCallback((_: unknown, areaPixels: CropAreaResult) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!rawImageUrl || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const dpiScale = 300 / 25.4;
      const targetW = Math.round(dims.width * dpiScale);
      const targetH = Math.round(dims.height * dpiScale);
      const { blob, url } = await getCroppedImg(rawImageUrl, croppedAreaPixels, targetW, targetH);
      setCroppedImage(blob, url);
      setStep(3);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!rawImageUrl) return null;

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Left: Cropper */}
      <div
        className="cropper-container-wrapper"
        style={{ flex: '2 1 450px', minHeight: 420, position: 'relative' }}
      >
        <Cropper
          image={rawImageUrl || undefined}
          crop={crop}
          zoom={cropZoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setCropZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 18 },
            cropAreaStyle: {
              border: '2.5px solid var(--accent)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.78)',
            },
          }}
        />
      </div>

      {/* Right: Controls panel */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Aspect ratio selector */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Photo Size (Aspect Ratio)
          </div>
          <select
            className="form-select"
            value={passportSizeId}
            onChange={(e) => setPassportSize(e.target.value)}
            id="crop-passport-size-select"
            style={{ fontSize: 15 }}
          >
            {PASSPORT_SIZES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            Ratio locked: {dims.width}:{dims.height}
          </div>
        </div>

        {/* Zoom */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Zoom</span>
            <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>{cropZoom.toFixed(1)}×</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 9999, fontSize: 14 }}
              onClick={() => setCropZoom(Math.max(1, cropZoom - 0.1))} id="zoom-out-btn" type="button">
              <ZoomOut size={15} />
            </button>
            <input type="range" min={1} max={3} step={0.01} value={cropZoom}
              onChange={(e) => setCropZoom(Number(e.target.value))} style={{ flex: 1 }} id="zoom-slider" />
            <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 9999, fontSize: 14 }}
              onClick={() => setCropZoom(Math.min(3, cropZoom + 0.1))} id="zoom-in-btn" type="button">
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Rotation */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rotation</span>
            <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>{rotation}°</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 9999, fontSize: 14 }}
              onClick={() => setRotation(r => r - 90)} id="rotate-left-btn" type="button">
              <RotateCw size={15} style={{ transform: 'scaleX(-1)' }} />
            </button>
            <input type="range" min={-180} max={180} step={1} value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))} style={{ flex: 1 }} id="rotation-slider" />
            <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 9999, fontSize: 14 }}
              onClick={() => setRotation(r => r + 90)} id="rotate-right-btn" type="button">
              <RotateCw size={15} />
            </button>
          </div>
        </div>

        {/* Tip */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          💡 Drag the image to reposition. The crop frame stays fixed at the selected ratio.
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setStep(1)}
            id="back-to-upload" type="button" style={{ justifyContent: 'center', width: '100%' }}>
            <ArrowLeft size={16} /> Change Photo
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            id="confirm-crop-btn"
            type="button"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            {isProcessing ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Processing...
              </>
            ) : (
              <>
                <Check size={16} />
                Confirm & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
