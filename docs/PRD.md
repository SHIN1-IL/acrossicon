# Product Requirements Document (PRD)

## 1. 프로젝트 개요 (Overview)

- **프로젝트명:** AcrossIcon AI (개인용 AI 비주얼 생성 툴)
- **형태:** Chrome Extension (Manifest V3, Side Panel 기반)
- **목적:** 별도 디자인 툴/외주 없이, 브라우저 Side Panel에서 **로고 / 상품 배너 / 홈·배너 이미지**를 AI로 생성·변환·저장하는 개인 생산성 도구.

## 2. 목표 및 핵심 가치 (Goals & Key Value)

- **작업 몰입도 유지:** 별도 웹사이트 이동 없이 브라우저 우측 Side Panel에서 즉시 작업.
- **프롬프트 자동 최적화:** 최소 입력만으로 모드별 전문 프롬프트를 자동 합성.
- **비용·구조 단순화:** 고객은 라이선스 키 + (당분간) 본인 API Key로 사용. 한도는 백엔드에서 집계.
- **판매 플랜:** 스탠다드(일 20 / 월 60) · 프리미엄(일 30 / 월 120). 체험 플랜 없음.
- **라이선스 안전 사용:** 업로드 변환은 **무료/상업·개작 허용 라이선스 이미지**만 사용 (사용자 확인 필수).

## 3. 타깃 플랫폼 및 기술 스택 (Tech Stack)

| 항목 | 내용 |
|------|------|
| 플랫폼 | Chrome Extension Manifest V3 |
| UI | Chrome Side Panel API (`chrome.sidePanel`) |
| 프론트엔드 | React 18+, Vite, TypeScript, Tailwind CSS |
| 스토리지 | `chrome.storage.local` (+ `unlimitedStorage`) |
| AI 이미지 | OpenAI `gpt-image-1` (generate / edits), Google Imagen 3 (생성만) |
| 유틸 | Lucide React, Canvas API (투명 배경 PNG 등) |
| 권한 | `sidePanel`, `storage`, `downloads`, `unlimitedStorage` |
| Host | `api.openai.com`, `*.blob.core.windows.net`, `generativelanguage.googleapis.com`, 라이선스 API(Render/local) |
| 백엔드 | FastAPI (`backend/`) — 라이선스·한도·운영 콘솔 `/ops` |

> **참고:** DALL·E 3는 2026-05-12 종료. 현재 OpenAI 경로는 `gpt-image-1` (와이드는 `gpt-image-2`).

## 4. 판매 플랜 (Billing)

| 플랜 | 월 가격(권장) | 일 한도 | 월 한도 |
|------|---------------|---------|---------|
| 스탠다드 | 14,900원 | 10장 | 60장 |
| 프리미엄 | 29,900원 | 20장 | 120장 |

- 한도는 **이미지 장수** 기준 (생성 개수 설정만큼 차감)
- 관리자 콘솔: `backend/ops` (ADMIN_TOKEN)
- 키 발급: 1개월 / 6개월 / 1년 / 지인 30일
- 체험 플랜 없음 (피드백 후 재검토)

## 4. 핵심 기능 요구사항 (Functional Requirements)

### 4.0. 생성 모드 (Generation Modes)

| 모드 | 설명 |
|------|------|
| **로고** | 아이콘 / 로고+글씨 / 워드마크, 형태(정사각·원형·가로·세로·육각·자유) |
| **상품 배너** | 상품 강조 + 한 줄 카피 + 강조 포인트 |
| **홈/배너** | (A) 새로 생성 또는 (B) 무료 이미지 업로드 후 재해석 변환 |

홈/배너 공통 옵션: 텍스트 여백 위치(좌/우/중앙/없음), 재해석 강도(약/보통/강), 스타일·컬러 테마.

업로드 변환 시:
- 라이선스 확인 체크 필수
- OpenAI Provider 전용 (`/v1/images/edits`)

### 4.1. 사용자 입력 (Input Section)

- 브랜드/서비스명
- 스타일 키워드 태그 + 직접 입력
- 컬러 테마 프리셋 (Monochrome, Neon Accent, Ocean Blue, Earth Tone, Custom)
- 프롬프트 변형 ON/OFF
- 모드별 추가 필드 (상품명/카피, 홈 제목, 업로드 등)
- 생성 전 예상 비용 표시 + 확인 모달

### 4.2. 프롬프트 인젝터 (Prompt Engineering Engine)

모드별 마스터 템플릿으로 자동 합성. UI 언어와 무관하게 **이미지 프롬프트는 영어**로 유지 (품질).

로고 기본 템플릿 예시:

```
Professional vector graphic logo for brand named '{brand_name}', theme of '{keywords}', color palette '{color_theme}'. ...
```

프롬프트 변형 ON 시 후보마다 구도·형태 지시문 분기.

### 4.3. 결과 갤러리 및 액션 (Gallery & Actions)

- 이번 결과 / 히스토리 탭
- 그리드 렌더링 + 로딩 스켈레톤
- 부분 실패 허용 (`Promise.allSettled`)
- 호버 액션:
  - PNG 다운로드
  - 투명 배경 PNG (흰 배경 제거)
  - 클립보드 이미지 복사
  - 사용 프롬프트 복사
  - 히스토리 개별/전체 삭제
- 히스토리는 data URL로 영속 저장 (CDN URL 만료 방지)

### 4.4. 환경설정 (Settings - Local Only)

- AI Provider: OpenAI / Google
- API Key 마스킹 저장·로드
- 생성 개수 (1~4), 해상도 (`1024x1024` / `1024x1536` / `1536x1024`)
- 프롬프트 변형 기본값
- UI 언어: **한국어(기본) / English**
  - 한국어일 때 스타일 키워드·컬러 테마 라벨도 한국어 표시

### 4.5. 다국어 (i18n)

- 헤더 `한 | EN` 토글 + 설정에서 언어 선택
- 선택값은 `chrome.storage.local`에 저장

### 4.6. 에러 핸들링

- API Key 미등록 안내
- 네트워크/API 에러 Toast
- 업로드 변환 시 Provider/라이선스/파일 누락 검증

## 5. UI/UX 요구사항 (Design & User Experience)

- 다크 모던 테크 UI (Slate/Zinc)
- Side Panel 최소 폭 320px 반응형 Flex/Grid
- 생성 중 스켈레톤 / 버튼 로딩 상태
- 비용 확인 모달 (장수·예상 요금·변형 ON/OFF)

## 6. 개발 마일스톤 (Milestones)

| Step | 내용 | 상태 |
|------|------|------|
| 1 | Vite + React + Tailwind MV3 Side Panel 보일러플레이트 | 완료 |
| 2 | 로컬 스토리지 & 설정 (API Key) | 완료 |
| 3 | 프롬프트 엔진 & OpenAI/Google 이미지 API | 완료 |
| 4 | 갤러리, 다운로드, 투명 PNG, 히스토리 | 완료 |
| 5 | 비용 가드, 부분 실패, 프롬프트 변형 | 완료 |
| 6 | 로고 구성/형태 옵션, 한·영 i18n | 완료 |
| 7 | 상품 배너 + 홈/배너(생성·무료 이미지 변환) | 완료 |
| 8 | Chrome `dist` 로드 실전 테스트 | 진행/유지보수 |
| 9 | 판매 플랜(스탠다드/프리미엄) + 라이선스 API | 완료 |
| 10 | 관리자 운영 콘솔 (`/ops`, AcrossIcon 다크/스카이) | 완료 |

## 7. 빌드 & 실행

```bash
npm install
npm run build
```

Chrome → `chrome://extensions` → 개발자 모드 → **압축해제된 확장 프로그램을 로드** → `dist` 폴더 선택.

UI 미리보기만 필요할 때:

```bash
npm run dev
```

확장 기능(`chrome.*`) 검증은 반드시 **빌드된 `dist` 로드**로 수행.

## 8. 비용 가이드 (참고)

OpenAI `gpt-image-1` medium 대략치 (변동 가능):

- 1024×1024: 약 $0.04 /장
- 1024×1536 / 1536×1024: 약 $0.06 /장
- 업로드 edit: 출력 비용 + 소액 입력 이미지 토큰

앱 내 생성 전 확인 모달에 예상 비용을 표시함.
