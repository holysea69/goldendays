"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import NewsCard from "./NewsCard";
import NewsModal from "./NewsModal";
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 설정
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
    } catch (err) { 
      console.error("데이터 불러오기 에러:", err); 
    } finally { 
      setIsLoading(false); 
    }
  }, [isLoading]);

  const filtered = useMemo(() => activeCategory === "전체" ? archive : archive.filter(n => n.category === activeCategory), [archive, activeCategory]);

  if (!mounted) return null;

  return (
    <section style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      backgroundColor: "#faf8f3",
      overflow: "hidden"
    }}>
      
      {/* 상단 헤더 */}
      <header style={{ 
        flexShrink: 0, 
        padding: "20px 0", 
        borderBottom: "1px solid #e0d9cf", 
        backgroundColor: "rgba(250, 248, 243, 0.92)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>☀️</span>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1a1a2e" }}>골든 데이즈</h1>
            </div>
            <button 
              onClick={fetchNews} 
              disabled={isLoading}
              style={{ 
                padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, 
                background: "#0046ff", color: "#fff", border: "none", cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0, 70, 255, 0.2)"
              }}
            >
              {isLoading ? "..." : "새소식 확인"}
            </button>
          </div>

          {/* 카테고리 및 바로가기 버튼 영역 */}
          <div style={{ 
            display: "flex", 
            gap: 8, 
            flexWrap: "nowrap", 
            overflowX: "auto", 
            paddingBottom: "10px",
            msOverflowStyle: "none", // IE/Edge
            scrollbarWidth: "none",  // Firefox
          }}>
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            
            {/* 1. 기본 카테고리 버튼들 */}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px", borderRadius: 20, fontSize: 15, fontWeight: 700,
                  backgroundColor: activeCategory === cat ? "#1a1a2e" : "#fff",
                  color: activeCategory === cat ? "#fff" : "#5a5a7a",
                  border: "1px solid #d0d8f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}

            {/* 2. 구분선 (선택사항: 시각적 분리를 위해) */}
            <div style={{ width: "1px", backgroundColor: "#e0d9cf", margin: "5px 4px" }}></div>

            {/* 3. 📺 건강 유튜브 바로가기 */}
            <a
              href="https://www.youtube.com/watch?v=voklZaAIJjc&list=PLjlxfKqF4CuBPQ-10Z8160p3VsIZgvxX-"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 15, fontWeight: 700,
                backgroundColor: "#fff",
                color: "#ff0000",
                border: "1px solid #ffcccc",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(255, 0, 0, 0.05)"
              }}
            >
              📺 건강 유튜브
            </a>

            {/* 4. 💬 채팅방 바로가기 */}
            <a
              href="https://t.me/CBSsenior_bot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 18px", borderRadius: 20, fontSize: 15, fontWeight: 700,
                backgroundColor: "#fff",
                color: "#0088cc",
                border: "1px solid #cce4ff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0, 136, 204, 0.05)"
              }}
            >
              💬 채팅방
            </a>
          </div>
        </div>
      </header>

      {/* 뉴스 그리드 영역 (동일) */}
      <div style={{ flex: 1, overflowY: "auto", padding: "30px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a2e" }}>
              {activeCategory} 최신 소식
            </h2>
            <span style={{ fontSize: "13px", color: "#9ba8bf" }}>
              업데이트: {lastUpdated || "최신"}
            </span>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
            gap: "24px",
            paddingBottom: "120px" 
          }}>
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
            ))}
          </div>
        </div>
      </div>

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