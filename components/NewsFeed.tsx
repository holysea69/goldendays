"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  NewsItem, N8nNewsItem, Category,
  mapN8nToNewsItem, normalizeN8nResponse, extractJsonFromString, superParseNewsItems,
  inferEmoji, makeId, getTodayDateStr,
} from "./newsData";
import NewsCard from "./NewsCard";
import NewsModal from "./NewsModal";
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ofdizlrhyodfhpcwjsfh.supabase.co',
  'sb_publishable_cVfSWepUT4dJMKKoS5NQhQ_EzymBgd1'
)

const CATEGORIES: Array<"전체" | Category> = ["전체", "건강", "복지", "일자리", "문화", "생활"];
const CAT_LABELS: Record<string, string> = {
  전체: "📋 전체", 건강: "💚 건강", 복지: "💙 복지",
  일자리: "💼 일자리", 문화: "🎭 문화", 생활: "🏠 생활",
};

const EXTERNAL_LINKS: Array<{ key: string; label: string; url: string }> = [
  { key: "건강동영상", label: "📺 건강 동영상", url: "https://www.youtube.com/watch?v=voklZaAIJjc&list=PLjlxfKqF4CuBPQ-10Z8160p3VsIZgvxX-" },
  { key: "채팅방",   label: "💬 채팅방",    url: "https://t.me/CBSsenior_bot" },
];

// ── 인라인 스피너 ──
function SpinnerInline() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5}
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
      <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── 로딩 배너 ──
function LoadingBanner() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const dots = ".".repeat((elapsed % 3) + 1).padEnd(3, "\u00a0");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "30px 20px", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: 20, background: "linear-gradient(135deg, #e8f0ff 0%, #d0e0ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, animation: "pulse 2s ease-in-out infinite" }}>📡</div>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>뉴스를 수집 중입니다{dots}</p>
    </div>
  );
}

// ── 초기 대기 화면 ──
function EmptyState({ onFetch, errorMsg }: { onFetch: () => void; errorMsg: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 15, padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 40 }}>📰</div>
      <p style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>오늘의 소식을 불러올까요?</p>
      <button onClick={onFetch} style={{ padding: "10px 24px", borderRadius: 12, fontSize: 17, fontWeight: 700, color: "#fff", border: "none", backgroundColor: "#0046ff", cursor: "pointer" }}>
        최신 소식 가져오기
      </button>
    </div>
  );
}

// ── 메인 컴포넌트 ──
export default function NewsFeed() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"전체" | Category>("전체");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [archive, setArchive] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showWriteModal, setShowWriteModal] = useState(false);

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
          id: item.id.toString(),
          category: item.category || "생활",
          title: item.title || "제목 없음",
          summary: (item.content || "").slice(0, 100) + "...",
          fullContent: item.content || "",
          source: item.source || "AI 뉴스",
          date: getTodayDateStr(),
          fetchedAt: Date.now() - idx,
          emoji: inferEmoji(item.category || "생활"),
        }));
        setArchive(items);
        localStorage.setItem("golden_archive", JSON.stringify(items));
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
      }
    } catch (err) { setErrorMsg("데이터 로드 실패"); }
    finally { setIsLoading(false); }
  }, [isLoading]);

  const filtered = useMemo(() => activeCategory === "전체" ? archive : archive.filter(n => n.category === activeCategory), [archive, activeCategory]);

  if (!mounted) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#faf8f3" }}>
      
      {/* ── 상단 헤더: 가로 정렬 & 공간 최적화 ── */}
      <div style={{ flexShrink: 0, padding: "12px 16px", borderBottom: "2px solid #e0d9cf", backgroundColor: "#faf8f3", display: "flex", flexDirection: "column", gap: 10 }}>
        
        {/* 로고와 버튼을 한 줄에 배치 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 24 }}>☀️</span>
            <h1 style={{ fontSize: 21, fontWeight: 900, color: "#1a1a2e", letterSpacing: "-0.5px" }}>골든 데이즈</h1>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setShowWriteModal(true)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800, border: "1.5px solid #0046ff", color: "#0046ff", background: "#fff" }}>✏️ 작성</button>
            <button onClick={fetchNews} disabled={isLoading} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800, background: "#0046ff", color: "#fff", border: "none" }}>{isLoading ? "..." : "새소식"}</button>
          </div>
        </div>

        {/* 카테고리 탭: 가로 정렬 및 줄바꿈 허용 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 15, fontWeight: 800,
                backgroundColor: activeCategory === cat ? "#0046ff" : "#fff",
                color: activeCategory === cat ? "#fff" : "#5a5a7a",
                border: "1px solid #d0d8f0"
              }}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
          {EXTERNAL_LINKS.map(({ key, label, url }) => (
            <button key={key} onClick={() => window.open(url, "_blank")} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 15, fontWeight: 800, backgroundColor: "#fff", color: "#5a5a7a", border: "1px solid #d0d8f0" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 뉴스 목록 피드 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
        {isLoading && archive.length === 0 ? (
          <LoadingBanner />
        ) : archive.length === 0 ? (
          <EmptyState onFetch={fetchNews} errorMsg={errorMsg} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <p style={{ fontSize: 13, color: "#9ba8bf", marginBottom: 8, fontWeight: 600 }}>
              {activeCategory} 소식 · {lastUpdated || "최신"} 업데이트
            </p>
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
            ))}
          </div>
        )}
      </div>

      {/* 모달 및 안내창 */}
      {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "30%", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "#333", color: "#fff", borderRadius: 30, fontSize: 14, zIndex: 2000 }}>
          {toastMsg}
        </div>
      )}
    </section>
  );
}