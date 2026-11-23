import { APPLIANCES, APPLIANCE_ORDER } from './appliances.js'

const round = (value, digits = 3) => Number(value.toFixed(digits))
export const BICYCLE_GENERATOR_POWER_W = 100
export const EV_DISTANCE_PER_KWH = 5
export const CO2_PER_KWH = 0.4541
export const TREE_CO2_PER_YEAR = 6.6
export const BILLING_DAYS_PER_MONTH = 30
export const RESIDENTIAL_LOW_VOLTAGE_TIERS = [
  { limit: 100, rate: 59.1, basicCharge: 400 },
  { limit: 200, rate: 122.6, basicCharge: 890 },
  { limit: 300, rate: 183, basicCharge: 1560 },
  { limit: 400, rate: 273.2, basicCharge: 3750 },
  { limit: 500, rate: 406.7, basicCharge: 7110 },
  { limit: Infinity, rate: 690.8, basicCharge: 12600 },
]

function standbyEnergy(appliance, setting, activeHours) {
  if (!appliance.standbyPower || !setting.standbyConnected || setting.cutStandby) return 0
  return appliance.standbyPower * Math.max(0, 24 - activeHours) / 1000
}

export function calculateApplianceEnergy(id, setting) {
  const appliance = APPLIANCES[id]
  const variant = appliance.variants.find(({ id: variantId }) => variantId === setting.variant) || appliance.variants[0]

  if (appliance.type === 'refrigeratorModel') {
    const doorEnergy = Math.max(0, setting.value - appliance.min) * appliance.doorKwh
    return { kwh: round(variant.dailyKwh + doorEnergy), formula: `평균 ${Math.round(variant.dailyKwh * 1000)} Wh + 문 열기 영향 ${Math.round(doorEnergy * 1000)} Wh`, power: null }
  }

  if (appliance.type === 'riceCookerModel') {
    const warmEnergy = variant.power * setting.value / 1000
    const standby = standbyEnergy(appliance, setting, setting.value + appliance.cookingHours)
    return { kwh: round(appliance.cookingKwh + warmEnergy + standby), formula: `취사 ${Math.round(appliance.cookingKwh * 1000)} Wh + 보온 ${variant.power} W × ${setting.value} h${standby ? ` + 대기전력 ${Math.round(standby * 1000)} Wh` : ''}`, power: variant.power }
  }

  if (appliance.type === 'airConditionerModel') {
    const modeFactor = setting.eco && appliance.ecoFactor ? appliance.ecoFactor : 1
    const firstHour = Math.min(setting.value, 1)
    const steadyHours = Math.max(0, setting.value - 1)
    const startupPower = variant.power * modeFactor
    const steadyPower = variant.steadyPower * modeFactor
    const kwh = (startupPower * firstHour + steadyPower * steadyHours) / 1000
    const formulaParts = []
    if (firstHour > 0) formulaParts.push(`${round(startupPower, 0).toLocaleString()} W × ${firstHour} h`)
    if (steadyHours > 0) formulaParts.push(`${round(steadyPower, 0).toLocaleString()} W × ${steadyHours} h`)
    return { kwh: round(kwh), formula: formulaParts.join(' + ') || '사용 시간 0 h', power: round(startupPower, 0) }
  }

  if (appliance.type === 'weeklyEnergyUseModel') {
    const weeklyKwh = appliance.perUseKwh * setting.value
    const dailyKwh = weeklyKwh / 7
    return {
      kwh: round(dailyKwh),
      formula: `1회 ${Math.round(appliance.perUseKwh * 1000)} Wh × 주 ${setting.value}회 ÷ 7일`,
      power: null,
    }
  }

  if (appliance.type === 'weeklyPowerCycleModel') {
    const weeklyKwh = variant.power * appliance.perUseHours * appliance.dutyFactor * setting.value / 1000
    const dailyKwh = weeklyKwh / 7
    return {
      kwh: round(dailyKwh),
      formula: `${variant.power.toLocaleString()} W × ${appliance.perUseHours} h × 작동률 ${Math.round(appliance.dutyFactor * 100)}% × 주 ${setting.value}회 ÷ 7일`,
      power: variant.power,
    }
  }

  const hours = appliance.control === 'minutes' ? setting.value / 60 : setting.value
  const modeFactor = setting.eco && appliance.ecoFactor ? appliance.ecoFactor : 1
  const effectivePower = variant.power * modeFactor
  const activeEnergy = effectivePower * hours / 1000
  const standby = standbyEnergy(appliance, setting, hours)
  return { kwh: round(activeEnergy + standby), formula: `${round(effectivePower, 0).toLocaleString()} W × ${round(hours, 2)} h${standby ? ` + 대기전력 ${Math.round(standby * 1000)} Wh` : ''}`, power: round(effectivePower, 0) }
}

export function calculateHomeEnergy(habits) {
  const items = APPLIANCE_ORDER.map((id) => {
    const result = calculateApplianceEnergy(id, habits[id])
    return { id, name: APPLIANCES[id].name, icon: APPLIANCES[id].icon, chartGroup: APPLIANCES[id].chartGroup, ...result }
  })
  return { items, total: round(items.reduce((sum, item) => sum + item.kwh, 0)) }
}

export function groupEnergyForChart(homeEnergy) {
  const grouped = new Map()
  homeEnergy.items.forEach((item) => {
    const key = item.chartGroup || item.id
    const previous = grouped.get(key)
    if (previous) previous.kwh += item.kwh
    else grouped.set(key, { id: key, name: key === 'lighting' ? '조명' : item.name, icon: key === 'lighting' ? '💡' : item.icon, kwh: item.kwh })
  })
  return [...grouped.values()].map((item) => ({ ...item, kwh: round(item.kwh) })).sort((a, b) => b.kwh - a.kwh)
}

export function compareHabits(before, current) {
  const changes = []
  APPLIANCE_ORDER.forEach((id) => {
    const appliance = APPLIANCES[id]
    const previous = before[id]
    const next = current[id]
    if (next.value < previous.value) changes.push(`${appliance.name}: ${previous.value}${appliance.unit} → ${next.value}${appliance.unit}`)
    if (appliance.ecoFactor && !previous.eco && next.eco) changes.push(`${appliance.name}: 절전 기능 사용`)
    if (appliance.standbyPower && !previous.cutStandby && next.cutStandby) changes.push(`${appliance.name}: 사용하지 않을 때 대기전력 차단`)
  })
  return changes
}

export function summarizeComparison(beforeHabits, currentHabits) {
  const before = calculateHomeEnergy(beforeHabits)
  const current = calculateHomeEnergy(currentHabits)
  const saved = Math.max(0, before.total - current.total)
  const rate = before.total > 0 ? saved / before.total * 100 : 0
  return { before, current, saved: round(saved), rate: round(rate, 1) }
}

export function calculateEnergyEquivalents(totalKwh) {
  return {
    bicycleHours: round(totalKwh / (BICYCLE_GENERATOR_POWER_W / 1000), 1),
    evDistanceKm: round(totalKwh * EV_DISTANCE_PER_KWH, 1),
  }
}

export function calculateResidentialElectricityBill(monthlyKwh) {
  const usage = Math.max(0, monthlyKwh)
  let previousLimit = 0
  let energyCharge = 0

  for (const tier of RESIDENTIAL_LOW_VOLTAGE_TIERS) {
    const tierUsage = Math.max(0, Math.min(usage, tier.limit) - previousLimit)
    energyCharge += tierUsage * tier.rate
    if (usage <= tier.limit) break
    previousLimit = tier.limit
  }

  const billingTier = RESIDENTIAL_LOW_VOLTAGE_TIERS.find(({ limit }) => usage <= limit)
  const subtotal = Math.max(1000, billingTier.basicCharge + Math.floor(energyCharge))
  const vat = Math.round(subtotal * 0.1)
  const powerIndustryFund = Math.floor(subtotal * 0.037 / 10) * 10
  return Math.floor((subtotal + vat + powerIndustryFund) / 10) * 10
}

export function calculateSavingsImpact(comparison) {
  const monthlyKwhBefore = comparison.before.total * BILLING_DAYS_PER_MONTH
  const monthlyKwhAfter = comparison.current.total * BILLING_DAYS_PER_MONTH
  const monthlyKwhSaved = comparison.saved * BILLING_DAYS_PER_MONTH
  const monthlyCo2After = monthlyKwhAfter * CO2_PER_KWH
  const monthlyCo2Saved = monthlyKwhSaved * CO2_PER_KWH
  const monthlyBillBefore = calculateResidentialElectricityBill(monthlyKwhBefore)
  const monthlyBillAfter = calculateResidentialElectricityBill(monthlyKwhAfter)
  return {
    monthlyCo2Before: round(monthlyKwhBefore * CO2_PER_KWH, 1),
    monthlyCo2After: round(monthlyCo2After, 1),
    reductionRate: round(comparison.rate, 1),
    monthlyCostSaved: Math.max(0, monthlyBillBefore - monthlyBillAfter),
    annualTreeEffect: round(monthlyCo2Saved * 12 / TREE_CO2_PER_YEAR, 1),
    monthlyKwhSaved: round(monthlyKwhSaved, 1),
  }
}
