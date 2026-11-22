import { APPLIANCES } from './appliances.js'
import { calculateApplianceEnergy } from './calculations.js'

function Slider({ appliance, value, onChange, max, step }) {
  const label = appliance.control === 'weeklyUses' ? '일주일 사용 횟수' : appliance.control === 'opens' ? '하루 문 여는 횟수' : appliance.control === 'minutes' ? '하루 사용 시간' : appliance.id === 'riceCooker' ? '하루 보온 시간' : '하루 사용 시간'
  const formattedValue = appliance.control === 'hours' && !Number.isInteger(value)
    ? `${Math.floor(value)}시간 ${Math.round((value % 1) * 60)}분`
    : appliance.control === 'minutes' && appliance.max === 120
    ? `${Math.floor(value / 60)}시간${value % 60 ? ` ${value % 60}분` : ''}`
    : `${value}${appliance.unit}`
  return <label className="diet-slider"><span><b>{label}</b><output>{formattedValue}</output></span><input type="range" min={appliance.min} max={max ?? appliance.max} step={step ?? appliance.step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function getDietStep(appliance, baselineValue) {
  if (appliance.control === 'hours') return baselineValue <= 2 ? 0.25 : 0.5
  if (appliance.control === 'minutes') return Math.min(appliance.step, 5)
  return appliance.step
}

export default function AppliancePanel({ selectedId, stage, setting, baselineSetting, onChange, compact = false, onClose }) {
  const appliance = APPLIANCES[selectedId]
  const result = calculateApplianceEnergy(selectedId, setting)
  const sliderMax = stage === 3 ? baselineSetting.value : appliance.max
  const sliderStep = stage === 3 ? getDietStep(appliance, baselineSetting.value) : appliance.step
  return (
    <aside className={`appliance-panel ${compact ? 'compact' : ''}`}>
      <header><span>{appliance.icon}</span><div><small>{appliance.room}</small><h3>{appliance.name}</h3></div>{onClose && <button type="button" className="panel-close" onClick={onClose} aria-label={`${appliance.name} 설정 닫기`}>×</button>}</header>
      <Slider appliance={appliance} value={setting.value} max={sliderMax} step={sliderStep} onChange={(value) => onChange({ ...setting, value })} />
      {appliance.standbyPower && stage === 1 && <label className={`eco-toggle ${setting.standbyConnected ? 'active' : ''}`}><input type="checkbox" checked={setting.standbyConnected} onChange={(event) => onChange({ ...setting, standbyConnected: event.target.checked })} /><span><b>평소 플러그를 꽂아 둠</b><small>사용하지 않을 때도 약 {appliance.standbyPower}W의 대기전력이 발생합니다.</small></span></label>}
      {appliance.standbyPower && stage === 3 && baselineSetting.standbyConnected && <label className={`eco-toggle ${setting.cutStandby ? 'active' : ''}`}><input type="checkbox" checked={setting.cutStandby} onChange={(event) => onChange({ ...setting, cutStandby: event.target.checked })} /><span><b>사용하지 않을 때 대기전력 차단</b><small>스위치형 멀티탭이나 플러그 분리로 대기전력을 줄입니다.</small></span></label>}
      {stage === 3 && appliance.ecoFactor && <label className={`eco-toggle ${setting.eco ? 'active' : ''}`}><input type="checkbox" checked={setting.eco} onChange={(event) => onChange({ ...setting, eco: event.target.checked })} /><span><b>절전 기능 사용</b><small>이 시뮬레이션에서는 {Math.round((1 - appliance.ecoFactor) * 100)}% 감소한다고 가정합니다. 실제 효과는 제품과 사용 환경에 따라 달라집니다.</small></span></label>}
      {stage === 3 && selectedId === 'ac' && setting.value < baselineSetting.value * 0.35 && baselineSetting.value > 0 && <p className="comfort-note">생활에 필요한 냉방도 고려해 보세요. 사용하지 않는 것만이 항상 최선은 아닙니다.</p>}
      {selectedId === 'tv' && <p className="model-note">TV의 실제 소비전력은 화면 크기, 밝기와 영상에 따라 달라집니다. 여기서는 평균 120W로 계산합니다.</p>}
      {selectedId === 'ac' && <p className="model-note">첫 1시간은 1,800W, 이후에는 600W로 작동한다고 가정한 교육용 모델입니다. 실제 사용량은 날씨, 설정 온도와 단열 상태에 따라 달라집니다.</p>}
      {selectedId === 'pc' && <p className="model-note">본체와 모니터를 합해 평균 200W로 가정합니다. 실제 사용량은 작업 종류에 따라 달라집니다.</p>}
      {selectedId === 'refrigerator' && <p className="model-note">평균 사용량에 문 열기의 영향을 고려한 교육용 추정값입니다.</p>}
      {selectedId === 'riceCooker' && <p className="model-note">매일 취사 1회에 250Wh를 사용하고, 취사 1시간과 보온 시간을 제외한 동안만 대기전력이 발생한다고 가정합니다.</p>}
      {selectedId === 'washingMachine' && <p className="model-note">세탁기는 단계마다 소비전력이 달라 1회당 350Wh의 교육용 평균 사용량으로 계산합니다.</p>}
      {selectedId === 'iron' && <p className="model-note">1회 30분 사용을 가정하되, 온도조절기가 전원을 반복해서 켜고 끄는 특성을 반영해 정격전력의 60%만 작동한다고 계산합니다.</p>}
      <div className="appliance-equation"><span>예상 사용량</span><strong>{Math.round(result.kwh * 1000).toLocaleString()} Wh/day</strong><small>{result.formula}</small></div>
    </aside>
  )
}
