import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1'
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;
    
    // 데이터가 없으면 빈 배열이라도 반환하여 JSON 에러를 방지합니다.
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("❌ GET 실패:", error.message);
    return NextResponse.json([], { status: 200 }); 
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newsData = Array.isArray(body) ? body : [body];
    
    const { error } = await supabase
      .from('news')
      .upsert(
        newsData.map((news: any) => ({
          title: news.title || "제목 없음",
          content: news.content || news.summary || "내용 없음",
          url: news.url || "#",
          category: news.category || '생활',
          source: news.source || 'AI 뉴스'
        })),
        { onConflict: 'title' }
      );

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ POST 실패:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}