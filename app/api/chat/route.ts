import { NextResponse } from "next/server";

const CHATBOT_WEBHOOK_URL = "http://137.131.7.173:5678/webhook/chatbot";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "메시지는 필수입니다." },
        { status: 400 }
      );
    }

    const response = await fetch(CHATBOT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`[Chat Proxy] n8n webhook HTTP ${response.status}: ${text}`);
      console.error(error);
      return NextResponse.json(
        { error: "챗봇 서버 연결이 원활하지 않습니다." },
        { status: response.status }
      );
    }

    const reply = await response.text();
    return NextResponse.json({ reply: reply || "대답을 준비하는 중에 잠시 깜빡했네요. 다시 말씀해주시겠어요?" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
