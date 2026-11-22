import { useEffect, useState } from 'react'

export function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 저장 공간이 차단된 환경에서도 학습 활동 자체는 계속 진행합니다.
    }
  }, [key, value])

  return [value, setValue]
}
