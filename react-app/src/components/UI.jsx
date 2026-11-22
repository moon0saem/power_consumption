export function StepHeading({ number, title, done = false }) {
  return <div className="step-heading"><span className={done ? 'step-dot done' : 'step-dot'}>{done ? '✓' : number}</span><div><small>STEP {number}</small><h3>{title}</h3></div></div>
}

export function Notice({ type = 'info', children }) {
  return <div className={`notice ${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div>
}

export function RangeField({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return <label className="range-field"><span><b>{label}</b><output>{value}{unit}</output></span><input type="range" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} /></label>
}
