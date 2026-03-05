import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Vercel에 API 키가 등록되지 않았습니다." }, { status: 500 });
    }

    // [수정 포인트] 가장 호환성이 높은 'gemini-pro' 모델로 변경했습니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const prompt = `당신은 시니어 뉴스 서비스 '골든 데이즈'의 친절한 상담원 '골든이'입니다. 어르신들께 따뜻하고 명확하게 존댓말로 핵심만 답변해 주세요. 질문: ${message}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        reply: `AI 설정 오류: ${data.error?.message || "알 수 없는 오류"}` 
      }, { status: 500 });
    }

    const replyText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error("Fetch 통신 에러:", error);
    return NextResponse.json({ reply: "AI 연결이 지연되고 있습니다." }, { status: 500 });
  }
}