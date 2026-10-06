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
- 테스트 키: `ADMIN-TEST` (시드됨)

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
| Env `DATABASE_PATH` | `/var/data/acrossicon.db` |
| Env `LICENSE_VAULT_PATH` | `/var/data/licenses.vault.json` |

배포 전 로컬에서 `npm run build:web` 으로 `backend/web`을 빌드해 커밋하세요.

배포 후 확인:
- 웹앱: https://acrossicon.onrender.com/app/  
- 헬스: https://acrossicon.onrender.com/health  
- 운영 콘솔: https://acrossicon.onrender.com/ops/

## 확장 설정

1. Side Panel → 설정  
2. **라이선스 키** 입력  
3. **라이선스 서버 URL** (비우면 `https://acrossicon.onrender.com`, 로컬이면 `http://127.0.0.1:8000`)  
4. OpenAI/Google API Key 저장  

생성 시 서버에서 한도를 검사하고, 성공한 **장수**만큼 차감합니다.

## 고객 웹앱

1. https://acrossicon.onrender.com/app/ 접속  
2. 설정 → 라이선스 키 + API 키 저장  
3. 생성 (서버가 AI API를 대리 호출 — 브라우저 CORS 우회)
