import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 상대 경로 + 해시 내비게이션을 사용해 프로젝트 저장소 이름과 무관하게 동작합니다.
  base: './',
  build: { outDir: 'dist' },
})
