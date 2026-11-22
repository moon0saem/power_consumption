import { useState } from 'react'
import { usePersistedState } from '../hooks/usePersistedState.js'
import { kettleTimes } from '../utils/calculations.js'
import { kettles, kettleHistogram } from '../data/kettles.js'
import { BarChart, ScatterPlot } from '../components/Charts.jsx'
import { Notice, RangeField, StepHeading } from '../components/UI.jsx'
import KettleRace from '../components/KettleRace.jsx'
import '../lesson-one.css'
import KettleActivityV2 from './KettleActivityV2.jsx'

const energies = ['운동 에너지', '열에너지', '빛에너지']
const energyColors = { '열에너지': '#e85d4a', '빛에너지': '#e7ac27', '운동 에너지': '#2e9a68' }
const applianceDefinitions = [
  { appliance: 'TV', correctEnergy: '빛에너지' },
  { appliance: '선풍기', correctEnergy: '운동 에너지' },
  { appliance: '전기 밥솥', correctEnergy: '열에너지' },
  { appliance: '전기 다리미', correctEnergy: '열에너지' },
  { appliance: 'LED 전등', correctEnergy: '빛에너지' },
  { appliance: '청소기', correctEnergy: '운동 에너지' },
]
const initialApplianceRows = applianceDefinitions.map(({ appliance }) => ({ appliance, energy: '', power: 0 }))
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

function ApplianceActivity({ onNext }) {
  const [rows, setRows] = usePersistedState('energy-class:appliance-fixed-v2', initialApplianceRows)
  const [saved, setSaved] = usePersistedState('energy-class:appliance-fixed-saved-v2', [])
  const [message, setMessage] = useState('')
  const [incorrect, setIncorrect] = useState([])
  const valid = saved.length === applianceDefinitions.length

  const update = (appliance, key, value) => {
    setRows(rows.map((row) => row.appliance === appliance ? { ...row, [key]: value } : row))
    setSaved([])
    setIncorrect([])
    setMessage('')
  }
  const saveRows = () => {
    const incomplete = rows.filter((row) => !row.energy || Number(row.power) <= 0)
    if (incomplete.length) {
      setSaved([])
      setIncorrect(incomplete.map((row) => row.appliance))
      setMessage('모든 전기 기구의 에너지 종류와 소비전력을 입력해 주세요.')
      return
    }

    const wrongAnswers = rows.filter((row) => {
      const definition = applianceDefinitions.find((item) => item.appliance === row.appliance)
      return row.energy !== definition.correctEnergy
    })
    if (wrongAnswers.length) {
      setSaved([])
      setIncorrect(wrongAnswers.map((row) => row.appliance))
      setMessage(`주로 전환되는 에너지를 다시 확인해 보세요: ${wrongAnswers.map((row) => row.appliance).join(', ')}`)
      return
    }

    setIncorrect([])
    setMessage('')
    setSaved(rows)
  }
  return <section className="activity-section">
    <div className="activity-intro appliance-intro"><div><span className="activity-tag">활동 1</span><h2>전기 기구 조사하기</h2><p>집 안의 전기 기구를 살펴보고, 어떤 에너지로 바뀌는지와 소비전력을 비교해 봅시다.</p></div><img src={asset('home.webp')} alt="다양한 전기 기구가 있는 고심이네 집" /></div>

    <div className={valid ? 'appliance-workspace is-split' : 'appliance-workspace'}>
      <div className="learning-card appliance-input-card">
        <StepHeading number="1" title="제품 정보 입력하기" done={valid} />
        <div className="data-editor fixed-editor">
          <div className="editor-header"><span>전기 기구</span><span>주로 전환되는 에너지</span><span>소비전력(W)</span></div>
          {rows.map((row, index) => <div className={incorrect.includes(row.appliance) ? 'editor-row row-error' : 'editor-row'} key={row.appliance}>
            <div className="fixed-appliance"><span className="mobile-label">전기 기구</span><strong>{row.appliance}</strong></div>
            <label><span className="mobile-label">주로 전환되는 에너지</span><select value={row.energy} onChange={(e) => update(row.appliance, 'energy', e.target.value)} aria-label={`${row.appliance}의 주로 전환되는 에너지`} aria-invalid={incorrect.includes(row.appliance)}><option value="">선택</option>{energies.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span className="mobile-label">소비전력</span><input type="number" min="1" max="3000" step="10" value={row.power || ''} onChange={(e) => update(row.appliance, 'power', Number(e.target.value))} placeholder="W 입력" aria-label={`${row.appliance}의 소비전력`} /></label>
          </div>)}
        </div>
        <button className="primary full appliance-submit" onClick={saveRows}>입력 완료</button>
        {message && <Notice type="error">{message}</Notice>}
      </div>

      <div className="comparison-panel-shell" aria-hidden={!valid}>
        {valid && <div className="learning-card comparison-panel">
          <StepHeading number="2" title="제품별 소비전력 비교하기" done />
          <BarChart items={saved.map((row) => ({ label: row.appliance, value: row.power, color: energyColors[row.energy] }))} unit="W" ariaLabel="입력한 전기 기구별 소비전력 세로 막대그래프" orientation="vertical" />
          <div className="legend">{energies.map((energy) => <span key={energy}><i style={{ background: energyColors[energy] }} />{energy}</span>)}</div>
        </div>}
      </div>
    </div>

    {valid && <div className="kettle-next-action revealed">
      <p>소비전력과 전환되는 에너지 사이에는 어떤 특징이 있나요? 학습지에 정리해 봅시다.</p>
      <button type="button" className="primary appliance-next-button" onClick={onNext}>다음 활동 &gt; 전기 주전자 선택하기</button>
    </div>}
  </section>
}

function KettleActivity() {
  const [tab, setTab] = useState('hist')
  const [runId, setRunId] = useState(0)
  const [state, setState] = usePersistedState('energy-class:kettle', {
    water: 500, started: false, relation: ['', '', '', '', ''], relationCorrect: false,
    revealed: [], choice: 'B', choiceResult: '', quiz: ['', '', '', ''], quizResult: '',
  })
  const times = kettleTimes(state.water)
  const set = (patch) => setState({ ...state, ...patch })
  const relationCorrect = () => {
    const answer = state.relation.join('')
    const correct = ['A=C>B', 'C=A>B', 'B<A=C', 'B<C=A'].includes(answer)
    set({ relationCorrect: correct, relationMessage: correct ? '정답입니다! A와 C의 성능이 같고 B보다 높습니다.' : '같은 물을 더 짧은 시간에 끓일수록 성능이 높아요.' })
  }
  const choose = () => set({ choiceResult: state.choice === 'C' ? 'correct' : state.choice === 'A' ? 'almost' : 'again' })
  const checkQuiz = () => {
    const a = state.quiz.map((value) => value.replaceAll(' ', ''))
    const correct = a[0] === '소비전력' && ['열', '열에너지'].includes(a[1]) && a[2] === '소비전력' && ['작은', '적은', '낮은'].includes(a[3])
    set({ quizResult: correct ? 'correct' : 'wrong' })
  }
  const allRevealed = state.revealed.length === 3

  return <section className="activity-section kettle-activity">
    <div className="activity-intro"><div><span className="activity-tag orange">활동 2</span><h2>어떤 전기 주전자를 사는 게 좋을까?</h2><p>실제 판매 데이터와 성능 실험 결과를 근거로 고심이에게 가장 효율적인 제품을 추천해 봅시다.</p></div><img src={asset('mart.webp')} alt="전기 주전자를 고르는 고심이" /></div>
    <div className="learning-card">
      <StepHeading number="0" title="실제 전기 주전자 데이터 둘러보기" done />
      <p className="muted">우리나라에서 판매되는 전기 주전자 50개의 용량과 소비전력 데이터입니다.</p>
      <div className="tabs" role="tablist">
        <button className={tab === 'hist' ? 'active' : ''} onClick={() => setTab('hist')}>제품 수 분포</button><button className={tab === 'scatter' ? 'active' : ''} onClick={() => setTab('scatter')}>용량과 소비전력</button><button className={tab === 'table' ? 'active' : ''} onClick={() => setTab('table')}>원본 데이터</button>
      </div>
      {tab === 'hist' && <BarChart items={kettleHistogram()} unit="개" ariaLabel="소비전력 구간별 전기 주전자 제품 수" />}
      {tab === 'scatter' && <ScatterPlot items={kettles} />}
      {tab === 'table' && <div className="table-scroll"><table><thead><tr><th>제품</th><th>용량(L)</th><th>소비전력(W)</th></tr></thead><tbody>{kettles.map((item) => <tr key={item.product}><td>{item.product}</td><td>{item.capacity}</td><td>{item.power.toLocaleString()}</td></tr>)}</tbody></table></div>}
      <details><summary>생각해 보기 · 왜 같은 전기 주전자인데 소비전력이 다양할까요?</summary><p>용량이 크면 한 번에 더 많은 물을 끓여야 하며, 같은 용량이어도 가열 성능과 설계가 다를 수 있습니다.</p></details>
    </div>

    <div className="learning-card">
      <StepHeading number="1" title="같은 양의 물을 끓여 성능 확인하기" done={state.relationCorrect} />
      <img className="kettles-overview" src={asset('kettles.png')} alt="후보 전기 주전자 A, B, C" />
      <div className="two-column">
        <div><RangeField label="끓일 물의 양" value={state.water} onChange={(water) => set({ water, started: false, relationCorrect: false })} min={100} max={1000} step={100} unit="mL" /><button className="primary full" onClick={() => { set({ started: true }); setRunId((value) => value + 1) }}>{state.started ? '실험 다시 보기' : '실험 시작'}</button></div>
        <div>{state.started ? <KettleRace results={times} runId={runId || 1} /> : <Notice>물의 양을 정하고 실험을 시작하세요.</Notice>}</div>
      </div>
      {state.started && <div className="relation-box"><b>성능이 높은 순서로 완성하세요.</b><div className="relation-inputs">{state.relation.map((value, index) => <select key={index} value={value} onChange={(e) => { const relation = [...state.relation]; relation[index] = e.target.value; set({ relation, relationCorrect: false }) }} aria-label={`성능 비교 ${index + 1}`}>{index % 2 === 0 ? <><option value="">제품</option><option>A</option><option>B</option><option>C</option></> : <><option value="">기호</option><option>=</option><option>&gt;</option><option>&lt;</option></>}</select>)}</div><button className="secondary" onClick={relationCorrect}>성능 비교 확인</button>{state.relationMessage && <Notice type={state.relationCorrect ? 'success' : 'error'}>{state.relationMessage}</Notice>}</div>}
    </div>

    {state.relationCorrect ? <div className="learning-card revealed"><StepHeading number="2" title="후보 제품의 소비전력 확인하기" done={allRevealed} /><div className="product-grid">{[['A',1800],['B',1400],['C',1300]].map(([product,power]) => <article className="product-card" key={product}><img src={asset(`kettle_${product.toLowerCase()}.png`)} alt={`전기 주전자 ${product}`} /><h4>전기 주전자 {product}</h4>{state.revealed.includes(product) ? <strong>{power.toLocaleString()}W</strong> : <button className="secondary" onClick={() => set({ revealed: [...state.revealed, product] })}>소비전력 확인</button>}</article>)}</div>{allRevealed && <><table className="result-table summary"><thead><tr><th>제품</th><th>A</th><th>B</th><th>C</th></tr></thead><tbody><tr><th>성능</th><td>높음</td><td>낮음</td><td>높음</td></tr><tr><th>소비전력</th><td>1,800W</td><td>1,400W</td><td>1,300W</td></tr><tr><th>1회 에너지</th>{[['A',1800],['B',1400],['C',1300]].map(([product,power]) => <td key={product}>{(power * times.find((item) => item.product === product).seconds / 3600).toFixed(1)}Wh</td>)}</tr></tbody></table><p className="science-callout"><span>💡</span><b>새로운 발견</b> 전기에너지 사용량은 소비전력 × 사용 시간입니다. C는 A와 같은 시간에 끓지만 소비전력이 작아 한 번 끓일 때 사용하는 에너지도 가장 적습니다.</p></>}</div> : <Notice>Step 1의 성능 비교를 맞히면 소비전력을 확인할 수 있습니다.</Notice>}

    {allRevealed && <div className="learning-card revealed"><StepHeading number="3" title="고심이에게 가장 적합한 제품 고르기" done={state.choiceResult === 'correct'} /><div className="choice-row">{['A','B','C'].map((item) => <label className={state.choice === item ? 'choice active' : 'choice'} key={item}><input type="radio" name="kettle-choice" checked={state.choice === item} onChange={() => set({ choice: item, choiceResult: '' })} />제품 {item}</label>)}</div><button className="primary" onClick={choose}>선택 확인</button>{state.choiceResult && <Notice type={state.choiceResult === 'correct' ? 'success' : 'info'}>{state.choiceResult === 'correct' ? '정답입니다! A와 같은 성능이면서 소비전력이 더 작은 C가 효율적입니다.' : state.choiceResult === 'almost' ? 'A도 성능은 좋지만, 같은 성능인 C와 소비전력을 비교해 보세요.' : 'B의 성능과 A·C의 성능을 다시 비교해 보세요.'}</Notice>}</div>}

    {state.choiceResult === 'correct' && <div className="learning-card revealed quiz-card"><StepHeading number="4" title="오늘 배운 개념 정리하기" done={state.quizResult === 'correct'} />
      <label>1. 1초 동안 사용하는 전기 에너지의 양은? <input value={state.quiz[0]} onChange={(e) => { const quiz=[...state.quiz]; quiz[0]=e.target.value; set({quiz, quizResult:''}) }} /></label>
      <label>2. 소비전력이 큰 기구는 주로 어떤 에너지로 전환하는가? <input value={state.quiz[1]} onChange={(e) => { const quiz=[...state.quiz]; quiz[1]=e.target.value; set({quiz, quizResult:''}) }} /></label>
      <label>3. 성능이 같다면 <input value={state.quiz[2]} onChange={(e) => { const quiz=[...state.quiz]; quiz[2]=e.target.value; set({quiz, quizResult:''}) }} aria-label="세 번째 문제 첫 번째 빈칸" />이 <input value={state.quiz[3]} onChange={(e) => { const quiz=[...state.quiz]; quiz[3]=e.target.value; set({quiz, quizResult:''}) }} aria-label="세 번째 문제 두 번째 빈칸" /> 제품이 효율적이다.</label>
      <button className="primary" onClick={checkQuiz}>정답 확인</button>{state.quizResult && <Notice type={state.quizResult === 'correct' ? 'success' : 'error'}>{state.quizResult === 'correct' ? '모든 개념을 정확하게 정리했습니다! 🎉' : '틀린 부분이 있어요. 그래프와 정리 표를 다시 확인해 보세요.'}</Notice>}
    </div>}
  </section>
}

export default function LessonOne() {
  const [activity, setActivity] = usePersistedState('energy-class:lesson1-activity-v2', 'appliances')
  const [kettleUnlocked, setKettleUnlocked] = usePersistedState('energy-class:lesson1-kettle-unlocked-v2', activity === 'kettle')
  const openKettle = () => {
    setKettleUnlocked(true)
    setActivity('kettle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const switchActivity = (nextActivity) => {
    setActivity(nextActivity)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return <div className="page lesson-page"><header className="page-header"><span>1차시</span><h1>다양한 전기 기구 탐색</h1><p>데이터를 관찰하고 비교하여 소비전력의 특징을 스스로 발견해 봅시다.</p><div className="journey-progress" aria-label="1차시 활동 선택"><button type="button" className={activity === 'appliances' ? 'active' : 'complete'} onClick={() => switchActivity('appliances')} aria-current={activity === 'appliances' ? 'step' : undefined}><i>{activity === 'appliances' ? '1' : '✓'}</i>전기 기구 조사하기</button><b /><button type="button" className={activity === 'kettle' ? 'active' : kettleUnlocked ? 'available' : ''} disabled={!kettleUnlocked} onClick={() => switchActivity('kettle')} aria-current={activity === 'kettle' ? 'step' : undefined}><i>2</i>전기 주전자 선택하기</button></div></header>{activity === 'appliances' ? <ApplianceActivity onNext={openKettle} /> : <KettleActivityV2 />}</div>
}
