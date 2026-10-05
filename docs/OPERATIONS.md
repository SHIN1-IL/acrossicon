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

저장소 루트의 `render.yaml` 참고. `ADMIN_TOKEN`만 시크릿으로 넣으면 됩니다.  
디스크 `/var/data`에 SQLite·vault가 저장됩니다.

## 확장 설정

1. Side Panel → 설정  
2. **라이선스 키** 입력  
3. **라이선스 서버 URL** (로컬이면 비움 → `http://127.0.0.1:8000`, Render면 배포 URL)  
4. OpenAI/Google API Key 저장  

생성 시 서버에서 한도를 검사하고, 성공한 **장수**만큼 차감합니다.
