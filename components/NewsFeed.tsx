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

// ── 인라인 스피너 ─────────────────────────────────────────────────────────────
function SpinnerInline() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5}
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
      <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ── 로딩 배너 ─────────────────────────────────────────────────────────────────
function LoadingBanner() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const dots = ".".repeat((elapsed % 3) + 1).padEnd(3, "\u00a0");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 15, padding: "40px 20px", textAlign: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: 24, background: "linear-gradient(135deg, #e8f0ff 0%, #d0e0ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, animation: "pulse 2s ease-in-out infinite" }}>📡</div>
      <div>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 6 }}>골든이가 뉴스를 수집 중입니다{dots}</p>
        <p style={{ fontSize: 16, color: "#5a5a7a", fontWeight: 600 }}>AI가 오늘의 소식을 취재 중이에요 🔍</p>
      </div>
      <p style={{ fontSize: 13, color: "#9ba8bf", fontWeight: 600 }}>경과: {elapsed}초</p>
    </div>
  );
}

// ── 초기 대기 화면 ────────────────────────────────────────────────────────────
function EmptyState({ onFetch, errorMsg }: { onFetch: () => void; errorMsg: string }) {
  const isRetryGuide = errorMsg.includes("정리 중") || errorMsg.includes("잠시 후");
  const hasError = !!errorMsg;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: isRetryGuide ? "#fffbe8" : hasError ? "#fff0f0" : "#e8f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
        {isRetryGuide ? "⏳" : hasError ? "🤖" : "📰"}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 8 }}>
          {isRetryGuide ? "뉴스를 준비하고 있어요" : hasError ? "뉴스 수집에 실패했어요" : "오늘의 소식을 불러올까요?"}
        </p>
        <p style={{ fontSize: 16, color: "#5a5a7a", lineHeight: 1.6 }}>
          {isRetryGuide ? "AI가 뉴스를 정리 중입니다. 잠시 후 다시 눌러주세요." : hasError ? "아래 버튼을 눌러 다시 시도해 주세요." : "버튼을 누르면 최신 소식을 바로 취재해 드립니다."}
        </p>
      </div>
      <button onClick={onFetch} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, fontSize: 18, fontWeight: 700, color: "#fff", border: "none", backgroundColor: "#0046ff", cursor: "pointer", fontFamily: "inherit" }}>
        최신 소식 가져오기
      </button>
    </div>
  );
}

// ── 직접 작성 모달 (기존과 동일하되 디자인 소폭 개선) ───────────────────────────────────
const VALID_CATEGORIES: Category[] = ["건강", "복지", "일자리", "문화", "생활"];

interface WriteModalProps {
  onClose: () => void;
  onSave: (item: NewsItem) => void;
}

function WriteModal({ onClose, onSave }: WriteModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("생활");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("운영자");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = () => {
    if (!title.trim()) { setErr("제목을 입력해 주세요."); return; }
    if (!content.trim()) { setErr("본문을 입력해 주세요."); return; }
    setSaving(true);
    const now = Date.now();
    const item: NewsItem = {
      id: makeId(title.trim(), now, 0),
      category,
      title: title.trim(),
      summary: content.trim().slice(0, 150),
      fullContent: content.trim(),
      content: content.trim(),
      isHtml: false,
      source: source.trim() || "운영자",
      date: getTodayDateStr(),
      fetchedAt: now,
      readTime: "3분",
      emoji: inferEmoji(category),
    };
    onSave(item);
    setSaving(false);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <div style={{ padding: "20px 24px", background: "#f8f9fa", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>✏️ 직접 작성</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 16 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {VALID_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 14, fontWeight: 600, border: category === cat ? "none" : "1px solid #ddd", backgroundColor: category === cat ? "#0046ff" : "#fff", color: category === cat ? "#fff" : "#555" }}>{cat}</button>
            ))}
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={6} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, resize: "none" }} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #eee", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>취소</button>
          <button onClick={handleSave} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: "#0046ff", color: "#fff", fontWeight: 700 }}>저장하기</button>
        </div>
      </div>
    </div>
  );
}

// ── 유틸리티 ──────────────────────────────────────────────────────────────────
function normalizeTitle(title: string): string { return title.trim().toLowerCase().replace(/[\s\-_·•.,!?'"]/g, ""); }
function dedup(items: NewsItem[]): NewsItem[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  return items.filter((item) => {
    const tk = normalizeTitle(item.title);
    if (seenIds.has(item.id) || seenTitles.has(tk)) return false;
    seenIds.add(item.id);
    seenTitles.add(tk);
    return true;
  });
}
const LS_KEY = "golden_archive";
function loadFromStorage(): NewsItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveToStorage(items: NewsItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 200)));
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
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
    const saved = loadFromStorage();
    if (saved.length > 0) { setArchive(saved); }
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchNews = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedItems: NewsItem[] = data.map((item: any, idx: number) => ({
          id: item.id.toString(),
          category: (item.category as Category) || "생활",
          title: item.title || "제목 없음",
          summary: (item.content || "").slice(0, 120) + "...",
          fullContent: item.content || "내용 없음",
          content: item.content || "",
          source: item.source || "AI 뉴스",
          date: getTodayDateStr(),
          fetchedAt: Date.now() - idx,
          emoji: inferEmoji(item.category || "생활"),
          readTime: "3분",
          isHtml: false
        }));

        setArchive(formattedItems);
        saveToStorage(formattedItems);
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
        showToast("✅ 뉴스를 업데이트했습니다!");
      } else {
        setErrorMsg("등록된 뉴스가 없습니다.");
      }
    } catch (err) {
      setErrorMsg("데이터를 가져오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const filtered = useMemo(() => activeCategory === "전체" ? archive : archive.filter(n => n.category === activeCategory), [archive, activeCategory]);

  if (!mounted) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#faf8f3" }}>
      
      {/* ── 상단 헤더: 버튼 가로 정렬 및 크기 최적화 ── */}
      <div style={{ flexShrink: 0, padding: "16px 16px 12px", borderBottom: "1px solid #e0d9cf", display: "flex", flexDirection: "column", gap: 12 }}>
        
        {/* 로고 & 액션 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>📰</span>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a2e" }}>오늘의 정보</h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowWriteModal(true)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700, border: "1px solid #0046ff", color: "#0046ff", background: "#fff" }}>✏️ 작성</button>
            <button onClick={fetchNews} disabled={isLoading} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: "#0046ff", color: "#fff", border: "none" }}>{isLoading ? "..." : "새소식"}</button>
          </div>
        </div>

        {/* ── 카테고리 탭 (가로 정렬 & 줄바꿈 허용) ── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 15, fontWeight: 700,
                backgroundColor: activeCategory === cat ? "#0046ff" : "#fff",
                color: activeCategory === cat ? "#fff" : "#5a5a7a",
                border: activeCategory === cat ? "none" : "1px solid #d0d8f0",
                cursor: "pointer"
              }}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
          
          {/* 외부 링크 (유튜브/채팅) 도 가로로 함께 배치 */}
          {EXTERNAL_LINKS.map(({ key, label, url }) => (
            <button
              key={key}
              onClick={() => window.open(url, "_blank")}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 15, fontWeight: 700, backgroundColor: "#fff", color: "#5a5a7a", border: "1px solid #d0d8f0" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 뉴스 목록 피드 ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {isLoading && archive.length === 0 ? (
          <LoadingBanner />
        ) : archive.length === 0 ? (
          <EmptyState onFetch={fetchNews} errorMsg={errorMsg} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <p style={{ fontSize: 13, color: "#9ba8bf", marginBottom: 10, fontWeight: 600 }}>
              {activeCategory} 소식 · {lastUpdated || "최신"} 업데이트
            </p>
            {filtered.map((item) => (
              <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
            ))}
          </div>
        )}
      </div>

      {/* 모달 및 알림 */}
      {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
      {showWriteModal && <WriteModal onClose={() => setShowWriteModal(false)} onSave={fetchNews} />}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "38%", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "#333", color: "#fff", borderRadius: 30, fontSize: 14, zIndex: 2000 }}>
          {toastMsg}
        </div>
      )}
    </section>
  );
}