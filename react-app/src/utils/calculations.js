export const CO2_PER_KWH = 0.478
export const COST_PER_KWH = 200
export const TREE_CO2_YEAR = 6.6
export const REF_GRADE_WH = { 1: 19.7, 2: 25.1, 3: 20.7, 4: 20.7, 5: 17.1 }
export const STANDBY_W = {
  '셋톱박스 (12.3W)': 12.3,
  '전자레인지 (2.2W)': 2.2,
  '인덕션 (1.5W)': 1.5,
  '전기밥솥 (3.5W)': 3.5,
}

export function kettleTimes(waterAmount) {
  const base = Number(waterAmount) / 100
  return [
    { product: 'A', waterAmount: Number(waterAmount), seconds: Math.round((base * 18 + 6) * 10) / 10 },
    { product: 'B', waterAmount: Number(waterAmount), seconds: Math.round((base * 19 + 7) * 10) / 10 },
    { product: 'C', waterAmount: Number(waterAmount), seconds: Math.round((base * 18 + 6) * 10) / 10 },
  ]
}

export function calculateEnergy(before, after) {
  const dTRef = Math.max(1, before.roomTemp - 4)
  const whPerOpen = (0.5 * 0.2 * 1.205 * 1005 * dTRef / 2) / 3600
  const refWhBase = REF_GRADE_WH[before.refGrade] ?? 20.7
  const refBefore = ((refWhBase * 24 * 30) + (whPerOpen * before.doorOpen * 30)) / 1000
  const acPowerBase = 1800
  const acBefore = (acPowerBase * before.acHours * 30) / 1000
  const pcBefore = (150 * before.pcHours * 30) / 1000
  const dryerBefore = (1600 * (before.dryerMinutes / 60) * 30) / 1000
  const totalStandbyW = before.standbyDevices.reduce((sum, device) => sum + (STANDBY_W[device] ?? 0), 0)
  const standbyBefore = (totalStandbyW * 24 * 30) / 1000

  const refAfter = ((refWhBase * 24 * 30) + (whPerOpen * after.doorOpen * 30)) / 1000
  const acPowerFactor = Math.max(0.5, 1 - (after.acTemp - before.acTemp) * 0.07)
  const acPowerAfter = acPowerBase * acPowerFactor
  const acAfter = (acPowerAfter * after.acHours * 30) / 1000
  const pcAfter = (150 * after.pcHours * 30) / 1000
  const dryerAfter = dryerBefore
  const standbyAfter = after.cutStandby ? 0 : standbyBefore

  const categoriesBefore = { 냉장고: refBefore, 에어컨: acBefore, 'PC/TV': pcBefore, 드라이어: dryerBefore, 대기전력: standbyBefore }
  const categoriesAfter = { 냉장고: refAfter, 에어컨: acAfter, 'PC/TV': pcAfter, 드라이어: dryerAfter, 대기전력: standbyAfter }
  const totalKwhBefore = Object.values(categoriesBefore).reduce((a, b) => a + b, 0)
  const totalKwhAfter = Object.values(categoriesAfter).reduce((a, b) => a + b, 0)
  const totalCo2Before = totalKwhBefore * CO2_PER_KWH
  const totalCo2After = totalKwhAfter * CO2_PER_KWH
  const co2Saved = totalCo2Before - totalCo2After
  const kwhSaved = totalKwhBefore - totalKwhAfter

  return {
    categoriesBefore,
    categoriesAfter,
    totalKwhBefore,
    totalKwhAfter,
    totalCo2Before,
    totalCo2After,
    kwhSaved,
    co2Saved,
    costSaved: kwhSaved * COST_PER_KWH,
    treesPlanted: (co2Saved * 12) / TREE_CO2_YEAR,
    reductionRate: totalCo2Before > 0 ? (co2Saved / totalCo2Before) * 100 : 0,
    dTAcBefore: Math.max(1, before.outdoorTemp - before.acTemp),
    dTAcAfter: Math.max(1, before.outdoorTemp - after.acTemp),
    acPowerSavingRate: ((acPowerBase - acPowerAfter) / acPowerBase) * 100,
    refKwhSaved: refBefore - refAfter,
    totalStandbyW,
  }
}
