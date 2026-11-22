import { APPLIANCES, APPLIANCE_ORDER } from './appliances.js'

const positions = {
  bedroomLight: { left: '26%', top: '9%', width: '10%', height: '10%' },
  bathroomLight: { left: '63%', top: '9%', width: '10%', height: '10%' },
  livingLight: { left: '30%', top: '53%', width: '10%', height: '10%' },
  tv: { left: '10%', top: '73%', width: '11%', height: '25%' },
  ac: { left: '15%', top: '54%', width: '14%', height: '12%' },
  pc: { left: '39%', top: '29%', width: '16%', height: '19%' },
  fan: { left: '29%', top: '29%', width: '8%', height: '18%' },
  refrigerator: { left: '58%', top: '67%', width: '9%', height: '22%' },
  microwave: { left: '81%', top: '65%', width: '10%', height: '10%' },
  riceCooker: { left: '90.5%', top: '65%', width: '9%', height: '11%' },
  dryer: { left: '61%', top: '29%', width: '11%', height: '12%' },
  washingMachine: { left: '84%', top: '31%', width: '10%', height: '17%' },
  iron: { left: '93%', top: '30%', width: '10%', height: '13%' },
}

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

function popupStyle(id) {
  const position = positions[id]
  const x = Number.parseFloat(position.left)
  const y = Number.parseFloat(position.top)
  return {
    left: `${x > 55 ? x - 5 : x + 5}%`,
    top: `${y < 40 ? y + 8 : 50}%`,
    '--popup-x': x > 55 ? '-100%' : '0%',
    '--popup-y': y < 40 ? '0%' : '-50%',
  }
}

export default function HouseView({ selectedId, onSelect, habits, baselineHabits, stage, popup = null }) {
  return (
    <div className="diet-house" aria-label="고심이네 집 전기 기구 배치도">
      <img src={asset('gosimi-house-v4.png')} alt="방, 욕실, 다용도실, 거실, 주방이 보이는 고심이네 집" />
      {APPLIANCE_ORDER.map((id) => {
        const appliance = APPLIANCES[id]
        const isChanged = stage === 3 && (habits[id]?.value !== baselineHabits?.[id]?.value || habits[id]?.eco || habits[id]?.cutStandby)
        return (
          <button
            type="button"
            key={id}
            aria-label={`${appliance.name} 설정 열기`}
            title={appliance.name}
            className={`image-hotspot ${selectedId === id ? 'selected' : ''} ${isChanged ? 'changed' : ''}`}
            style={positions[id]}
            onClick={() => onSelect(id)}
            aria-pressed={selectedId === id}
          ><span>{selectedId === id ? appliance.name : ''}</span>{isChanged && <i aria-label="변경됨">✓</i>}</button>
        )
      })}
      {popup && <div className="house-appliance-popover" style={popupStyle(selectedId)}>{popup}</div>}
    </div>
  )
}
