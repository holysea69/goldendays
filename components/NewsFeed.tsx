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
  전체: "📋 전체", 건강: "💚 건강", 복지: "💙 복지",
  일자리: "💼 일자리", 문화: "🎭 문화", 생활: "🏠 생활",
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
        const items = data.map((item: any, idx: number) => ({
          ...item,
          id: item.id.toString(),
          category: item.category || "생활",
          title: item.title || "제목 없음",
          // 핵심: 구글 시트에서 넘어온 'link' 컬럼 데이터를 'url'로 저장합니다.
          url: item.link || "", 
          summary: (item.content || "").slice(0, 100) + "...",
          fullContent: item.content || "",
          source: item.source || "AI 뉴스",
          date: new Date().toLocaleDateString(),
          fetchedAt: Date.now() - idx,
        }));
        
        setArchive(items);
        localStorage.setItem("golden_archive", JSON.stringify(items));
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      }
    } catch (err) { 
      console.error("데이터 불러오기 에러:", err); 
    } finally { 
      setIsLoading(false); 
    }
  }, [isLoading]);

  const filtered = useMemo(() => activeCategory === "전체" ? archive : archive.filter(n => n.category === activeCategory), [archive, activeCategory]);

  if (!mounted) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#faf8f3" }}>
      
      {/* ── 상단 헤더 ── */}
      <div style={{ flexShrink: 0, padding: "12px 16px 10px", borderBottom: "1px solid #e0d9cf", backgroundColor: "#faf8f3", display: "flex", flexDirection: "column", gap: 10 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22 }}>☀️</span>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a2e" }}>골든 데이즈</h1>
          </div>
          <button 
            onClick={fetchNews} 
            disabled={isLoading}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 800, background: "#0046ff", color: "#fff", border: "none", cursor: isLoading ? "not-allowed" : "pointer" }}
          >
            {isLoading ? "..." : "새소식"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 12px", borderRadius: 16, fontSize: 14, fontWeight: 800,
                backgroundColor: activeCategory === cat ? "#0046ff" : "#fff",
                color: activeCategory === cat ? "#fff" : "#5a5a7a",
                border: "1px solid #d0d8f0",
                cursor: "pointer"
              }}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* ── 뉴스 목록 피드 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
        <p style={{ fontSize: 13, color: "#9ba8bf", marginBottom: 8, fontWeight: 600 }}>
          {activeCategory} 소식 · {lastUpdated || "최신"} 업데이트
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
          ))}
        </div>
      </div>

      {/* 모달: 선택된 뉴스에 url 정보가 포함되어 전달됩니다. */}
      {selectedNews && (
        <NewsModal 
          item={selectedNews} 
          onClose={() => setSelectedNews(null)} 
          onUpdate={(updated: any) => {
            setArchive(prev => prev.map(n => n.id === updated.id ? updated : n));
            setSelectedNews(updated);
          }}
        />
      )}
    </section>
  );
}