import { useEffect, useMemo, useState } from 'react'
import { usePersistedState } from '../../hooks/usePersistedState.js'
import { cloneHabits, createInitialHabits } from './appliances.js'
import { calculateEnergyEquivalents, compareHabits, groupEnergyForChart, summarizeComparison } from './calculations.js'
import HouseView from './HouseView.jsx'
import AppliancePanel from './AppliancePanel.jsx'
import EnergyChart from './EnergyChart.jsx'
import EnergyPieChart from './EnergyPieChart.jsx'
import SavingsImpact from './SavingsImpact.jsx'
import DietReport from './DietReport.jsx'
import './home-energy-diet.css'

const STORAGE_PREFIX = 'energy-class:home-diet-v6:'

export default function HomeEnergyDiet() {
  const [stage, setStage] = usePersistedState(`${STORAGE_PREFIX}stage`, 1)
  const [draft, setDraft] = usePersistedState(`${STORAGE_PREFIX}draft`, createInitialHabits())
  const [baseline, setBaseline] = usePersistedState(`${STORAGE_PREFIX}baseline`, null)
  const [diet, setDiet] = usePersistedState(`${STORAGE_PREFIX}diet`, createInitialHabits())
  const [revealedEquivalents, setRevealedEquivalents] = usePersistedState(`${STORAGE_PREFIX}equivalents`, { bicycle: false, ev: false })
  const [selectedId, setSelectedId] = useState('bedroomLight')
  const [showResult, setShowResult] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const safeBaseline = baseline || draft
  const activeHabits = stage === 1 ? draft : stage === 3 ? diet : safeBaseline
  const comparison = useMemo(() => summarizeComparison(safeBaseline, stage === 3 ? diet : safeBaseline), [safeBaseline, diet, stage])
  const changes = useMemo(() => compareHabits(safeBaseline, diet), [safeBaseline, diet])
  const initialChartItems = useMemo(() => groupEnergyForChart(comparison.before), [comparison.before])
  const energyEquivalents = useMemo(() => calculateEnergyEquivalents(comparison.before.total), [comparison.before.total])
  const canStartDiet = revealedEquivalents.bicycle && revealedEquivalents.ev

  useEffect(() => {
    if (!panelOpen) return undefined
    const closeOnOutsidePointer = (event) => {
      if (event.target.closest('.house-appliance-popover') || event.target.closest('.image-hotspot')) return
      setPanelOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [panelOpen])

  const updateSelected = (nextSetting) => {
    if (stage === 1) setDraft({ ...draft, [selectedId]: nextSetting })
    if (stage === 3) setDiet({ ...diet, [selectedId]: nextSetting })
  }

  const selectAppliance = (id) => {
    setSelectedId(id)
    if (stage === 3) setPanelOpen(true)
  }

  const completeSetup = () => {
    const snapshot = cloneHabits(draft)
    setBaseline(snapshot)
    setDiet(cloneHabits(snapshot))
    setRevealedEquivalents({ bicycle: false, ev: false })
    setStage(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startDiet = () => {
    setDiet(cloneHabits(safeBaseline))
    setPanelOpen(false)
    setStage(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetDiet = () => {
    setDiet(cloneHabits(safeBaseline))
    setShowResult(false)
    setPanelOpen(false)
  }

  const resetAll = () => {
    if (!window.confirm('이 새 활동에서 입력한 내용과 진행 상황을 모두 초기화할까요?')) return
    const initial = createInitialHabits()
    setDraft(initial)
    setBaseline(null)
    setDiet(cloneHabits(initial))
    setStage(1)
    setSelectedId('bedroomLight')
    setShowResult(false)
    setPanelOpen(false)
    setRevealedEquivalents({ bicycle: false, ev: false })
  }

  return (
    <div className="home-diet-page">
      <header className="home-diet-hero">
        <div><span>NEW LESSON 02 · 생활 속 적용</span><h1>에너지 다이어트</h1><p>집 안의 전기 기구를 살펴보고, 필요한 생활은 유지하면서 전기 에너지 사용량을 줄여 봅시다.</p></div>
        <button type="button" className="diet-reset-link" onClick={resetAll}>에너지 다이어트 초기화</button>
      </header>

      <nav className="diet-steps" aria-label="에너지 다이어트 진행 단계">
        <button className={stage === 1 ? 'active' : 'complete'} onClick={() => setStage(1)}><i>{stage > 1 ? '✓' : '1'}</i><span><b>전기 기구 사용 습관 입력</b><small>기기를 눌러 사용 습관 입력</small></span></button>
        <em />
        <button disabled={!baseline} className={stage === 2 ? 'active' : stage > 2 ? 'complete' : ''} onClick={() => baseline && setStage(2)}><i>{stage > 2 ? '✓' : '2'}</i><span><b>전기 에너지 사용량 분석</b><small>어떤 기기가 많이 사용할까?</small></span></button>
        <em />
        <button disabled={!baseline || !canStartDiet} className={stage === 3 ? 'active' : ''} onClick={() => baseline && canStartDiet && setStage(3)}><i>3</i><span><b>나만의 다이어트</b><small>사용 습관과 절전 방식 바꾸기</small></span></button>
      </nav>

      {stage === 1 && <section className="diet-stage-intro"><span>STEP 1</span><h2>전기 기구 사용 습관 입력하기</h2><p>우리 집의 정확한 값이 아니어도 괜찮아요. 평소 나의 생활과 비슷하게 설정해 보세요.</p></section>}
      {stage === 2 && <section className="diet-stage-intro"><span>STEP 2</span><h2>전기 에너지 사용량 분석하기</h2><p>내 생활에서는 어떤 전기 기구가 하루 동안 전기 에너지를 많이 사용하고 있을까요?</p></section>}
      {stage === 3 && <section className="diet-stage-intro"><span>STEP 3</span><h2>나만의 에너지 다이어트</h2><p>생활에 필요한 기능은 유지하면서 사용 시간과 절전 방식을 조절해 보세요.</p></section>}

      {stage === 1 && <section className="stage-action-card stage-action-top"><div><span>설정을 마쳤나요?</span><h3>나의 현재 사용량을 확인해 봅시다.</h3></div><button type="button" className="primary setup-complete-button" onClick={completeSetup}>설정 완료</button></section>}
      {stage === 2 && <section className="stage-action-card stage-action-top"><div><span>{canStartDiet ? '두 수치를 모두 확인했어요!' : '아래의 두 수치를 확인해 보세요.'}</span><h3>나만의 에너지 다이어트를 시작해 봅시다.</h3></div><button type="button" className={`primary ${canStartDiet ? 'setup-complete-button' : 'equivalent-locked-button'}`} disabled={!canStartDiet} onClick={startDiet}>에너지 다이어트 시작하기</button></section>}

      {stage === 1 && <main className="home-diet-workspace">
        <div className="house-column">
          <HouseView selectedId={selectedId} onSelect={selectAppliance} habits={activeHabits} stage={stage} />
          <p className="house-hint"><span aria-hidden="true">☝️</span> 그림 속 전기 기구를 직접 눌러 설정하세요.</p>
        </div>
        <AppliancePanel selectedId={selectedId} stage={stage} setting={activeHabits[selectedId]} baselineSetting={safeBaseline[selectedId]} onChange={updateSelected} />
      </main>}

      {stage === 3 && <main className="home-diet-workspace step3-workspace">
        <div className="house-column">
          <HouseView selectedId={selectedId} onSelect={selectAppliance} habits={activeHabits} baselineHabits={safeBaseline} stage={stage} popup={panelOpen ? <AppliancePanel compact selectedId={selectedId} stage={stage} setting={activeHabits[selectedId]} baselineSetting={safeBaseline[selectedId]} onChange={updateSelected} onClose={() => setPanelOpen(false)} /> : null} />
          <p className="house-hint"><span aria-hidden="true">☝️</span> 기기를 누르면 가까이에 설정 창이 열립니다.</p>
        </div>
        <SavingsImpact comparison={comparison} />
      </main>}

      {stage === 2 && <section className="usage-observation">
        <div className="step2-overview-grid">
          <div className="usage-breakdown">
            <div className="usage-title"><div><span>나의 하루 평균 전기 에너지 사용량</span><strong>{Math.round(comparison.before.total * 1000).toLocaleString()}<small> Wh/day</small></strong></div></div>
            <EnergyPieChart items={initialChartItems} total={comparison.before.total} />
          </div>
          <div className="energy-equivalent-section">
            <div className="equivalent-heading"><span>내가 하루 동안 사용하는 전기 에너지는 어느 정도의 양일까요?</span></div>
            <div className="equivalent-cards">
              <article className={revealedEquivalents.bicycle ? 'revealed' : ''}><i aria-hidden="true">🚲</i><div><span>자전거 발전기와 비교하기</span><button type="button" className="equivalent-reveal" onClick={() => setRevealedEquivalents({ ...revealedEquivalents, bicycle: true })}>{revealedEquivalents.bicycle ? <>자전거 발전기로 <b>약 {energyEquivalents.bicycleHours.toLocaleString()}시간</b> 발전해야 생산할 수 있는 양이에요.</> : <b aria-label="자전거 발전 시간 확인하기">?</b>}</button><p>100W의 전력을 일정하게 생산한다고 가정</p></div></article>
              <article className={revealedEquivalents.ev ? 'revealed' : ''}><i aria-hidden="true">🚙</i><div><span>전기차와 비교하기</span><button type="button" className="equivalent-reveal" onClick={() => setRevealedEquivalents({ ...revealedEquivalents, ev: true })}>{revealedEquivalents.ev ? <>전기차로 <b>약 {energyEquivalents.evDistanceKm.toLocaleString()}km</b>를 달릴 수 있는 양이에요.</> : <b aria-label="전기차 주행거리 확인하기">?</b>}</button><p>전기 에너지 1kWh로 5km를 주행한다고 가정</p></div></article>
            </div>
            <small className="equivalent-note">교육용 비교 모델입니다. 실제 자전거 발전량은 사람과 발전기의 효율에 따라, 전기차 주행거리는 차종과 주행 환경에 따라 달라집니다.</small>
          </div>
        </div>
      </section>}

      {stage === 3 && <>
        <section className="diet-live-results">
          <div className="live-results-heading"><div><span>실시간 변화</span><h3>기기별 하루 전기 에너지 사용량</h3></div><button type="button" onClick={resetDiet}>처음 생활로 되돌리기</button></div>
          <EnergyChart before={comparison.before} current={comparison.current} showComparison />
          <button type="button" className="primary finish-diet-button" onClick={() => setShowResult(true)}>에너지 다이어트 완료</button>
        </section>
      </>}

      {showResult && <div className="result-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResult(false) }}>
        <DietReport comparison={comparison} changes={changes} onClose={() => setShowResult(false)} />
      </div>}
    </div>
  )
}
