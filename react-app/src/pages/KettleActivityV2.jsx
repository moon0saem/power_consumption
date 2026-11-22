import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistedState } from '../hooks/usePersistedState.js'
import { Notice, RangeField, StepHeading } from '../components/UI.jsx'
import '../kettle-lab.css'

const products = [
  { id: 'A', power: 1800 },
  { id: 'B', power: 1400 },
  { id: 'C', power: 1300 },
]
const waterColor = '#4aafe5'

const defaultConditions = {
  A: { water: 100, temperature: 20 },
  B: { water: 500, temperature: 35 },
  C: { water: 1000, temperature: 50 },
}
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

function calculateBoilingResults(conditions) {
  return products.map(({ id }) => {
    const { water, temperature } = conditions[id]
    const temperatureFactor = (100 - temperature) / 80
    const baseSeconds = id === 'B' ? (water / 100) * 19 + 7 : (water / 100) * 18 + 6
    return {
      product: id,
      seconds: Math.round(baseSeconds * temperatureFactor * 10) / 10,
      water,
      startTemperature: temperature,
    }
  })
}

function BoilingSimulation({ conditions, runId, onComplete }) {
  const results = useMemo(() => calculateBoilingResults(conditions), [conditions])
  const [elapsedMs, setElapsedMs] = useState(0)
  const completedRun = useRef(0)
  const onCompleteRef = useRef(onComplete)
  const visualDurations = useMemo(() => {
    const fastestSeconds = Math.min(...results.map(({ seconds }) => seconds))
    const fastestVisualDuration = 9000

    return Object.fromEntries(results.map(({ product, seconds }) => [
      product,
      Math.round(fastestVisualDuration * (seconds / fastestSeconds)),
    ]))
  }, [results])
  const maxDuration = Math.max(...Object.values(visualDurations))

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!runId) return undefined
    setElapsedMs(0)
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const nextElapsedMs = Math.min(maxDuration, performance.now() - startedAt)
      setElapsedMs(nextElapsedMs)
      if (nextElapsedMs >= maxDuration) {
        window.clearInterval(timer)
        if (completedRun.current !== runId) {
          completedRun.current = runId
          onCompleteRef.current()
        }
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [runId, maxDuration])

  return (
    <div className="boiling-simulation" aria-live="polite">
      {results.map((result) => {
        const progress = Math.min(1, elapsedMs / visualDurations[result.product])
        const currentTemperature = Math.min(100, result.startTemperature + (100 - result.startTemperature) * progress)
        const finished = progress >= 1
        return (
          <article className={finished ? 'boiling-kettle finished' : 'boiling-kettle'} key={`${runId}-${result.product}`}>
            <div className="boiling-product-title">
              <b>전기 주전자 {result.product}</b>
              <span>{result.water}mL · 시작 {result.startTemperature}°C</span>
            </div>
            <img src={asset(`kettle_${result.product.toLowerCase()}.png`)} alt={`전기 주전자 ${result.product}`} />
            <div className="water-window" style={{ '--water-color': waterColor }}>
              <div className="heated-water" style={{ height: `${58 + result.water / 1000 * 22}%`, '--bubble-opacity': Math.max(0, (progress - .12) / .88), '--bubble-speed': `${Math.max(.38, 1.25 - progress * .75)}s` }}>
                {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ '--bubble-left': `${8 + (index * 19) % 82}%`, '--bubble-delay': `${-(index * .17)}s`, '--bubble-size': `${5 + index % 4 * 2}px` }} />)}
              </div>
              <strong>{Math.round(currentTemperature)}°C</strong>
            </div>
            <div className="boiling-time">
              {finished ? <><span>끓기 시작</span><strong>{result.seconds.toFixed(1)}초</strong></> : <><span>가열 중</span><strong>{(result.seconds * progress).toFixed(1)}초</strong></>}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default function KettleActivityV2() {
  const [conditions, setConditions] = usePersistedState('energy-class:kettle-conditions-v5', defaultConditions)
  const [conditionsComplete, setConditionsComplete] = useState(false)
  const [conditionMessage, setConditionMessage] = useState('')
  const [runId, setRunId] = useState(0)
  const [experimentComplete, setExperimentComplete] = useState(false)
  const [revealed, setRevealed] = useState([])

  const updateCondition = (product, key, value) => {
    setConditions({ ...conditions, [product]: { ...conditions[product], [key]: value } })
    setConditionsComplete(false)
    setConditionMessage('')
    setRunId(0)
    setExperimentComplete(false)
    setRevealed([])
  }

  const confirmConditions = () => {
    const waterAmounts = new Set(products.map(({ id }) => conditions[id].water))
    const temperatures = new Set(products.map(({ id }) => conditions[id].temperature))
    if (waterAmounts.size !== 1 || temperatures.size !== 1) {
      setConditionsComplete(false)
      setConditionMessage('이 실험 조건이 괜찮은지 다시 한번 확인해 보세요.')
      return
    }
    setConditionMessage('')
    setConditionsComplete(true)
  }

  const startExperiment = () => {
    setExperimentComplete(false)
    setRevealed([])
    setRunId((current) => current + 1)
  }

  const allRevealed = revealed.length === products.length

  return (
    <section className="activity-section kettle-activity">
      <div className="activity-intro">
        <div><span className="activity-tag orange">활동 2</span><h2>전기 주전자 선택하기</h2><p>세 전기 주전자 중 어떤 것을 사는 게 좋을지 비교해 봅시다.</p></div>
        <img src={asset('mart.webp')} alt="전기 주전자를 고르는 고심이" />
      </div>

      <div className="learning-card">
        <StepHeading number="1" title="성능을 확인할 수 있는 실험 조건 설정하기" done={conditionsComplete} />
        <div className="condition-grid">
          {products.map(({ id }) => <article className="condition-card" key={id}>
            <h3>전기 주전자 {id}</h3>
            <img src={asset(`kettle_${id.toLowerCase()}.png`)} alt={`전기 주전자 ${id}`} />
            <RangeField label="끓일 물의 양" value={conditions[id].water} onChange={(value) => updateCondition(id, 'water', value)} min={100} max={1000} step={100} unit="mL" />
            <RangeField label="처음 물의 온도" value={conditions[id].temperature} onChange={(value) => updateCondition(id, 'temperature', value)} min={10} max={55} step={5} unit="°C" />
          </article>)}
        </div>
        <button className="primary full condition-submit" onClick={confirmConditions}>실험 조건 완료</button>
        {conditionMessage && <Notice type="error">{conditionMessage}</Notice>}
      </div>

      {conditionsComplete && <div className="learning-card revealed">
        <StepHeading number="2" title="성능을 확인하기" done={experimentComplete} />
        <div className="experiment-toolbar"><p>실험 시작 버튼을 누르면 세 주전자가 동시에 물을 끓입니다.</p><button className="primary" onClick={startExperiment}>{runId ? '실험 다시 하기' : '실험 시작'}</button></div>
        {runId ? <BoilingSimulation conditions={conditions} runId={runId} onComplete={() => setExperimentComplete(true)} /> : <div className="experiment-ready">세 주전자가 같은 조건으로 준비되었습니다.</div>}
      </div>}

      {experimentComplete && <div className="learning-card revealed">
        <StepHeading number="3" title="전기주전자의 소비전력 확인하기" done={allRevealed} />
        <div className="product-grid">
          {products.map(({ id, power }) => <article className="product-card" key={id}>
            <h4>전기 주전자 {id}</h4>
            {revealed.includes(id) ? <strong>{power.toLocaleString()}W</strong> : <button className="secondary" onClick={() => setRevealed([...revealed, id])}>소비전력 확인</button>}
          </article>)}
        </div>
      </div>}

      {allRevealed && <div className="kettle-next-action revealed">
        <p>각 전기 주전자의 성능과 소비전력을 고려하여 고심이에게 가장 적절한 주전자를 추천해 봅시다. 학습지에 정리해 보세요.</p>
      </div>}
    </section>
  )
}
