export default function EnergySummary({ comparison, goal }) {
  const goalReached = comparison.rate >= goal
  return (
    <aside className="live-energy-summary" aria-live="polite">
      <div><span>처음 생활 습관</span><strong>{Math.round(comparison.before.total * 1000).toLocaleString()}<small> Wh/day</small></strong></div>
      <div><span>현재</span><strong>{Math.round(comparison.current.total * 1000).toLocaleString()}<small> Wh/day</small></strong></div>
      <div><span>줄어든 양</span><strong>{Math.round(comparison.saved * 1000).toLocaleString()}<small> Wh/day</small></strong></div>
      <div className={goalReached ? 'goal-reached' : ''}><span>절감률 · 목표 {goal}%</span><strong>{comparison.rate.toFixed(1)}<small>%</small></strong></div>
      <p>{goalReached ? '선택한 목표에 도달했어요. 생활에 필요한 기능도 유지되는지 살펴보세요.' : `목표까지 ${(goal - comparison.rate).toFixed(1)}%p 남았어요.`}</p>
    </aside>
  )
}
