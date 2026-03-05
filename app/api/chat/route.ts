import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ reply: "API 키가 설정되지 않았습니다." });
  }

  try {
    // 이 키로 사용할 수 있는 모든 모델 목록을 구글 서버에 요청합니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ reply: `키 권한 오류: ${data.error?.message || "알 수 없는 에러"}` });
    }

    // 모델 이름만 뽑아서 화면(채팅창)에 보여줍니다.
    const modelNames = data.models.map((m: any) => m.name.replace('models/', '')).join(", ");
    
    return NextResponse.json({ reply: `[내 키로 사용 가능한 모델들] ${modelNames}` });

  } catch (error: any) {
    return NextResponse.json({ reply: `진단 스크립트 에러: ${error.message}` });
  }
}