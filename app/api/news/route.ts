import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1'
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newsData = Array.isArray(body) ? body : [body];
    
    console.log(`✅ n8n 신호 수신: 기사 ${newsData.length}건 처리 시작`);

    // 핵심 수정 부분: onConflict 옵션 추가
    const { data, error } = await supabase
      .from('news')
      .upsert(
        newsData.map((news: any) => ({
          title: news.title || "제목 없는 뉴스",
          content: news.content || news.summary || "본문 내용이 없습니다.",
          url: news.url || "#",
          category: news.category || '생활',
          source: news.source || 'AI 뉴스'
        })),
        { onConflict: 'title' } // <-- "제목이 겹치면 에러 내지 말고 업데이트해!"라는 뜻
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