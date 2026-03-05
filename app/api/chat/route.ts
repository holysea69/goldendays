import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 서버 배포 환경(Vercel)과 로컬 환경(.env.local) 모두 대응하는 안전한 키 호출
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ reply: "서버에 AI 키 설정이 되어 있지 않습니다. Vercel 설정을 확인해 주세요." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // 어르신 맞춤형 프롬프트 설정
    const prompt = `당신은 시니어 뉴스 서비스 '골든 데이즈'의 상담원 '골든이'입니다. 
    따뜻하고 친절한 말투로 어르신들께 답변해 주세요. 답변은 핵심 위주로 짧게 하세요.
    질문: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ 
      reply: "죄송합니다. AI 연결이 지연되고 있습니다. 잠시 후 다시 시도해 주세요." 
    }, { status: 500 });
  }
}