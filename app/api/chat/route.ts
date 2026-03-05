import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 환경 변수에서 키를 가져오되, 없으면 빈 문자열 처리
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ reply: "서버 API 키 설정이 누락되었습니다." }, { status: 500 });
    }

    // [수정 포인트] 모델명에서 'models/'를 명시하거나 
    // 가장 호환성이 높은 'gemini-pro' 또는 최신 'gemini-1.5-flash'를 정확히 호출
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `당신은 시니어 뉴스 서비스 '골든 데이즈'의 친절한 상담원 '골든이'입니다. 
    어르신들께 답변하듯 따뜻한 존댓말로 핵심만 간단히 답변해 주세요.
    사용자 질문: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini API 상세 에러:", error);
    
    // 에러 발생 시 사용자에게 보일 메시지
    return NextResponse.json({ 
      reply: "죄송합니다. AI 연결이 지연되고 있습니다." 
    }, { status: 500 });
  }
}