import { NextResponse } from "next/server";

const WEBHOOK_URL = "http://137.131.7.173:5678/webhook/subscribe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, date } = body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "이메일은 필수입니다." },
        { status: 400 }
      );
    }

    const payload = { email: email.trim(), date: date || new Date().toISOString() };

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      const error = new Error(`[Subscribe Proxy] n8n webhook HTTP ${response.status}: ${text}`);
      console.error(error);
      return NextResponse.json(
        { error: "구독 서버 전송 실패" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "구독 서버 전송 실패" },
      { status: 500 }
    );
  }
}
