import test from 'node:test'
import assert from 'node:assert/strict'
import { cloneHabits, createInitialHabits } from '../src/features/home-energy-diet/appliances.js'
import { calculateApplianceEnergy, calculateEnergyEquivalents, calculateResidentialElectricityBill, calculateSavingsImpact, compareHabits, groupEnergyForChart, summarizeComparison } from '../src/features/home-energy-diet/calculations.js'

test('일반 기기는 소비 전력 × 사용 시간으로 하루 사용량을 계산한다', () => {
  const result = calculateApplianceEnergy('tv', { value: 4, variant: 'standard', eco: false })
  assert.equal(result.kwh, 0.48)
  assert.match(result.formula, /120 W × 4 h/)
})

test('냉장고는 정격 소비 전력 × 24시간이 아닌 평균 사용량 모델을 사용한다', () => {
  const result = calculateApplianceEnergy('refrigerator', { value: 20, variant: 'standard', eco: false })
  assert.equal(result.kwh, 1.275)
  assert.match(result.formula, /평균/)
})

test('에어컨은 첫 1시간 1,800W, 이후 시간은 600W로 계산한다', () => {
  const result = calculateApplianceEnergy('ac', { value: 5, variant: 'standard', eco: false })
  assert.equal(result.kwh, 4.2)
  assert.match(result.formula, /1,800 W × 1 h/)
  assert.match(result.formula, /600 W × 4 h/)
})

test('에어컨에는 별도의 절전 모드 계수를 적용하지 않는다', () => {
  const result = calculateApplianceEnergy('ac', { value: 5, variant: 'standard', eco: true })
  assert.equal(result.kwh, 4.2)
  const before = createInitialHabits()
  const current = cloneHabits(before)
  current.ac.eco = true
  assert.equal(compareHabits(before, current).some((change) => change.includes('에어컨: 절전 기능')), false)
})

test('하루 사용량을 자전거 발전 시간과 전기차 주행거리로 환산한다', () => {
  assert.deepEqual(calculateEnergyEquivalents(4.2), { bicycleHours: 42, evDistanceKm: 21 })
})

test('하루 절감량을 탄소, 전기요금, 소나무 효과로 환산한다', () => {
  const impact = calculateSavingsImpact({ before: { total: 10 }, current: { total: 8 }, saved: 2, rate: 20 })
  assert.deepEqual(impact, { monthlyCo2Before: 136.2, monthlyCo2After: 109, reductionRate: 20, monthlyCostSaved: 12480, annualTreeEffect: 49.5, monthlyKwhSaved: 60 })
})

test('주택용 저압 누진요금과 부가세·전력산업기반기금을 반영한다', () => {
  assert.equal(calculateResidentialElectricityBill(300), 43230)
  assert.equal(calculateResidentialElectricityBill(240), 30750)
})

test('세탁기와 전기다리미는 일주일 사용 횟수를 하루 평균 사용량으로 계산한다', () => {
  const washingMachine = calculateApplianceEnergy('washingMachine', { value: 7, variant: 'standard', eco: false })
  const iron = calculateApplianceEnergy('iron', { value: 7, variant: 'standard', eco: false })
  assert.equal(washingMachine.kwh, 0.35)
  assert.equal(iron.kwh, 0.3)
  assert.match(washingMachine.formula, /1회 350 Wh/)
  assert.match(iron.formula, /작동률 60%/)
  assert.match(washingMachine.formula, /주 7회 ÷ 7일/)
})

test('전자레인지의 최근형 대기전력과 전기밥솥의 취사 시간을 중복 없이 계산한다', () => {
  const microwave = calculateApplianceEnergy('microwave', { value: 0, variant: 'standard', eco: false, standbyConnected: true, cutStandby: false })
  const riceCooker = calculateApplianceEnergy('riceCooker', { value: 8, variant: 'standard', eco: false, standbyConnected: true, cutStandby: false })
  assert.equal(microwave.kwh, 0.014)
  assert.equal(riceCooker.kwh, 0.665)
  assert.match(riceCooker.formula, /대기전력 15 Wh/)
})

test('사용 시간과 대기전력을 함께 바꾸면 절감량과 행동을 계산한다', () => {
  const before = createInitialHabits()
  const current = cloneHabits(before)
  current.tv.value = 2
  current.tv.cutStandby = true
  const comparison = summarizeComparison(before, current)
  const changes = compareHabits(before, current)
  assert.ok(comparison.saved > 0)
  assert.ok(comparison.rate > 0)
  assert.ok(changes.some((change) => change.includes('4시간 → 2시간')))
  assert.ok(changes.some((change) => change.includes('대기전력')))
})

test('세 구역의 조명은 원형 그래프에서 하나의 조명 항목으로 합친다', () => {
  const habits = createInitialHabits()
  const grouped = groupEnergyForChart(summarizeComparison(habits, habits).before)
  assert.equal(grouped.filter((item) => item.id === 'lighting').length, 1)
  assert.equal(grouped.some((item) => item.id === 'bedroomLight'), false)
})
