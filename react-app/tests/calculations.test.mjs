import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateEnergy, kettleTimes } from '../src/utils/calculations.js'

test('500mL 주전자 시간은 기존 Streamlit 식과 같다', () => {
  assert.deepEqual(kettleTimes(500).map((row) => row.seconds), [96, 102, 96])
})

test('기본 에너지 다이어트 값은 기존 식과 동일하며 절감량이 양수다', () => {
  const before = {
    outdoorTemp: 33, acTemp: 22, acHours: 5, roomTemp: 28, refGrade: 3,
    doorOpen: 20, pcHours: 4, dryerMinutes: 12,
    standbyDevices: ['셋톱박스 (12.3W)', '전자레인지 (2.2W)', '전기밥솥 (3.5W)'],
  }
  const after = { acTemp: 26, acHours: 4, doorOpen: 10, pcHours: 3, cutStandby: false }
  const result = calculateEnergy(before, after)
  assert.ok(Math.abs(result.totalKwhBefore - 325.706205) < 0.000001)
  assert.ok(result.kwhSaved > 0)
  assert.equal(result.acPowerSavingRate, 28.000000000000004)
})
