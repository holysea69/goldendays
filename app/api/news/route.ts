import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 1. Supabase 연결
const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1' // 보안을 위해 가급적 환경변수 사용 권장
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // n8n에서 데이터가 배열(리스트)로 들어오는지, 단일 객체로 들어오는지 확인
    const newsData = Array.isArray(body) ? body : [body];
    
    console.log(`✅ n8n 신호 수신: 기사 ${newsData.length}건 처리 시작`);

    // 2. 여러 개의 데이터를 한꺼번에 Supabase에 저장 (Bulk Insert)
    const { data, error } = await supabase
      .from('news')
      .insert(
        newsData.map((news: any) => ({
          title: news.title || "제목 없는 뉴스",
          content: news.content || news.summary || "본문 내용이 없습니다.",
          url: news.url || "#",
          category: news.category || '생활',
          source: news.source || 'AI 뉴스'
        }))
      )

    if (error) {
      console.error("❌ Supabase 저장 에러:", error.message);
      throw error;
    }

    return NextResponse.json({ success: true, count: newsData.length })
  } catch (error: any) {
    console.error("❌ 처리 실패:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}