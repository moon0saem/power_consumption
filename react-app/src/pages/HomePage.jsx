export default function HomePage({ navigate }) {
  return (
    <section className="home-start">
      <div className="home-start-copy">
        <div className="home-symbol" aria-hidden="true">⚡</div>
        <h1>슬기로운 전기 에너지 생활</h1>
        <p>
          우리 주변의 전기 기구들을 탐색해 보면서<br className="desktop-break" />
          전기를 효율적으로 사용하는 방법을 생각해 봅시다.
        </p>

        <div className="lesson-buttons" aria-label="차시 선택">
          <button onClick={() => navigate('lesson1')}>
            <span>1차시</span>
            <strong>다양한 전기 기구 탐색</strong>
          </button>
          <button onClick={() => navigate('diet')}>
            <span>2차시</span>
            <strong>에너지 다이어트</strong>
          </button>
        </div>
      </div>

      <div className="home-energy-visual" aria-hidden="true">
        <div className="energy-ring ring-outer" />
        <div className="energy-ring ring-inner" />
        <div className="home-bolt">⚡</div>
      </div>
    </section>
  )
}
