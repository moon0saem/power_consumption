# 슬기로운 전기 에너지 생활 — React 앱

기존 Streamlit 교육용 앱을 브라우저에서만 실행되는 React + Vite 정적 웹앱으로 재구현한 프로젝트입니다. 원본 Python 프로젝트와 분리되어 있으며 서버나 Python 런타임이 필요하지 않습니다.

## 실행

```bash
npm install
npm run dev
```

계산 로직 테스트와 배포 빌드:

```bash
npm test
npm run build
```

빌드 결과는 `dist/`에 생성됩니다. Vite의 상대 `base`와 해시 내비게이션을 사용하므로 GitHub 저장소 이름과 관계없이 프로젝트 Pages에서 동작합니다.

## GitHub Pages 배포

현재 저장소 루트의 `.github/workflows/deploy-react-pages.yml`이 `react-app/`을 빌드하고 Pages에 배포합니다.

1. GitHub 저장소의 **Settings → Pages**로 이동합니다.
2. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
3. 기본 브랜치에 푸시하거나 Actions에서 워크플로를 수동 실행합니다.

별도 저장소로 `react-app`만 옮길 경우, 워크플로의 `working-directory`와 `path`를 저장소 루트 기준으로 변경하면 됩니다.

## 데이터와 개인정보

- 입력 내용과 진행 상태는 학생의 브라우저 `localStorage`에만 저장됩니다.
- 외부 서버로 학습 데이터를 전송하지 않습니다.
- 화면 하단의 **학습 기록 초기화**로 저장값을 삭제할 수 있습니다.
- 인쇄 창에서 **PDF로 저장**을 선택하면 학습지를 PDF로 제출할 수 있습니다.

자세한 기능 비교와 과학적 계산 가정은 [MIGRATION.md](./MIGRATION.md)를 확인하세요.
