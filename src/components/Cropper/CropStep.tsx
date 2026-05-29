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
    <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
      {/* Left: Cropper */}
      <div
        className="cropper-container-wrapper"
        style={{ flex: 1, minHeight: 380, position: 'relative' }}
      >
        <Cropper
          image={rawImageUrl}
          crop={crop}
          zoom={cropZoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setCropZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 12 },
            cropAreaStyle: {
              border: '2px solid rgba(108,99,255,0.9)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            },
          }}
        />
      </div>

      {/* Right: Controls panel */}
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Aspect ratio selector */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Photo Size (Aspect Ratio)
          </div>
          <select
            className="form-select"
            value={passportSizeId}
            onChange={(e) => setPassportSize(e.target.value)}
            id="crop-passport-size-select"
            style={{ fontSize: 13 }}
          >
            {PASSPORT_SIZES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            Ratio locked: {dims.width}:{dims.height}
          </div>
        </div>

        {/* Zoom */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zoom</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{cropZoom.toFixed(1)}×</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-secondary" style={{ padding: '5px 9px' }}
              onClick={() => setCropZoom(Math.max(1, cropZoom - 0.1))} id="zoom-out-btn" type="button">
              <ZoomOut size={13} />
            </button>
            <input type="range" min={1} max={3} step={0.01} value={cropZoom}
              onChange={(e) => setCropZoom(Number(e.target.value))} style={{ flex: 1 }} id="zoom-slider" />
            <button className="btn-secondary" style={{ padding: '5px 9px' }}
              onClick={() => setCropZoom(Math.min(3, cropZoom + 0.1))} id="zoom-in-btn" type="button">
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        {/* Rotation */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rotation</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{rotation}°</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-secondary" style={{ padding: '5px 9px' }}
              onClick={() => setRotation(r => r - 90)} id="rotate-left-btn" type="button">
              <RotateCw size={13} style={{ transform: 'scaleX(-1)' }} />
            </button>
            <input type="range" min={-180} max={180} step={1} value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))} style={{ flex: 1 }} id="rotation-slider" />
            <button className="btn-secondary" style={{ padding: '5px 9px' }}
              onClick={() => setRotation(r => r + 90)} id="rotate-right-btn" type="button">
              <RotateCw size={13} />
            </button>
          </div>
        </div>

        {/* Tip */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}>
          💡 Drag the image to reposition. The crop frame stays fixed at the selected ratio.
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-secondary" onClick={() => setStep(1)}
            id="back-to-upload" type="button" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={13} /> Change Photo
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            id="confirm-crop-btn"
            type="button"
            style={{ justifyContent: 'center' }}
          >
            {isProcessing ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Processing...
              </>
            ) : (
              <>
                <Check size={14} />
                Confirm & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
