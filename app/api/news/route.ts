import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 1. Supabase 연결 (본인의 정보로 꼭 수정하세요!)
const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co', 
  'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1'
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("✅ n8n 신호 수신:", body.title)

    // 2. 데이터 저장 (보완된 버전)
    const { data, error } = await supabase
      .from('news')
      .insert([
        { 
          title: body.title || "제목 없는 뉴스", 
          // 본문이 없으면 요약본이라도 넣고, 둘 다 없으면 안내 문구 출력
          content: body.content || body.summary || "본문 내용이 없습니다.", 
          url: body.url || "#",
          category: body.category || '생활',
          source: body.source || 'AI 뉴스'
        }
      ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ 저장 실패:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}