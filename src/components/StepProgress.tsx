// Step progress indicator

import { Check } from 'lucide-react';

interface StepInfo {
  num: number;
  label: string;
  sublabel: string;
}

const STEPS: StepInfo[] = [
  { num: 1, label: 'Upload',    sublabel: 'Choose photo' },
  { num: 2, label: 'Crop',      sublabel: 'Adjust frame' },
  { num: 3, label: 'Settings',  sublabel: 'Configure layout' },
  { num: 4, label: 'Preview',   sublabel: 'Review sheet' },
  { num: 5, label: 'Download',  sublabel: 'Get your PDF' },
];

interface Props {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxReachableStep: number;
}

export default function StepProgress({ currentStep, onStepClick, maxReachableStep }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {STEPS.map((step, idx) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;
        const isClickable = step.num <= maxReachableStep && onStepClick;

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : undefined }}>
            {/* Step node */}
            <div
              onClick={() => isClickable && onStepClick(step.num)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: isClickable ? 'pointer' : 'default' }}
              id={`step-${step.num}-indicator`}
            >
              <div
                className={`step-badge ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
                style={{ 
                  boxShadow: isActive ? 'var(--accent-glow) 0 0 12px' : 'none',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
                }}
              >
                {isDone ? <Check size={14} /> : step.num}
              </div>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: isActive ? 'var(--text-primary)' : isDone ? 'var(--success)' : 'var(--text-secondary)',
                  transition: 'color 0.3s'
                }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{step.sublabel}</div>
              </div>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                margin: '-26px 8px 0',
                background: isDone
                  ? 'var(--success)'
                  : isActive
                    ? 'linear-gradient(to right, var(--accent), var(--border))'
                    : 'var(--border)',
                borderRadius: 1,
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
