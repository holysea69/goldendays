import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 골든이의 성격(Persona) 부여
    const prompt = `당신은 '골든 데이즈'라는 시니어 뉴스 서비스의 상담원 '골든이'입니다. 
    친절하고 따뜻한 말투로 어르신들께 답변해 주세요. 
    답변은 너무 길지 않게 핵심 위주로, 존댓말을 사용하세요.
    질문 내용: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    return NextResponse.json({ reply: "연결 상태가 불안정해요. 잠시 후 다시 질문해 주시겠어요?" }, { status: 500 });
  }
}