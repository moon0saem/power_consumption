import { calculateSavingsImpact } from './calculations.js'

export default function DietReport({ comparison, changes, onClose }) {
  const impact = calculateSavingsImpact(comparison)
  return (
    <section className="diet-result-modal report-only" role="dialog" aria-modal="true" aria-labelledby="diet-result-title">
      <button type="button" className="modal-close" onClick={onClose} aria-label="결과 리포트 닫기">×</button>
      <span className="result-kicker">나의 에너지 다이어트 리포트</span>
      <h2 id="diet-result-title">내가 만든 변화의 결과</h2>

      <div className="report-energy-flow">
        <article><span>처음 사용량</span><strong>{Math.round(comparison.before.total * 1000).toLocaleString()}</strong><small>Wh/day</small></article>
        <i aria-hidden="true">→</i>
        <article className="current"><span>현재 사용량</span><strong>{Math.round(comparison.current.total * 1000).toLocaleString()}</strong><small>Wh/day</small></article>
        <article className="rate"><span>절감률</span><strong>{comparison.rate.toFixed(1)}%</strong></article>
      </div>

      <div className="report-effects">
        <article><i aria-hidden="true">☁️</i><span>월간 탄소 배출량</span><div><b>{impact.monthlyCo2Before}</b><em>→</em><strong>{impact.monthlyCo2After}</strong><small>kgCO₂e</small></div></article>
        <article><i aria-hidden="true">💰</i><span>월간 예상 전기 에너지 비용 절감 효과</span><strong>{impact.monthlyCostSaved.toLocaleString()}<small>원</small></strong></article>
        <article><i aria-hidden="true">🌲</i><span>연간 소나무 흡수량 환산 효과</span><strong>{impact.annualTreeEffect.toFixed(1)}<small>그루</small></strong></article>
      </div>

      <p className="report-assumption">이 결과에는 이해를 돕기 위한 교육용 가정이 포함되어 있습니다.</p>

      <div className="changed-actions report-actions-list"><h3>내가 변경한 행동</h3>{changes.length ? <ul>{changes.map((change) => <li key={change}><i>✓</i>{change}</li>)}</ul> : <p>변경한 행동이 없습니다.</p>}</div>
      <button type="button" className="primary full" onClick={onClose}>리포트 확인 완료</button>
    </section>
  )
}
