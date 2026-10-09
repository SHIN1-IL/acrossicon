# AcrossIcon 운영 가이드

## 플랜

| 플랜 | 월 | 일 | 월 |
|------|----|----|----|
| 스탠다드 | 14,900원 | 10장 | 60장 |
| 프리미엄 | 29,900원 | 20장 | 120장 |

체험 플랜 없음.

## 로컬 백엔드

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export ADMIN_TOKEN=your-secret
uvicorn main:app --reload --port 8000
```

- 헬스: http://127.0.0.1:8000/health  
- 운영 콘솔: http://127.0.0.1:8000/ops/  
- 테스트 키: `ADMIN-TEST` (OpenAI, 시드됨) · `ADMIN-GEMINI` (Google/Gemini, 시드됨 — Render에 `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY` 필요, AI Studio 키 형식 `AIzaSy…` 또는 `AQ.…`)

## Render

저장소 루트 `render.yaml` 참고. 서비스 이름: **`acrossicon`**  
기본 URL: **`https://acrossicon.onrender.com`**

| 경로 | 용도 |
|------|------|
| `/app/` | **고객 웹앱** (3분 블로그형) |
| `/ops/` | 관리자 운영 콘솔 |
| `/health` | 헬스체크 |

### Web Service 설정 체크리스트

| 항목 | 값 |
|------|-----|
| Name | `acrossicon` |
| Language | Python 3 |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Disk mount | `/var/data` (1 GB) |
| Env `ADMIN_TOKEN` | 시크릿 (직접 입력) |
| Env `OPENAI_API_KEY` | **필수** — 고객 생성용 (당신 계정 키) |
| Env `GOOGLE_API_KEY` | 선택 (없으면 OpenAI만 사용) |
| Env `DATABASE_PATH` | `/var/data/acrossicon.db` |
| Env `LICENSE_VAULT_PATH` | `/var/data/licenses.vault.json` |

배포 전 로컬에서 `npm run build:web` 으로 `backend/web`을 빌드해 커밋하세요.

배포 후 확인:
- 웹앱: https://acrossicon.onrender.com/app/  
- 헬스: https://acrossicon.onrender.com/health (`ai_ready: true` 여야 생성 가능)  
- 운영 콘솔: https://acrossicon.onrender.com/ops/

## 고객 사용 (3분 블로그형)

1. https://acrossicon.onrender.com/app/ 접속  
2. 설정 → **라이선스 키만** 입력 → 저장  
3. 생성 (AI 비용은 서버 `OPENAI_API_KEY`로 청구, 고객 API 키 불필요)

## 확장 설정 (선택)

1. Side Panel → 설정  
2. **라이선스 키** 입력  
3. **라이선스 서버 URL** (비우면 `https://acrossicon.onrender.com`)  

생성은 서버 프록시를 사용합니다. 고객 API 키는 받지 않습니다.

## PDF 안내서 (고객·관리자)

`docs/`에 한글 PDF 세 종이 있습니다. 입금 확인 후 고객에게는 해당 플랜 PDF를 함께 보냅니다.

| 파일 | 용도 |
|------|------|
| `AcrossIcon_관리자_운영가이드.pdf` | 입금 확인, `/ops/` 키 발급·연장, Render 운영 |
| `AcrossIcon_고객_사용방법_스탠다드.pdf` | 스탠다드 고객 (14,900원 · 일 20 / 월 60) |
| `AcrossIcon_고객_사용방법_프리미엄.pdf` | 프리미엄 고객 (29,900원 · 일 30 / 월 120) |

재생성:

```bash
python3 scripts/generate_guides_pdf.py
```

macOS `AppleGothic`과 `reportlab`이 필요합니다 (`pip install reportlab`).