import { useEffect, useState } from 'react'

const colors = { A: '#367bd6', B: '#2b927e', C: '#ed9a35' }

export default function KettleRace({ results, runId }) {
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState([])
  const max = Math.max(...results.map((item) => item.seconds))
  const signature = results.map((item) => `${item.product}:${item.seconds}`).join('|')

  useEffect(() => {
    if (!runId) return
    setRunning(false)
    setFinished([])
    const start = setTimeout(() => setRunning(true), 40)
    const timers = results.map((item) => setTimeout(() => setFinished((current) => [...current, item.product]), 250 + item.seconds / max * 2200))
    return () => { clearTimeout(start); timers.forEach(clearTimeout) }
  }, [runId, signature])

  return <div className="kettle-race" aria-live="polite">
    {results.map((item) => <div className={finished.includes(item.product) ? 'race-lane finished' : 'race-lane'} key={`${runId}-${item.product}`}>
      <div className="race-label"><b>{item.product}</b><span>{finished.includes(item.product) ? '완료!' : running ? '가열 중' : '준비'}</span></div>
      <div className="race-track"><span className={running ? 'racing' : ''} style={{ '--duration': `${Math.max(1.2, item.seconds / max * 2.2)}s`, background: colors[item.product] }}><i>♨</i></span></div>
      <strong>{item.seconds}초</strong>
    </div>)}
  </div>
}
