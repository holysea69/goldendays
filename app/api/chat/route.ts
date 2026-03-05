import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Vercel 환경 변수 가져오기
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Vercel에 API 키가 등록되지 않았습니다." }, { status: 500 });
    }

    // 구글 공식 라이브러리를 통한 안전한 연결
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `당신은 시니어 뉴스 서비스 '골든 데이즈'의 친절한 상담원 '골든이'입니다. 어르신들께 따뜻하고 명확하게 존댓말로 핵심만 답변해 주세요. 질문: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Gemini SDK 에러:", error);
    return NextResponse.json({ 
      reply: `AI 통신 에러: ${error.message || "AI 연결이 지연되고 있습니다."}` 
    }, { status: 500 });
  }
}