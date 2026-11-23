export const APPLIANCES = {
  bedroomLight: { id: 'bedroomLight', name: '방 조명', chartGroup: 'lighting', icon: '💡', room: '방', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 6, variants: [{ id: 'standard', name: '방 전체 LED 조명', power: 30, cost: 0 }] },
  bathroomLight: { id: 'bathroomLight', name: '화장실 조명', chartGroup: 'lighting', icon: '💡', room: '욕실', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 2, variants: [{ id: 'standard', name: '욕실 LED 조명', power: 20, cost: 0 }] },
  livingLight: { id: 'livingLight', name: '거실 조명', chartGroup: 'lighting', icon: '💡', room: '거실', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 5, variants: [{ id: 'standard', name: '거실 전체 LED 조명', power: 40, cost: 0 }] },
  tv: {
    id: 'tv', name: 'TV', icon: '📺', room: '거실', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 4, standbyPower: 1,
    variants: [{ id: 'standard', name: '가정용 TV', power: 120, cost: 0 }],
  },
  ac: {
    id: 'ac', name: '에어컨', icon: '❄️', room: '거실', type: 'airConditionerModel', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 5,
    variants: [{ id: 'standard', name: '기존 에어컨', power: 1800, steadyPower: 600, cost: 0 }],
  },
  pc: { id: 'pc', name: 'PC', icon: '🖥️', room: '방', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 4, ecoFactor: 0.65, variants: [{ id: 'standard', name: '기존 PC', power: 200, cost: 0 }] },
  fan: { id: 'fan', name: '선풍기', icon: '🌀', room: '방', type: 'simplePowerTime', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 6, variants: [{ id: 'standard', name: '기존 선풍기', power: 45, cost: 0 }] },
  refrigerator: {
    id: 'refrigerator', name: '냉장고', icon: '🧊', room: '주방', type: 'refrigeratorModel', control: 'opens', min: 5, max: 40, step: 1, unit: '회', defaultValue: 20, doorKwh: 0.005,
    variants: [{ id: 'standard', name: '가정용 냉장고', dailyKwh: 1.2, cost: 0 }],
  },
  microwave: { id: 'microwave', name: '전자레인지', icon: '📻', room: '주방', type: 'simplePowerTime', control: 'minutes', min: 0, max: 60, step: 5, unit: '분', defaultValue: 15, standbyPower: 0.6, variants: [{ id: 'standard', name: '가정용 전자레인지', power: 1000, cost: 0 }] },
  riceCooker: { id: 'riceCooker', name: '전기밥솥', icon: '🍚', room: '주방', type: 'riceCookerModel', control: 'hours', min: 0, max: 24, step: 1, unit: '시간', defaultValue: 8, standbyPower: 1, cookingKwh: 0.25, cookingHours: 1, variants: [{ id: 'standard', name: '가정용 전기밥솥', power: 50, cost: 0 }] },
  dryer: {
    id: 'dryer', name: '드라이어', icon: '♨️', room: '욕실', type: 'simplePowerTime', control: 'minutes', min: 0, max: 120, step: 10, unit: '분', defaultValue: 20,
    variants: [{ id: 'standard', name: '기존 드라이어', power: 1600, cost: 0 }],
  },
  washingMachine: { id: 'washingMachine', name: '세탁기', icon: '🧺', room: '세탁실', type: 'weeklyEnergyUseModel', control: 'weeklyUses', min: 0, max: 14, step: 1, unit: '회', defaultValue: 3, perUseKwh: 0.35, variants: [{ id: 'standard', name: '가정용 세탁기', cost: 0 }] },
  iron: { id: 'iron', name: '전기다리미', icon: '♨️', room: '세탁실', type: 'weeklyPowerCycleModel', control: 'weeklyUses', min: 0, max: 14, step: 1, unit: '회', defaultValue: 2, perUseHours: 0.5, dutyFactor: 0.6, variants: [{ id: 'standard', name: '가정용 전기다리미', power: 1000, cost: 0 }] },
}

export const APPLIANCE_ORDER = ['bedroomLight', 'bathroomLight', 'livingLight', 'tv', 'ac', 'pc', 'fan', 'refrigerator', 'microwave', 'riceCooker', 'dryer', 'washingMachine', 'iron']

export function createInitialHabits() {
  return Object.fromEntries(APPLIANCE_ORDER.map((id) => {
    const appliance = APPLIANCES[id]
    return [id, { value: appliance.defaultValue, variant: appliance.variants[0].id, eco: false, standbyConnected: Boolean(appliance.standbyPower), cutStandby: false }]
  }))
}

export function cloneHabits(habits) {
  return JSON.parse(JSON.stringify(habits))
}
