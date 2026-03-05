import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Vercel에 API 키가 등록되지 않았습니다." }, { status: 500 });
    }

    // 구글 공식 라이브러리로 안전하게 연결
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // [핵심 해결 포인트] 선생님의 키에 존재하는 최신 모델로 정확히 이름 맞춤!
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 시니어 뉴스 서비스 '골든 데이즈'의 친절한 상담원 '골든이'입니다. 어르신들께 따뜻하고 명확하게 존댓말로 핵심만 답변해 주세요. 질문: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini SDK 에러:", error);
    return NextResponse.json({ 
      reply: `AI 연결이 지연되고 있습니다.' (에러: ${error.message})` 
    }, { status: 500 });
  }
}