const colors = ['#0f78b8', '#f0a52b', '#55a55a', '#8058b0', '#e46868', '#2aa6a1', '#d67a32', '#6387c7', '#9b7d56']

export default function EnergyPieChart({ items, total }) {
  let cursor = 0
  const segments = items.map((item, index) => {
    const percentage = total > 0 ? item.kwh / total * 100 : 0
    const start = cursor
    cursor += percentage
    return { ...item, percentage, color: colors[index % colors.length], start, end: cursor }
  })
  const gradient = total > 0 ? `conic-gradient(${segments.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(',')})` : '#e5ecef'

  return (
    <div className="energy-pie-layout">
      <div className="energy-donut" style={{ background: gradient }} role="img" aria-label="기기별 하루 전기 에너지 사용량 비율 원형 그래프">
        <div><strong>{Math.round(total * 1000).toLocaleString()}</strong><span>Wh/일</span></div>
      </div>
      <div className="energy-pie-legend">
        {segments.map((item) => <div key={item.id}><i style={{ background: item.color }} /><span><b>{item.name}</b><small>{Math.round(item.kwh * 1000).toLocaleString()} Wh</small></span><strong>{item.percentage.toFixed(1)}%</strong></div>)}
      </div>
    </div>
  )
}
