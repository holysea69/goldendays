import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ofdizlrhyodfhpcwjsfh.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1"
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("morning_briefing")
      .select("id, created_at, title, content")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped =
      (data || []).map((row: any) => ({
        id: row.id,
        date: row.created_at,
        news_brief: row.content,
        created_at: row.created_at,
      })) ?? [];

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("❌ morning_briefing GET 실패:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

