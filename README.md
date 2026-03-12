# 🌟 골든데이즈 (Golden Days)

> 시니어 전용 복지·건강·재테크 정보 플랫폼

## 📋 프로젝트 개요

골든데이즈는 시니어가 가장 편하게 사용할 수 있도록 설계된 시니어 전용 플랫폼입니다.
대화형 인터페이스와 대형 텍스트, 직관적인 UI로 시니어의 디지털 접근성을 높입니다.

## 🎯 주요 기능

### 왼쪽 — 정보 피드
- **자동 스크롤** 뉴스 카드 (복지, 건강, 재테크, 생활)
- **카테고리 필터** 탭으로 원하는 정보만 선택
- **카드 클릭 시** 큰 글씨 팝업으로 상세 내용 확인
- n8n 웹훅 연동으로 실시간 뉴스 수집 가능

### 오른쪽 — 골든이 AI 상담사
- **골든이** 캐릭터와 대화형 챗봇 인터페이스
- **음성 인식** 버튼으로 말로 질문 가능
- **빠른 질문** 버튼으로 자주 묻는 질문 바로 전송
- n8n + OpenAI 연동으로 실제 AI 답변 구현 가능

## 🚀 시작하기

### 사전 준비
- Node.js 18 이상 설치 ([nodejs.org](https://nodejs.org))

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드 및 배포

```bash
npm run build
npm start
```

## 🎨 디자인 시스템

| 항목 | 값 |
|------|-----|
| 포인트 컬러 | `#0046ff` (신뢰의 파란색) |
| 배경색 | `#faf6f0` (눈 편한 미색) |
| 최소 글자 크기 | `20px` |
| 폰트 | Noto Sans KR (고딕체) |

## 📁 파일 구조

```
golden-days-app/
├── app/
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지 (좌우 1:1 분할)
│   └── globals.css       # 글로벌 스타일 + 애니메이션
├── components/
│   ├── NewsFeed.tsx      # 왼쪽 뉴스 피드 + 카테고리 필터
│   ├── NewsCard.tsx      # 개별 뉴스 카드
│   ├── NewsModal.tsx     # 뉴스 상세 팝업 모달
│   ├── ChatBot.tsx       # 오른쪽 챗봇 상담창
│   └── newsData.ts       # 뉴스 타입 정의 + 목 데이터
├── tailwind.config.ts    # Tailwind 커스텀 설정
└── package.json
```

## 🔌 n8n 연동 방법

### 뉴스 피드 연동
`components/NewsFeed.tsx`에서 `NEWS_DATA`를 n8n 웹훅 API 호출로 교체:

```typescript
const [news, setNews] = useState<NewsItem[]>([]);

useEffect(() => {
  fetch('https://your-n8n-webhook.com/news')
    .then(res => res.json())
    .then(data => setNews(data));
}, []);
```

### 챗봇 연동
`components/ChatBot.tsx`의 `sendMessage` 함수에서 setTimeout을 API 호출로 교체:

```typescript
const response = await fetch('https://your-n8n-webhook.com/chat', {
  method: 'POST',
  body: JSON.stringify({ message: trimmed }),
});
const data = await response.json();
```

## ♿ 접근성 (시니어 최적화)

- 모든 버튼에 `aria-label` 적용
- 키보드 네비게이션 지원 (Tab, Enter, ESC)
- 최소 클릭 영역 48px 이상
- 고대비 색상 조합 사용
- 음성 인식 (Web Speech API) 내장
