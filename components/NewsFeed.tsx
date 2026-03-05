"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import NewsCard from "./NewsCard";
import NewsModal from "./NewsModal";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co',
  'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1'
)

const CATEGORIES = ["전체", "건강", "복지", "일자리", "문화", "생활"];
const CAT_LABELS: Record<string, string> = {
  전체: "📋 전체", 건강: "💚 건강", 복지: "💙 복지", 일자리: "💼 일자리", 문화: "🎭 문화", 생활: "🏠 생활",
};

export default function NewsFeed() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [archive, setArchive] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("golden_archive");
    if (raw) { setArchive(JSON.parse(raw)); }
    setMounted(true);
  }, []);

  const fetchNews = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('news').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) {
        const items = data.map((item: any, idx: number) => {
          const rawTitle = item.title || "제목 없음";
          const cleanTitle = rawTitle.split(/ - | \|| -/)[0].trim();
          return {
            ...item,
            id: item.id.toString(),
            category: item.category || "생활",
            title: cleanTitle,
            url: item.url || "", 
            summary: (item.content || "").slice(0, 120) + "...", 
            fullContent: item.content || "",
            source: item.source || "AI 뉴스",
            date: new Date().toLocaleDateString(),
            fetchedAt: Date.now() - idx,
          };
        });
        setArchive(items);
        localStorage.setItem("golden_archive", JSON.stringify(items));
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, [isLoading]);

  const filtered = useMemo(() => activeCategory === "전체" ? archive : archive.filter(n => n.category === activeCategory), [archive, activeCategory]);

  if (!mounted) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#faf8f3", overflow: "hidden" }}>
      <header style={{ flexShrink: 0, padding: "16px 0", borderBottom: "1px solid #e0d9cf", backgroundColor: "rgba(250, 248, 243, 0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 24 }}>☀️</span><h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a2e" }}>골든 데이즈</h1></div>
            <button onClick={fetchNews} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800, background: "#0046ff", color: "#fff", border: "none" }}>{isLoading ? "..." : "새소식 확인"}</button>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, backgroundColor: activeCategory === cat ? "#1a1a2e" : "#fff", color: activeCategory === cat ? "#fff" : "#5a5a7a", border: "1px solid #d0d8f0", whiteSpace: "nowrap" }}>{CAT_LABELS[cat]}</button>
            ))}
            <div style={{ width: "1px", backgroundColor: "#e0d9cf", margin: "4px 4px" }}></div>
            <a href="https://www.youtube.com/..." target="_blank" rel="noopener noreferrer" style={{ padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, backgroundColor: "#fff", color: "#ff0000", border: "1px solid #ffcccc", textDecoration: "none", whiteSpace: "nowrap" }}>📺 건강 유튜브</a>
            <a href="https://t.me/..." target="_blank" rel="noopener noreferrer" style={{ padding: "6px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, backgroundColor: "#fff", color: "#0088cc", border: "1px solid #cce4ff", textDecoration: "none", whiteSpace: "nowrap" }}>💬 채팅방</a>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: "17px", fontWeight: 800 }}>{activeCategory} 최신 소식</h2>
            <span style={{ fontSize: "12px", color: "#9ba8bf" }}>업데이트: {lastUpdated || "최신"}</span>
          </div>
          
          {/* 🌟 그리드 폭 축소 (minmax 240px) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px", paddingBottom: "100px" }}>
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
            ))}
          </div>
        </div>
      </div>
      {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
    </section>
  );
}