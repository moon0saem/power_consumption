import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage.jsx'
import LessonOne from './pages/LessonOne.jsx'
import HomeEnergyDiet from './features/home-energy-diet/HomeEnergyDiet.jsx'
import { resolveRoute } from './utils/routing.js'

const routes = {
  home: { label: '홈', short: '홈' },
  lesson1: { label: '1차시 · 다양한 전기 기구 탐색', short: '1차시' },
  diet: { label: '2차시 · 에너지 다이어트', short: '2차시' },
}

function getRoute() {
  return resolveRoute(window.location.hash, window.location.search, Object.keys(routes), { 'home-energy-diet': 'diet' })
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHashChange)
    if (!window.location.hash) window.history.replaceState(null, '', '#/home')
    if (window.location.hash.startsWith('#/home-energy-diet')) window.history.replaceState(null, '', '#/diet')
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next) => {
    const target = routes[next] ? next : 'home'
    setRoute(target)
    const targetHash = `#/${target}`
    if (window.location.hash !== targetHash) window.location.hash = targetHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <button className="brand" onClick={() => navigate('home')} aria-label="홈으로 이동">
          <span className="brand-mark">⚡</span>
          <span><b>슬기로운 전기 에너지 생활</b></span>
        </button>
        <nav aria-label="주요 학습 활동">
          {Object.entries(routes).filter(([, value]) => !value.hidden).map(([key, value]) => (
            <button key={key} className={route === key ? 'active' : ''} onClick={() => navigate(key)} aria-current={route === key ? 'page' : undefined}>
              <span className="wide-label">{value.label}</span><span className="short-label">{value.short}</span>
            </button>
          ))}
        </nav>
      </header>

      <main>
        {route === 'home' && <HomePage navigate={navigate} />}
        {route === 'lesson1' && <LessonOne navigate={navigate} />}
        {route === 'diet' && <HomeEnergyDiet />}
      </main>

      {route !== 'home' && <footer className="no-print footer-reset-only">
        <button className="text-button" onClick={() => { if (confirm('이 기기에 저장된 학습 진행 상황을 모두 지울까요?')) { Object.keys(localStorage).filter((key) => key.startsWith('energy-class:')).forEach((key) => localStorage.removeItem(key)); location.reload() } }}>학습 기록 초기화</button>
      </footer>}
    </div>
  )
}
