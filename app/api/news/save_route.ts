import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 1. Supabase 연결 설정 (이 정보는 예전에 만드신 Supabase 대시보드에서 가져와야 합니다)
const SUPABASE_URL = 'https://여기에_주소_넣기.supabase.co'
const SUPABASE_KEY = '여기에_ANON_KEY_넣기'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // n8n에서 보내줄 데이터 구조 (시트 컬럼명과 맞춤)
    const { title, summary, link, source, date } = body

    console.log("[골든데이즈] 뉴스 저장 요청 수신:", title);

    // 2. Supabase 'news' 테이블에 데이터 저장
    const { data, error } = await supabase
      .from('news') // Supabase에 만든 테이블 이름
      .insert([
        { 
          title: title, 
          content: summary, 
          url: link, 
          source: source,
          published_at: date || new Date().toISOString()
        }
      ])

    if (error) {
      console.error("Supabase 에러:", error);
      throw error;
    }

    return NextResponse.json({ success: true, message: "저장 완료" })
  } catch (error: any) {
    console.error("저장 실패:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}