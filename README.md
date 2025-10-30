# JaeMatGo

재맞고 FAQ 안내 앱입니다. 기존 Google Apps Script Web App을 Node.js 백엔드와 정적 프론트엔드로 분리해 재구성했습니다.  
데이터는 계속 Google Sheets를 사용하며, 백엔드가 Sheets API를 통해 FAQ를 조회하고 클릭 로그를 기록합니다.

## 구성
- `backend/` : Express 기반 REST API, Google Sheets 연동
- `frontend/` : 정적 HTML/CSS/JS FAQ 뷰어 (백엔드에서 정적 서빙)
- `Code.gs`, `index.html` 등 : 기존 Apps Script 원본 참고용

## 사전 준비
1. Google Cloud에서 서비스 계정을 생성하고 Google Sheets API를 활성화합니다.
2. 서비스 계정 키(JSON)를 발급받아 FAQ/로그 시트에 편집 권한을 부여합니다.
3. `.env` 파일을 작성하고 Sheet ID 및 시트명을 설정합니다.

```bash
cd backend
cp .env.example .env
# .env 파일을 열어 실제 값(시트 ID, 시트명 등)으로 수정
```

서비스 계정 키는 아래 방식 중 하나로 제공합니다.
- `.env`에 `GOOGLE_APPLICATION_CREDENTIALS`로 JSON 키 파일 경로 지정
- `.env`에 `GOOGLE_SERVICE_ACCOUNT_JSON`에 JSON 문자열 그대로 입력

## 설치 및 실행
```bash
cd backend
npm install
npm run dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행되며 동일 포트에서 `frontend/`의 정적 파일도 제공합니다.  
실행 중 백엔드는 아래 REST 엔드포인트를 노출합니다.
- `GET /api/faqs` : FAQ 목록 조회
- `POST /api/logs` : FAQ 클릭 로그 기록

개발 중에는 `.env`에 `USE_MOCK_DATA=true`를 설정하면 Google Sheets 연결 없이도 샘플 FAQ 데이터를 사용해 UI를 확인할 수 있습니다.

## 프론트엔드 단독 실행
정적 파일만 테스트하려면 `frontend/index.html`을 브라우저로 직접 열어 확인할 수 있습니다. 이 경우 `app.js` 상단 `API_BASE_URL`을 적절한 서버 주소로 수정하거나 `window.API_BASE_URL` 전역 변수를 정의하세요.

## TODO
- 필요 시 FAQ 캐싱 또는 응답 구조 확장
- 사용자 식별/인증 로직 추가
- 테스트 코드 및 CI 파이프라인 구축
