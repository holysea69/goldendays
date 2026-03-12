import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ofdizlrhyodfhpcwjsfh.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1"
);

const FALLBACK = {
  youtube_id: "voklZaAIJjc",
  title: "추천 영상",
  is_enabled: true,
};

async function fetchTitleFromYouTube(youtubeId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${youtubeId}`
    );
    const json = await res.json();
    return json?.title ? String(json.title).trim() : "";
  } catch {
    return "";
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("youtube_id, title")
      .eq("id", "featured")
      .single();

    if (error || !data) {
      console.error("Featured video fetch error:", error?.message || "No data");
      const title = await fetchTitleFromYouTube(FALLBACK.youtube_id);
      return NextResponse.json({
        ...FALLBACK,
        title: title || FALLBACK.title,
      });
    }

    const yid = data?.youtube_id ? String(data.youtube_id).trim() : "";
    const validYoutubeId = yid.length >= 10 ? yid : FALLBACK.youtube_id;
    let title = (data?.title && String(data.title).trim()) || "";

    // title이 비어있거나 '추천 영상'이면 유튜브에서 실제 제목 자동 조회
    if (!title || title === FALLBACK.title) {
      const fetched = await fetchTitleFromYouTube(validYoutubeId);
      if (fetched) title = fetched;
    }

    return NextResponse.json({
      youtube_id: validYoutubeId,
      title: title || FALLBACK.title,
      is_enabled: true,
    });
  } catch (err) {
    console.error("Featured video API error:", err);
    return NextResponse.json(FALLBACK);
  }
}
