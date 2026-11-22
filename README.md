# 슬기로운 전기 에너지 생활

중학교 과학 수업을 위한 React + Vite 기반 전기 에너지 학습 웹앱입니다.

- 1차시: 전기 기구 조사하기, 적절한 주전자 선택하기
- 2차시: 에너지 다이어트

기존 Streamlit 프로젝트는 원본 자료로 보존되어 있으며, 실제 웹앱은 `react-app/`에 있습니다.

## 로컬 실행

```bash
cd react-app
npm install
npm run dev
```

## 검사와 빌드

```bash
cd react-app
npm test
npm run build
```

## GitHub Pages 배포

기본 브랜치에 변경 사항을 푸시하면 `.github/workflows/deploy-react-pages.yml`이 테스트와 빌드를 실행한 뒤 GitHub Pages에 배포합니다.

저장소의 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**로 설정합니다.
