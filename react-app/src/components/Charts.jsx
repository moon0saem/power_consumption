import { useState } from 'react'

export function BarChart({ items, valueKey = 'value', labelKey = 'label', colorKey = 'color', unit = '', ariaLabel, orientation = 'horizontal' }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1)
  return (
    <div className={`bar-chart ${orientation === 'vertical' ? 'vertical' : ''}`} role="img" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const percentage = Math.max(2, value / max * 100)
        const formattedValue = `${Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)}${unit}`
        return (
          <div className="bar-row" key={`${item[labelKey]}-${index}`}>
            <span className="bar-label">{item[labelKey]}</span>
            <div className="bar-track">
              <span className="bar-fill" style={orientation === 'vertical' ? { width: '100%', height: `${percentage}%`, background: item[colorKey] || '#177f70' } : { width: `${percentage}%`, background: item[colorKey] || '#177f70' }} />
              {orientation === 'vertical' && <strong className="bar-value" style={{ bottom: `calc(${percentage}% + 6px)` }}>{formattedValue}</strong>}
            </div>
            {orientation !== 'vertical' && <strong>{formattedValue}</strong>}
          </div>
        )
      })}
    </div>
  )
}

export function ScatterPlot({ items }) {
  const [selected, setSelected] = useState(null)
  const width = 640
  const height = 310
  const pad = 46
  const minX = 0.5
  const maxX = 2.1
  const maxY = 3200
  const x = (v) => pad + ((v - minX) / (maxX - minX)) * (width - pad * 2)
  const y = (v) => height - pad - (v / maxY) * (height - pad * 2)
  return (
    <div className="svg-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="전기 주전자 용량과 소비전력 산점도">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="axis" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="axis" />
        {[0, 1000, 2000, 3000].map((tick) => <g key={tick}><line x1={pad - 5} y1={y(tick)} x2={width - pad} y2={y(tick)} className="grid" /><text x={pad - 9} y={y(tick) + 4} textAnchor="end">{tick}</text></g>)}
        {[0.5, 1, 1.5, 2].map((tick) => <text key={tick} x={x(tick)} y={height - 18} textAnchor="middle">{tick}L</text>)}
        {items.map((item) => <circle className="data-dot" tabIndex="0" role="button" aria-label={`${item.product}, ${item.capacity}리터, ${item.power}와트`} key={item.product} cx={x(item.capacity)} cy={y(item.power)} r={selected?.product === item.product ? 9 : 6} fill={selected?.product === item.product ? '#0b6b5d' : '#e85d4a'} onClick={() => setSelected(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelected(item) }}><title>{item.product}: {item.capacity}L, {item.power}W</title></circle>)}
      </svg>
      <p className="chart-hint">점을 눌러 제품 정보를 확인하세요.</p>
      {selected && <div className="point-popover" role="status"><b>{selected.product}</b><span>용량 {selected.capacity}L</span><span>소비전력 {selected.power.toLocaleString()}W</span></div>}
    </div>
  )
}

export function EnergyGauge({ before, after }) {
  const ratio = before > 0 ? Math.max(0, Math.min(100, after / before * 100)) : 0
  return <div className="energy-gauge" role="img" aria-label={`다이어트 후 에너지 사용량은 이전의 ${ratio.toFixed(1)}퍼센트`} style={{ '--ratio': `${ratio * 3.6}deg` }}>
    <div><strong>{ratio.toFixed(0)}<small>%</small></strong><span>남은 사용량</span></div>
  </div>
}

export function CategorySavings({ before, after }) {
  const rows = Object.keys(before).map((label) => ({ label, saved: Math.max(0, before[label] - after[label]) }))
  const max = Math.max(...rows.map((row) => row.saved), 0.001)
  return <div className="savings-list">{rows.map((row) => <div className="saving-row" key={row.label}><span>{labelIcon(row.label)} {row.label}</span><div><i style={{ width: `${row.saved / max * 100}%` }} /></div><strong>{row.saved.toFixed(1)} kWh</strong></div>)}</div>
}

function labelIcon(label) {
  return { 냉장고: '🧊', 에어컨: '❄️', 'PC/TV': '🖥️', 드라이어: '💨', 대기전력: '🔌' }[label] || '⚡'
}
