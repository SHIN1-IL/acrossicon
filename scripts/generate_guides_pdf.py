#!/usr/bin/env python3
"""AcrossIcon AI — 관리자 운영가이드 / 고객 사용방법(스탠다드·프리미엄) PDF 생성"""

from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
    "/Library/Fonts/AppleGothic.ttf",
    "/System/Library/Fonts/AppleGothic.ttf",
]

SKY = HexColor("#0ea5e9")
DARK = HexColor("#0f172a")
MUTED = HexColor("#475569")
LINE = HexColor("#e2e8f0")
BG = HexColor("#f8fafc")
WARN = HexColor("#b45309")

CUSTOMER_URL = "https://acrossicon.onrender.com/app/"
ADMIN_BASE = "https://acrossicon.onrender.com"
PRIVACY_URL = "https://acrossicon.onrender.com/privacy"
WRITTEN = "2026-10-06"


def register_font() -> str:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont("KR", path))
            return "KR"
    raise FileNotFoundError("한글 폰트(AppleGothic)를 찾을 수 없습니다.")


def styles(font: str):
    base = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle(
            "cover",
            parent=base["Title"],
            fontName=font,
            fontSize=22,
            leading=30,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "sub": ParagraphStyle(
            "sub",
            parent=base["Normal"],
            fontName=font,
            fontSize=11,
            leading=16,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=16,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=font,
            fontSize=14,
            leading=20,
            textColor=DARK,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=font,
            fontSize=12,
            leading=17,
            textColor=HexColor("#0369a1"),
            spaceBefore=10,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName=font,
            fontSize=10,
            leading=15,
            textColor=DARK,
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "code": ParagraphStyle(
            "code",
            parent=base["Normal"],
            fontName=font,
            fontSize=8.5,
            leading=13,
            textColor=DARK,
            backColor=BG,
            leftIndent=4,
            rightIndent=4,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "warn": ParagraphStyle(
            "warn",
            parent=base["Normal"],
            fontName=font,
            fontSize=10,
            leading=15,
            textColor=WARN,
            spaceAfter=8,
        ),
        "cell": ParagraphStyle(
            "cell",
            parent=base["Normal"],
            fontName=font,
            fontSize=9,
            leading=13,
            textColor=DARK,
        ),
        "cellh": ParagraphStyle(
            "cellh",
            parent=base["Normal"],
            fontName=font,
            fontSize=9,
            leading=13,
            textColor=white,
        ),
    }


def bullets(items, font, s):
    lis = [
        ListItem(Paragraph(t, s["body"]), leftIndent=12, bulletColor=SKY)
        for t in items
    ]
    return ListFlowable(
        lis,
        bulletType="bullet",
        start="•",
        leftIndent=18,
        bulletFontName=font,
        bulletFontSize=10,
    )


def table(headers, rows, col_widths, s):
    data = [[Paragraph(h, s["cellh"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), s["cell"]) for c in row])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), SKY),
                ("TEXTCOLOR", (0, 0), (-1, 0), white),
                ("BACKGROUND", (0, 1), (-1, -1), white),
                ("FONTNAME", (0, 0), (-1, -1), s["body"].fontName),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def page_chrome(brand):
    def add_header_footer(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(SKY)
        canvas.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, fill=1, stroke=0)
        canvas.setFillColor(MUTED)
        canvas.setFont("KR", 8)
        canvas.drawString(18 * mm, 12 * mm, brand)
        canvas.drawRightString(A4[0] - 18 * mm, 12 * mm, f"{doc.page}")
        canvas.restoreState()

    return add_header_footer


def payment_rows(plan_rows):
    return plan_rows + [
        ["입금 계좌", "하나은행 365-910996-44807"],
        ["예금주", "신일"],
        ["입금 후 연락", "카톡/문자 070-8065-1258 · acrosstool@gmail.com"],
        ["키 받는 시간", "확인 후 약 10분 이내"],
    ]


def shared_start(story, s):
    story.append(Paragraph("1. 이용 주소 (이 주소만 저장하세요)", s["h1"]))
    story.append(Paragraph(f"<b>{CUSTOMER_URL}</b>", s["body"]))
    story.append(
        Paragraph(
            "핸드폰·태블릿·PC 브라우저에서 같습니다. 회원가입은 필요 없습니다. "
            "관리자에게 받은 라이선스 키만 있으면 됩니다. "
            "고객 OpenAI API 키는 필요 없습니다.",
            s["body"],
        )
    )


def shared_notes(limit_line):
    return [
        limit_line,
        "키는 핸드폰과 PC에서 같이 쓸 수 있다.",
        "생성 비용은 서버에서 처리되므로 고객 API 키 등록이 없다.",
        "업로드 변환은 무료·상업·개작 허용 이미지만 사용하고, 라이선스 확인에 체크한다.",
        "키를 다른 사람에게 공유하지 마세요. 한도가 같이 깎입니다.",
        f"개인정보 처리방침: {PRIVACY_URL}",
        "문의: 카톡/문자 070-8065-1258 · acrosstool@gmail.com",
    ]


def trouble_table(s, extra_rows):
    rows = [
        [
            "등록이 안 됨",
            "키 철자(하이픈 포함)를 다시 확인. 입금 후 키를 받기 전이면 관리자에게 문의.",
        ],
        [
            "화면이 안 열리거나 매우 느림",
            "1분 기다렸다가 새로고침. 서버가 잠에서 깨는 시간이다.",
        ],
        ["오늘/이번달 한도 초과", "다음날 다시 이용하거나 관리자에게 연장·업그레이드 문의."],
        [
            "생성이 실패함",
            "네트워크를 확인하고 다시 시도. 계속 실패하면 관리자에게 문의.",
        ],
    ] + extra_rows
    return table(["상황", "이렇게 해 보세요"], rows, [50 * mm, 125 * mm], s)


def build_admin(s, font):
    story = []
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("AcrossIcon AI", s["sub"]))
    story.append(Paragraph("관리자 설정 · 운영 가이드", s["cover"]))
    story.append(
        Paragraph(
            f"입금 확인 후 라이선스 키 발급 · 연장 · 고객 안내<br/>작성일: {WRITTEN}",
            s["sub"],
        )
    )
    story.append(
        Paragraph(
            "키는 운영 콘솔(/ops/)에서 발급합니다. 노트북에서만 만든 키는 "
            "고객이 쓰는 서버에 생기지 않습니다.",
            s["warn"],
        )
    )

    story.append(Paragraph("1. 서비스 주소", s["h1"]))
    story.append(
        table(
            ["구분", "URL"],
            [
                ["고객 웹앱", CUSTOMER_URL],
                ["운영 콘솔 (키 발급)", f"{ADMIN_BASE}/ops/"],
                ["서버 상태", f"{ADMIN_BASE}/health"],
                ["개인정보 처리방침", PRIVACY_URL],
                ["Render 대시보드", "https://dashboard.render.com"],
            ],
            [55 * mm, 120 * mm],
            s,
        )
    )

    story.append(Paragraph("2. 요금 · 계좌 (고객 안내와 동일)", s["h1"]))
    story.append(
        table(
            ["항목", "내용"],
            [
                ["스탠다드", "월 14,900원 · 6개월 74,500원 · 연 149,000원"],
                ["스탠다드 한도", "하루 20장 · 달 60장 · 로고·상품·홈 이미지"],
                ["프리미엄", "월 29,900원 · 6개월 149,500원 · 연 299,000원"],
                ["프리미엄 한도", "하루 30장 · 달 120장 · 로고·상품·홈 이미지"],
                ["입금", "하나은행 365-910996-44807 (예금주: 신일)"],
                ["입금 메모", "스탠다드 또는 프리미엄"],
                ["문의", "카톡/문자 070-8065-1258 · acrosstool@gmail.com"],
                ["키 전달 목표", "입금 확인 후 약 10분 이내"],
                ["같이 보낼 설명서", "스탠다드 PDF 또는 프리미엄 PDF 중 입금한 플랜"],
            ],
            [40 * mm, 135 * mm],
            s,
        )
    )

    story.append(Paragraph("3. 한 번만 하는 준비", s["h1"]))
    story.append(
        bullets(
            [
                "dashboard.render.com → 웹 서비스 acrossicon 열기",
                "Environment에서 ADMIN_TOKEN을 복사한다. 이것이 관리자 비밀번호다.",
                "OPENAI_API_KEY가 있어야 고객 생성이 된다. health의 ai_ready가 true인지 확인.",
                "ADMIN_TOKEN·OPENAI_API_KEY는 고객에게 절대 보내지 않는다.",
            ],
            font,
            s,
        )
    )

    story.append(Paragraph("4. 입금 후 키 발급", s["h1"]))
    story.append(
        Paragraph(
            "1) 통장 입금과 카톡/문자의 입금자명·메모(스탠다드/프리미엄)를 맞춘다.<br/>"
            f"2) {ADMIN_BASE}/ops/ 에 ADMIN_TOKEN으로 입장한 뒤, 해당 플랜 버튼을 누른다.<br/>"
            "3) 나온 키와 해당 플랜 고객 설명서 PDF를 카톡/문자로 보낸다.<br/>"
            f"4) 고객에게 {CUSTOMER_URL} 에서 설정 → 라이선스 키 입력 → 저장을 안내한다.<br/>"
            "터미널로 발급할 때는 아래 curl을 쓴다. 여기토큰을 ADMIN_TOKEN으로 바꾼다.",
            s["body"],
        )
    )
    story.append(Paragraph("■ 스탠다드 월간 (14,900원 · 30일)", s["h2"]))
    story.append(
        Paragraph(
            f"curl -X POST {ADMIN_BASE}/admin/licenses<br/>"
            "  -H \"Content-Type: application/json\"<br/>"
            "  -H \"X-Admin-Token: 여기토큰\"<br/>"
            "  -d '{\"plan\": \"standard\", \"days\": 30, \"note\": \"홍길동 스탠다드\"}'",
            s["code"],
        )
    )
    story.append(Paragraph("■ 프리미엄 월간 (29,900원 · 30일)", s["h2"]))
    story.append(
        Paragraph(
            f"curl -X POST {ADMIN_BASE}/admin/licenses<br/>"
            "  -H \"Content-Type: application/json\"<br/>"
            "  -H \"X-Admin-Token: 여기토큰\"<br/>"
            "  -d '{\"plan\": \"premium\", \"days\": 30, \"note\": \"홍길동 프리미엄\"}'",
            s["code"],
        )
    )
    story.append(
        Paragraph(
            "6개월은 days 180, 1년은 days 365. "
            "지인 30일은 plan family_standard / family_premium.",
            s["body"],
        )
    )

    story.append(Paragraph("■ 발급 목록 확인", s["h2"]))
    story.append(
        Paragraph(
            f"curl {ADMIN_BASE}/admin/licenses<br/>"
            "  -H \"X-Admin-Token: 여기토큰\"",
            s["code"],
        )
    )

    story.append(Paragraph("■ 고객에게 보낼 문구 예시", s["h2"]))
    story.append(
        Paragraph(
            "AcrossIcon 키 발급됐습니다.<br/>"
            "키: (여기에 키)<br/>"
            "상품: 스탠다드(또는 프리미엄)<br/>"
            f"사용: {CUSTOMER_URL}<br/>"
            "설정 → 라이선스 키 입력 → 저장 후 생성하세요. API 키는 필요 없습니다.<br/>"
            "스탠다드 고객에게는 스탠다드 PDF, 프리미엄 고객에게는 프리미엄 PDF를 같이 보내세요.",
            s["code"],
        )
    )

    story.append(Paragraph("5. 연장 · 정지 · 지인", s["h1"]))
    story.append(Paragraph("연장 (같은 키)", s["h2"]))
    story.append(
        Paragraph(
            f"curl -X POST {ADMIN_BASE}/admin/licenses/XXXX-XXXX-XXXX/extend<br/>"
            "  -H \"Content-Type: application/json\"<br/>"
            "  -H \"X-Admin-Token: 여기토큰\"<br/>"
            "  -d '{\"days\": 30}'",
            s["code"],
        )
    )
    story.append(
        Paragraph(
            "부분 입금 시 연장 일수(소수점 버림). "
            "스탠다드: 입금액 ÷ 14,900 × 30. 예: 7,450원 → 15일. "
            "프리미엄: 입금액 ÷ 29,900 × 30.",
            s["body"],
        )
    )
    story.append(Paragraph("정지 / 재활성화", s["h2"]))
    story.append(
        Paragraph(
            "정지: POST .../admin/licenses/키/suspend<br/>"
            "재활성: POST .../admin/licenses/키/activate",
            s["code"],
        )
    )

    story.append(Paragraph("6. 플랜 한도", s["h1"]))
    story.append(
        table(
            ["플랜", "코드", "일일", "월간", "비고"],
            [
                ["스탠다드", "standard", "20", "60", "월 14,900 / 6개월 74,500 / 연 149,000"],
                ["프리미엄", "premium", "30", "120", "월 29,900 / 6개월 149,500 / 연 299,000"],
                ["스탠다드 지인", "family_standard", "20", "60", "30일"],
                ["프리미엄 지인", "family_premium", "30", "120", "30일"],
                ["관리자", "admin_test", "30", "—", "고정키 ADMIN-TEST (운영에 공개 금지)"],
            ],
            [28 * mm, 32 * mm, 18 * mm, 18 * mm, 79 * mm],
            s,
        )
    )
    story.append(
        Paragraph(
            "체험 플랜은 없습니다. 한도는 이미지 장수 기준이며, 한 번에 여러 장 생성하면 그만큼 차감됩니다.",
            s["body"],
        )
    )

    story.append(Paragraph("7. 운영 체크리스트", s["h1"]))
    story.append(
        bullets(
            [
                "배포 후 /health 에서 ok·ai_ready true 확인",
                "웹앱 변경 시 로컬에서 npm run build:web 후 backend/web 커밋·푸시",
                "OPENAI_API_KEY는 AcrossIcon Render 서비스에 별도로 넣는다 (다른 서비스와 공유되지 않음)",
                "디스크 경로 DATABASE_PATH=/var/data/acrossicon.db , LICENSE_VAULT_PATH=/var/data/licenses.vault.json",
            ],
            font,
            s,
        )
    )

    story.append(Paragraph("8. 자주 막는 오류", s["h1"]))
    story.append(
        table(
            ["증상", "원인", "조치"],
            [
                ["등록되지 않은 키", "오타 또는 다른 서버 발급", "ops에서 재발급·목록 확인"],
                ["401 / 인증 실패", "ADMIN_TOKEN 불일치", "Render Environment 재확인"],
                ["ai_ready false", "OPENAI_API_KEY 없음", "Env에 키 추가 후 재배포"],
                ["첫 요청만 매우 느림", "Render 콜드스타트", "1분 대기 후 재시도"],
                ["한도 초과", "일/월 장수 소진", "다음날 또는 연장·플랜 변경"],
            ],
            [40 * mm, 55 * mm, 80 * mm],
            s,
        )
    )
    return story


def build_customer_standard(s, font):
    story = []
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("AcrossIcon AI", s["sub"]))
    story.append(Paragraph("고객 사용 방법 · 스탠다드", s["cover"]))
    story.append(
        Paragraph(
            f"월 14,900원 · 하루 20장 · 달 60장<br/>작성일: {WRITTEN}",
            s["sub"],
        )
    )
    shared_start(story, s)

    story.append(Paragraph("2. 스탠다드 플랜", s["h1"]))
    story.append(
        table(
            ["항목", "내용"],
            payment_rows(
                [
                    ["플랜", "스탠다드"],
                    ["월간", "14,900원 (30일)"],
                    ["6개월", "74,500원 (180일, 1개월분 할인)"],
                    ["연간", "149,000원 (365일, 2개월분 할인)"],
                    ["만들 수 있는 것", "로고 · 상품 배너 · 홈/배너 이미지"],
                    ["이용 한도", "하루 20장, 한 달 60장"],
                ]
            ),
            [45 * mm, 130 * mm],
            s,
        )
    )
    story.append(
        Paragraph(
            "입금할 때 입금자명과 함께 메모에 「스탠다드」를 적어 주세요. "
            "라이선스 키(예: ABCD-EFGH-IJKL)를 보내 드립니다. "
            "사이트에서 직접 결제하거나 키를 만드는 화면은 없습니다. "
            "프리미엄은 하루·달 한도가 더 큽니다(일 30 / 월 120).",
            s["body"],
        )
    )

    story.append(Paragraph("3. 이미지 만들기", s["h1"]))
    story.append(
        bullets(
            [
                f"{CUSTOMER_URL} 을 연다. 첫 화면은 30~60초 걸릴 수 있다.",
                "오른쪽 위 설정(톱니) → 라이선스 키 입력 → 저장. 상단에 플랜·오늘/이번달 잔여가 보이면 성공이다.",
                "모드를 고른다: 로고 / 상품 배너 / 홈·배너.",
                "시작 방식: 새로 생성 또는 이미지로 수정(업로드).",
                "로고는 구성·형태를 고른다. 해상도는 형태에 맞춰 자동이다.",
                "상품 배너는 형태(정사각·세로·가로·와이드)를 고르면 맞는 해상도가 적용된다.",
                "홈·배너는 시작 방식 아래에서 해상도를 고른다.",
                "브랜드명·요구사항·스타일 키워드를 채운 뒤 [생성]을 누른다. 생성 전 사용 장수를 확인한다.",
                "결과 갤러리에서 다운로드한다. 히스토리에도 저장된다.",
            ],
            font,
            s,
        )
    )

    story.append(Paragraph("4. 알아 두실 점", s["h1"]))
    story.append(
        bullets(
            shared_notes(
                "스탠다드는 하루 20장, 한 달 60장까지 만들 수 있다. "
                "한 번에 여러 장 생성하면 그만큼 차감된다."
            ),
            font,
            s,
        )
    )

    story.append(Paragraph("5. 안 될 때", s["h1"]))
    story.append(
        trouble_table(
            s,
            [
                [
                    "한도가 빨리 깎임",
                    "생성 개수를 2~4장으로 두면 한 번에 여러 장이 차감된다. 1장으로 두고 시도.",
                ],
                [
                    "더 많은 장이 필요함",
                    "프리미엄(월 29,900원 · 일 30 / 월 120)으로 문의.",
                ],
            ],
        )
    )
    return story


def build_customer_premium(s, font):
    story = []
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("AcrossIcon AI", s["sub"]))
    story.append(Paragraph("고객 사용 방법 · 프리미엄", s["cover"]))
    story.append(
        Paragraph(
            f"월 29,900원 · 하루 30장 · 달 120장<br/>작성일: {WRITTEN}",
            s["sub"],
        )
    )
    shared_start(story, s)

    story.append(Paragraph("2. 프리미엄 플랜", s["h1"]))
    story.append(
        table(
            ["항목", "내용"],
            payment_rows(
                [
                    ["플랜", "프리미엄"],
                    ["월간", "29,900원 (30일)"],
                    ["6개월", "149,500원 (180일, 1개월분 할인)"],
                    ["연간", "299,000원 (365일, 2개월분 할인)"],
                    ["만들 수 있는 것", "로고 · 상품 배너 · 홈/배너 이미지"],
                    ["이용 한도", "하루 30장, 한 달 120장"],
                ]
            ),
            [45 * mm, 130 * mm],
            s,
        )
    )
    story.append(
        Paragraph(
            "입금할 때 입금자명과 함께 메모에 「프리미엄」을 적어 주세요. "
            "라이선스 키를 보내 드립니다. "
            "사이트에서 직접 결제하거나 키를 만드는 화면은 없습니다. "
            "스탠다드보다 일·월 한도가 2배입니다.",
            s["body"],
        )
    )

    story.append(Paragraph("3. 이미지 만들기", s["h1"]))
    story.append(
        bullets(
            [
                f"{CUSTOMER_URL} 을 연다. 첫 화면은 30~60초 걸릴 수 있다.",
                "설정 → 라이선스 키 입력 → 저장. 상단 배지에 「프리미엄」과 잔여 장수가 보이면 성공이다.",
                "모드: 로고 / 상품 배너 / 홈·배너. 시작 방식·형태·해상도를 맞춘다.",
                "여러 장·프롬프트 변형을 켜면 후보를 다양하게 뽑을 수 있다. 장수만큼 한도가 차감된다.",
                "[생성] 전 확인 창에서 사용 장수를 확인한 뒤 진행한다.",
                "결과·히스토리에서 다운로드·삭제할 수 있다.",
            ],
            font,
            s,
        )
    )

    story.append(Paragraph("4. 알아 두실 점", s["h1"]))
    story.append(
        bullets(
            shared_notes(
                "프리미엄은 하루 30장, 한 달 120장까지 만들 수 있다. "
                "한 번에 여러 장 생성하면 그만큼 차감된다."
            ),
            font,
            s,
        )
    )

    story.append(Paragraph("5. 안 될 때", s["h1"]))
    story.append(
        trouble_table(
            s,
            [
                [
                    "플랜이 스탠다드로 보임",
                    "받은 키가 스탠다드일 수 있다. 키와 플랜 이름을 관리자에게 확인.",
                ],
                [
                    "한도가 빨리 깎임",
                    "생성 개수·프롬프트 변형을 확인. 필요하면 1장씩 생성.",
                ],
            ],
        )
    )
    return story


def write_pdf(path, story, brand="AcrossIcon AI", doc_title=None):
    chrome = page_chrome(brand)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=18 * mm,
        title=doc_title or path.stem,
        author=brand,
    )
    doc.build(story, onFirstPage=chrome, onLaterPages=chrome)
    print(f"wrote {path}")


def main():
    font = register_font()
    s = styles(font)
    DOCS.mkdir(exist_ok=True)

    write_pdf(
        DOCS / "AcrossIcon_관리자_운영가이드.pdf",
        build_admin(s, font),
        doc_title="AcrossIcon AI 관리자 운영 가이드",
    )
    write_pdf(
        DOCS / "AcrossIcon_고객_사용방법_스탠다드.pdf",
        build_customer_standard(s, font),
        doc_title="AcrossIcon AI 고객 사용 방법 · 스탠다드",
    )
    write_pdf(
        DOCS / "AcrossIcon_고객_사용방법_프리미엄.pdf",
        build_customer_premium(s, font),
        doc_title="AcrossIcon AI 고객 사용 방법 · 프리미엄",
    )


if __name__ == "__main__":
    main()
