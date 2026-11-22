import { groupEnergyForChart } from './calculations.js'

export default function EnergyChart({ before, current, showComparison = false }) {
  const beforeItems = groupEnergyForChart(before)
  const currentItems = groupEnergyForChart(current)
  const currentById = new Map(currentItems.map((item) => [item.id, item]))
  const maximum = Math.max(...beforeItems.map((item) => item.kwh), ...currentItems.map((item) => item.kwh), 0.01)
  return (
    <div className="home-energy-chart" role="img" aria-label="기기별 하루 전기 에너지 사용량 비교 그래프">
      {beforeItems.map((item) => {
        const currentItem = currentById.get(item.id) || item
        return (
          <div className="energy-chart-row" key={item.id}>
            <span className="energy-chart-label"><i aria-hidden="true">{item.icon}</i>{item.name}</span>
            <div className="energy-chart-bars">
              <div><small>{showComparison ? '처음' : '사용량'}</small><span className="before-bar" style={{ width: `${Math.max(2, item.kwh / maximum * 100)}%` }} /></div>
              {showComparison && <div><small>현재</small><span className="current-bar" style={{ width: `${Math.max(2, currentItem.kwh / maximum * 100)}%` }} /></div>}
            </div>
            <strong>{Math.round(currentItem.kwh * 1000).toLocaleString()}<small> Wh</small></strong>
          </div>
        )
      })}
      <div className="chart-legend"><span><i className="before-key" />처음 생활 습관</span>{showComparison && <span><i className="current-key" />현재</span>}</div>
    </div>
  )
}
