import { calculateSavingsImpact } from './calculations.js'

export default function SavingsImpact({ comparison, compact = false }) {
  const impact = calculateSavingsImpact(comparison)
  const hasSavings = comparison.saved > 0
  return (
    <aside className={`savings-impact ${compact ? 'compact' : ''}`} aria-live="polite">
      <header><span>실시간 시뮬레이션 결과</span><h3>{hasSavings ? '내 선택의 효과가 나타나고 있어요!' : '기기를 눌러 사용 습관을 바꿔 보세요.'}</h3></header>
      <div className="impact-usage"><div><span>처음 사용량</span><strong>{Math.round(comparison.before.total * 1000).toLocaleString()}<small> Wh/day</small></strong></div><i>→</i><div><span>현재 사용량</span><strong>{Math.round(comparison.current.total * 1000).toLocaleString()}<small> Wh/day</small></strong></div></div>
      <div className="impact-metrics">
        <article className={`carbon-impact-card ${hasSavings ? 'positive' : ''}`}><div className="carbon-card-title"><i aria-hidden="true">☁️</i><span>월간 탄소 배출량</span></div><div className="carbon-flow"><div><small>다이어트 전</small><strong>{impact.monthlyCo2Before.toLocaleString()}<em> kgCO₂e</em></strong></div><i>→</i><div><small>다이어트 후</small><strong>{impact.monthlyCo2After.toLocaleString()}<em> kgCO₂e</em></strong></div></div><p>탄소 감축률 <b>{impact.reductionRate.toFixed(1)}%</b></p></article>
        <article className={hasSavings ? 'positive' : ''}><i aria-hidden="true">💰</i><span>월간 예상 전기 에너지 비용 절감 효과</span><strong>{impact.monthlyCostSaved.toLocaleString()}<small>원</small></strong></article>
        <article className={hasSavings ? 'positive' : ''}><i aria-hidden="true">🌲</i><span>연간 소나무 흡수량 환산 효과</span><strong>{impact.annualTreeEffect.toFixed(1)}<small>그루</small></strong></article>
      </div>
      <p>이 결과에는 이해를 돕기 위한 교육용 가정이 포함되어 있습니다.</p>
    </aside>
  )
}
