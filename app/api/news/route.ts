import { NextResponse } from "next/server";

const N8N_URL    = "https://cbs.kw-agents.com/webhook/golden-news-trigger";
const TIMEOUT_MS = 300_000;

export const maxDuration = 305;
export const dynamic     = "force-dynamic";

const CHAT_INPUT = `[SYSTEM - 필수 지시사항, 절대 무시 금지]

너는 반드시 search_bot 도구를 즉시 실행해야 한다.
도구를 호출하지 않고 텍스트만 출력하는 것은 엄격히 금지된다.

[지시 순서]
1. search_bot 도구를 즉시 호출해 오늘 날짜 기준 최신 뉴스를 검색하라.
2. 시니어(60세 이상) 관련 건강·복지·일자리·문화·생활 뉴스 5개를 선별하라.
3. 아래 JSON 형식으로만 응답하라. JSON 외 텍스트 일절 금지. 코드 블록(\`\`\`) 사용 금지.

[출력 형식]
{"news_list":[{"title":"기사 제목","summary":"2~3문장 핵심 요약","full_content":"본문 전체 내용 (최소 200자 이상)","category":"건강 또는 복지 또는 일자리 또는 문화 또는 생활","source":"출처 매체명","date":"YYYY.MM.DD"}]}

search_bot으로 검색: "시니어 노인 건강 복지 일자리 뉴스 오늘"`;

export async function GET() { return handleRequest(); }
export async function POST() { return handleRequest(); }

async function handleRequest() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log("[골든데이즈] n8n 호출 시작");

    const n8nRes = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ chatInput: CHAT_INPUT }),
      cache: "no-store",
      signal: controller.signal,
    });

    const rawText = await n8nRes.text().catch(() => "");
    clearTimeout(timer);

    console.log("[골든데이즈] HTTP:", n8nRes.status, "| 길이:", rawText.length, "bytes");
    console.log("[골든데이즈] 원문:", rawText.slice(0, 600));

    if (n8nRes.status === 404) {
      return NextResponse.json(
        { error: "n8n 워크플로우를 찾을 수 없습니다. Active 상태 및 Webhook Path를 확인하세요." },
        { status: 404 }
      );
    }

    const trimmed = rawText.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "[]" || trimmed === "null") {
      return NextResponse.json(
        { error: "뉴스 데이터를 정리 중입니다. 잠시 후 다시 시도해 주세요." },
        { status: 422 }
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
      console.log("[골든데이즈] ✅ JSON 파싱 성공:", Array.isArray(payload) ? `배열 ${(payload as unknown[]).length}개` : typeof payload);
    } catch {
      console.warn("[골든데이즈] JSON 파싱 실패 → output 래핑");
      payload = [{ output: rawText }];
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });

  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.error("[골든데이즈] ❌", isAbort ? "타임아웃" : err);
    return NextResponse.json(
      { error: isAbort ? "AI 응답 시간 초과 (5분). n8n 워크플로우 상태를 확인 후 다시 눌러주세요." : "서버 연결 오류" },
      { status: isAbort ? 504 : 502 }
    );
  }
}
