// Settings step — compact 3-column layout, no-scroll

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { PAGE_SIZES, PASSPORT_SIZES, calculateLayout } from '../../utils/measurement';

function SliderRow({
  label, value, min, max, step, onChange, id, unit = 'mm', hint
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; id: string; unit?: string; hint?: string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <label className="form-label" style={{ margin: 0 }} htmlFor={id}>{label}</label>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
          {value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} id={id} />
      {hint && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export default function SettingsStep() {
  const store = useAppStore();
  const {
    passportSizeId, setPassportSize, customPassportW, customPassportH, setCustomPassport,
    pageSizeId, setPageSize, customPageW, customPageH, setCustomPage,
    copies, setCopies, margin, setMargin, spacing, setSpacing, border, setBorder,
    setStep, croppedImageUrl,
  } = store;

  const passDims = store.getPassportDimensions();
  const pageDims = store.getPageDimensions();

  const layout = calculateLayout(
    pageDims.width, pageDims.height,
    passDims.width, passDims.height,
    margin, spacing, border,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Photo preview bar */}
      {croppedImageUrl && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          border: '1px solid var(--border)',
        }}>
          <img src={croppedImageUrl} alt="Cropped passport photo"
            style={{ width: 50, height: 64, objectFit: 'cover', borderRadius: 4, border: '2px solid var(--border-bright)' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Photo Ready</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              300 DPI · {passDims.width}×{passDims.height}mm
            </div>
          </div>
          <button className="btn-secondary" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 12 }}
            onClick={() => setStep(2)} id="recrop-btn" type="button">
            <ArrowLeft size={12} /> Re-crop
          </button>
        </div>
      )}

      {/* 3-column main settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Col 1: Passport size */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            📐 Photo Size
          </div>
          <label className="form-label" htmlFor="passport-size-select">Preset</label>
          <select className="form-select" value={passportSizeId}
            onChange={(e) => setPassportSize(e.target.value)} id="passport-size-select">
            {PASSPORT_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          {passportSizeId === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <div>
                <label className="form-label" htmlFor="custom-pw">W (mm)</label>
                <input className="form-input" type="number" min={20} max={100} step={0.5}
                  value={customPassportW} id="custom-pw"
                  onChange={(e) => setCustomPassport(Number(e.target.value), customPassportH)} />
              </div>
              <div>
                <label className="form-label" htmlFor="custom-ph">H (mm)</label>
                <input className="form-input" type="number" min={20} max={100} step={0.5}
                  value={customPassportH} id="custom-ph"
                  onChange={(e) => setCustomPassport(customPassportW, Number(e.target.value))} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
            {passDims.width} × {passDims.height} mm
          </div>
        </div>

        {/* Col 2: Page size */}
        <div className="glass-card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            📄 Paper Size
          </div>
          <label className="form-label" htmlFor="page-size-select">Preset</label>
          <select className="form-select" value={pageSizeId}
            onChange={(e) => setPageSize(e.target.value)} id="page-size-select">
            {PAGE_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          {pageSizeId === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <div>
                <label className="form-label" htmlFor="custom-pgw">W (mm)</label>
                <input className="form-input" type="number" min={50} max={500} step={1}
                  value={customPageW} id="custom-pgw"
                  onChange={(e) => setCustomPage(Number(e.target.value), customPageH)} />
              </div>
              <div>
                <label className="form-label" htmlFor="custom-pgh">H (mm)</label>
                <input className="form-input" type="number" min={50} max={500} step={1}
                  value={customPageH} id="custom-pgh"
                  onChange={(e) => setCustomPage(customPageW, Number(e.target.value))} />
              </div>
            </div>
          )}

          <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
            {pageDims.width} × {pageDims.height} mm
          </div>
        </div>

        {/* Col 3: Layout sliders */}
        <div className="glass-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            ⚙️ Layout
          </div>

          <SliderRow label="Copies" value={copies} min={0} max={layout.total} step={1}
            onChange={setCopies} id="copies-slider" unit="" 
            hint={copies === 0 ? `Auto (${layout.total} photos, ${layout.cols}×${layout.rows})` : `${layout.cols}×${layout.rows} grid`} />

          <SliderRow label="Margin" value={margin} min={0} max={20} step={0.5}
            onChange={setMargin} id="margin-slider" />

          <SliderRow label="Spacing" value={spacing} min={0} max={10} step={0.5}
            onChange={setSpacing} id="spacing-slider" />

          <SliderRow label="Border" value={border} min={0} max={3} step={0.5}
            onChange={setBorder} id="border-slider"
            hint={border === 0 ? 'No border' : `${border}mm black border`} />
        </div>
      </div>

      {/* Summary bar + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          flex: 1, padding: '10px 16px',
          background: 'var(--bg-secondary)',
          borderRadius: 10, border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 20, fontSize: 12,
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Grid: <strong style={{ color: 'var(--accent)' }}>{layout.cols}×{layout.rows}</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Photos: <strong style={{ color: 'var(--accent)' }}>{copies === 0 ? layout.total : Math.min(copies, layout.total)}</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Max per page: <strong style={{ color: 'var(--success)' }}>{layout.total}</strong>
          </span>
        </div>
        <button className="btn-primary" onClick={() => setStep(4)}
          id="go-to-preview-btn" type="button">
          Preview Layout <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
