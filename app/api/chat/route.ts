import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 서버 배포 환경과 로컬 환경 모두 대응
const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ reply: "서버에 API 키 설정이 되어 있지 않습니다." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`당신은 시니어 상담원 골든이입니다. 친절하게 답하세요: ${message}`);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ reply: "죄송해요, 잠시 목소리가 안 나오네요. (에러: " + error.message + ")" }, { status: 500 });
  }
}