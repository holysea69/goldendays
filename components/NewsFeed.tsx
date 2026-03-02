"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  NewsItem, N8nNewsItem, Category,
  mapN8nToNewsItem, normalizeN8nResponse, extractJsonFromString, superParseNewsItems,
  inferCategory, inferEmoji, makeId, getTodayDateStr,
} from "./newsData";
import NewsCard from "./NewsCard";
import NewsModal from "./NewsModal";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "48px 36px", textAlign: "center" }}>
      <div style={{ width: 88, height: 88, borderRadius: 28, background: "linear-gradient(135deg, #e8f0ff 0%, #d0e0ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, animation: "pulse 2s ease-in-out infinite" }}>📡</div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 900, color: "#1a1a2e", lineHeight: 1.45, marginBottom: 8 }}>골든이가 뉴스를 수집 중입니다{dots}</p>
        <p style={{ fontSize: 18, color: "#5a5a7a", fontWeight: 600 }}>AI가 오늘의 시니어 소식을 취재 중이에요 🔍</p>
      </div>
      <p style={{ fontSize: 14, color: "#9ba8bf", fontWeight: 600 }}>경과: {elapsed}초</p>
    </div>
  );
}

// ── 초기 대기 화면 ────────────────────────────────────────────────────────────
function EmptyState({ onFetch, errorMsg }: { onFetch: () => void; errorMsg: string }) {
  const isRetryGuide = errorMsg.includes("정리 중") || errorMsg.includes("잠시 후");
  const hasError = !!errorMsg;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "48px 36px", textAlign: "center" }}>
      <div style={{ width: 90, height: 90, borderRadius: 28, backgroundColor: isRetryGuide ? "#fffbe8" : hasError ? "#fff0f0" : "#e8f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>
        {isRetryGuide ? "⏳" : hasError ? "🤖" : "📰"}
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.4, marginBottom: 8 }}>
          {isRetryGuide ? "뉴스를 준비하고 있어요" : hasError ? "뉴스 수집에 실패했어요" : "오늘의 소식을 불러올 준비가 됐어요"}
        </p>
        <p style={{ fontSize: 19, color: "#5a5a7a", lineHeight: 1.6 }}>
          {isRetryGuide ? "AI가 뉴스를 정리 중입니다. 잠시 후 다시 눌러주세요." : hasError ? "아래 버튼을 눌러 다시 시도해 주세요." : "버튼을 누르면 골든이가 최신 뉴스를 바로 취재해 드립니다."}
        </p>
      </div>
      {hasError && !isRetryGuide && (
        <div style={{ padding: "14px 18px", borderRadius: 14, backgroundColor: "#fff0f0", border: "2px solid #ff3b3b", maxWidth: 460, width: "100%", textAlign: "left" }}>
          <p style={{ fontSize: 15, color: "#cc0000", fontWeight: 700 }}>🔴 {errorMsg}</p>
        </div>
      )}
      <button onClick={onFetch} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", borderRadius: 16, fontSize: 20, fontWeight: 700, color: "#fff", border: "none", backgroundColor: "#0046ff", cursor: "pointer", fontFamily: "inherit" }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15.5-4.5M20 15a9 9 0 0 1-15.5 4.5" />
        </svg>
        {isRetryGuide ? "다시 불러오기" : hasError ? "다시 시도하기" : "최신 소식 가져오기"}
      </button>
    </div>
  );
}

// ── 직접 작성 모달 ────────────────────────────────────────────────────────────
const VALID_CATEGORIES: Category[] = ["건강", "복지", "일자리", "문화", "생활"];

interface WriteModalProps {
  onClose: () => void;
  onSave: (item: NewsItem) => void;
}

function WriteModal({ onClose, onSave }: WriteModalProps) {
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState<Category>("생활");
  const [content,  setContent]  = useState("");
  const [source,   setSource]   = useState("운영자");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) { setErr("제목을 입력해 주세요."); return; }
    if (!content.trim()) { setErr("본문을 입력해 주세요."); return; }
    setSaving(true);
    const now = Date.now();
    const emoji = inferEmoji(category);
    const today = getTodayDateStr();
    const item: NewsItem = {
      id:          makeId(title.trim(), now, 0),
      category,
      title:       title.trim(),
      summary:     content.trim().slice(0, 150),
      fullContent: content.trim(),
      content:     content.trim(),
      isHtml:      false,
      source:      source.trim() || "운영자",
      date:        today,
      fetchedAt:   now,
      readTime:    "3분",
      emoji,
    };
    onSave(item);
    setSaving(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "rgba(26,26,46,0.65)", backdropFilter: "blur(5px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "100%", maxWidth: 620, maxHeight: "92vh", backgroundColor: "#fffdf9", borderRadius: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* 헤더 */}
        <div style={{ flexShrink: 0, padding: "28px 32px 20px", background: "linear-gradient(135deg,#e8f0ff 0%,#f0ebe3 100%)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a2e" }}>✏️ 직접 작성</h2>
          <button onClick={onClose} style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#5a5a7a", border: "none", backgroundColor: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit" }} aria-label="닫기">✕</button>
        </div>

        {/* 폼 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* 제목 */}
          <div>
            <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#3a3a5a", marginBottom: 6 }}>제목 *</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErr(""); }}
              placeholder="기사 제목을 입력하세요"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #d0d8e8", fontSize: 18, fontFamily: "inherit", color: "#1a1a2e", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#3a3a5a", marginBottom: 6 }}>카테고리 *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VALID_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ padding: "8px 18px", borderRadius: 999, fontSize: 16, fontWeight: 700, border: category === cat ? "none" : "2px solid #d0d8f0", backgroundColor: category === cat ? "#0046ff" : "#fff", color: category === cat ? "#fff" : "#5a5a7a", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {inferEmoji(cat)} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 출처 */}
          <div>
            <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#3a3a5a", marginBottom: 6 }}>출처</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="출처 (기본: 운영자)"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #d0d8e8", fontSize: 17, fontFamily: "inherit", color: "#1a1a2e", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* 본문 */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#3a3a5a", marginBottom: 6 }}>본문 *</label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setErr(""); }}
              placeholder="본문 내용을 입력하세요"
              rows={9}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid #d0d8e8", fontSize: 17, fontFamily: "inherit", color: "#1a1a2e", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }}
            />
          </div>

          {err && <p style={{ fontSize: 15, color: "#cc0000", fontWeight: 700 }}>🔴 {err}</p>}
        </div>

        {/* 하단 버튼 */}
        <div style={{ flexShrink: 0, padding: "16px 32px 24px", display: "flex", gap: 12, borderTop: "2px solid #ede8df" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px 0", borderRadius: 16, fontSize: 20, fontWeight: 700, color: "#5a5a7a", border: "2px solid #d0d8e8", backgroundColor: "#fff", cursor: "pointer", fontFamily: "inherit" }}>취소</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 2, padding: "14px 0", borderRadius: 16, fontSize: 20, fontWeight: 700, color: "#fff", border: "none", background: "linear-gradient(135deg,#0046ff,#0066ff)", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(0,70,255,0.3)" }}
          >
            {saving ? "저장 중..." : "📝 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 중복 제거 (제목 기준) ──────────────────────────────────────────────────────
function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/[\s\-_·•.,!?'"]/g, "");
}
function dedup(items: NewsItem[]): NewsItem[] {
  const seenIds    = new Set<string>();
  const seenTitles = new Set<string>();
  return items.filter((item) => {
    const tk = normalizeTitle(item.title);
    if (seenIds.has(item.id) || seenTitles.has(tk)) return false;
    seenIds.add(item.id);
    seenTitles.add(tk);
    return true;
  });
}

// ── localStorage ──────────────────────────────────────────────────────────────
const LS_KEY         = "golden_archive";
const LS_LEGACY_KEYS = ["news_archive", "golden-days:news-archive"];
const MAX_ARCHIVE    = 300;

function loadFromStorage(): NewsItem[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      for (const k of LS_LEGACY_KEYS) {
        raw = localStorage.getItem(k);
        if (raw) break;
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NewsItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed.map((item) => ({
      ...item,
      fullContent: item.fullContent || item.content || "",
      content:     item.content     || item.fullContent || "",
    }));
  } catch { return []; }
}

function saveToStorage(items: NewsItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_ARCHIVE)));
    for (const k of LS_LEGACY_KEYS) localStorage.removeItem(k);
  } catch {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX_ARCHIVE / 2))); } catch { /* 계속 */ }
  }
}

// ── 날짜 정렬용 숫자 변환 ─────────────────────────────────────────────────────
function dateStrToNum(d: string): number {
  if (!d) return 0;
  const digits = d.replace(/\D/g, "");
  if (digits.length < 8) return 0;
  const n = parseInt(digits.slice(0, 8), 10);
  return isNaN(n) ? 0 : n;
}

// ── 병합 + 정렬 + 저장 ────────────────────────────────────────────────────────
function mergeAndSave(incoming: NewsItem[], existing: NewsItem[]): NewsItem[] {
  const merged = dedup([...incoming, ...existing]);
  merged.sort((a, b) => {
    const dd = dateStrToNum(b.date) - dateStrToNum(a.date);
    return dd !== 0 ? dd : b.fetchedAt - a.fetchedAt;
  });
  saveToStorage(merged);
  return merged;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function NewsFeed() {
  const [mounted,        setMounted]       = useState(false);
  const [activeCategory, setActiveCategory] = useState<"전체" | Category>("전체");
  const [selectedNews,   setSelectedNews]  = useState<NewsItem | null>(null);
  const [archive,        setArchive]       = useState<NewsItem[]>([]);
  const [isLoading,      setIsLoading]     = useState(false);
  const [isLive,         setIsLive]        = useState(false);
  const [lastUpdated,    setLastUpdated]   = useState("");
  const [errorMsg,       setErrorMsg]      = useState("");
  const [toastMsg,       setToastMsg]      = useState("");
  const [showWriteModal, setShowWriteModal] = useState(false);

  const fetchingRef = useRef(false);
  const archiveRef  = useRef<NewsItem[]>([]);
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 후 localStorage 복원 (Hydration mismatch 방지)
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved.length > 0) {
      archiveRef.current = saved;
      setArchive(saved);
      setIsLive(true);
      const latest = Math.max(...saved.map((n) => n.fetchedAt));
      const d = new Date(latest);
      setLastUpdated(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }
    setMounted(true);
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(""), 4000);
  }, []);

  const mergeIntoArchive = useCallback((incoming: NewsItem[]) => {
    const next = mergeAndSave(incoming, archiveRef.current);
    archiveRef.current = next;
    setArchive(next);
  }, []);

  const handleManualSave = useCallback((item: NewsItem) => {
    const next = mergeAndSave([item], archiveRef.current);
    archiveRef.current = next;
    setArchive(next);
    setIsLive(true);
    const d = new Date(item.fetchedAt);
    setLastUpdated(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    showToast(`✅ "${item.title.slice(0, 20)}" 글이 저장됐습니다!`);
  }, [showToast]);

  // ── n8n 호출 → 파싱 ────────────────────────────────────────────────────────
  const callAndParse = useCallback(async (signal: AbortSignal, attempt: number) => {
    const res = await fetch(`/api/news?t=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ chatInput: "오늘의 시니어 건강 및 복지 뉴스 찾아줘" }),
      cache: "no-store",
      signal,
    });

    const rawText  = await res.text();
    const fetchedAt = Date.now();

    console.group(`%c[n8n] ${attempt}차 | HTTP ${res.status} | ${rawText.length}bytes`, "color:#0046ff;font-weight:bold");
    console.log("원본:", rawText.slice(0, 600));
    try { console.log("파싱:", JSON.parse(rawText)); } catch { /* 계속 */ }
    console.groupEnd();

    // HTTP 에러이면서 뉴스 데이터도 없으면 즉시 오류 반환
    if (!res.ok) {
      const hasNewsData = rawText.includes("news_list") || rawText.includes('"title"') || rawText.includes("full_content");
      if (!hasNewsData) {
        let errMsg = `서버 오류 (HTTP ${res.status})`;
        try {
          const errBody = JSON.parse(rawText) as Record<string, unknown>;
          if (typeof errBody.error === "string") errMsg = errBody.error;
        } catch { /* 계속 */ }
        return { ok: false, aiRambled: false, items: [] as NewsItem[], errMsg };
      }
    }

    // 파싱 파이프라인
    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      try {
        const extracted = extractJsonFromString(rawText);
        body = extracted ? JSON.parse(extracted) : null;
      } catch { /* 계속 */ }
      if (!body) body = [{ output: rawText }];
    }

    let rawItems: N8nNewsItem[] = normalizeN8nResponse(body);
    console.log(`🔍 [${attempt}차] 정규화: ${rawItems.length}건`);

    if (rawItems.length === 0) {
      rawItems = superParseNewsItems(rawText);
      console.log(`🦸 [${attempt}차] 슈퍼파서: ${rawItems.length}건`);
    }

    if (rawItems.length > 0) {
      const items = rawItems.map((item, idx) => mapN8nToNewsItem(item, fetchedAt, idx));
      console.log(`🗞️ [${attempt}차] 변환 완료: ${items.length}건`);
      items.forEach((m, i) => console.log(`  [${i + 1}] [${m.category}] ${m.title.slice(0, 40)} | 본문 ${m.fullContent.length}자`));
      return { ok: true, aiRambled: false, items };
    }

    // 뉴스 구조 없음 → 재시도
    const hasNewsHint = rawText.includes("title") || rawText.includes("news") || rawText.includes("{");
    return { ok: false, aiRambled: true, items: [] as NewsItem[], errMsg: hasNewsHint ? "파싱 실패" : "AI 헛소리" };
  }, []);

  // ── 뉴스 가져오기 (버튼 클릭) ──────────────────────────────────────────────
  const fetchNews = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    setErrorMsg("");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 305_000);

    try {
      let result = await callAndParse(controller.signal, 1);

      // AI 헛소리 감지 시 1회 재시도
      if (!result.ok && result.aiRambled) {
        showToast("⚠️ AI 재응답 중...");
        await new Promise((r) => setTimeout(r, 2000));
        result = await callAndParse(controller.signal, 2);
      }

      clearTimeout(timer);

      if (result.ok && result.items.length > 0) {
        mergeIntoArchive(result.items);
        setErrorMsg("");
        setIsLive(true);
        const now = new Date();
        setLastUpdated(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
        showToast(`✅ 뉴스 ${result.items.length}건을 가져왔습니다!`);
        return;
      }

      if (result.aiRambled) {
        setErrorMsg("뉴스 데이터를 정리 중입니다. 잠시 후 다시 시도해 주세요.");
        showToast("⏳ 잠시 후 다시 시도해 주세요.");
        return;
      }

      const msg = (result as { errMsg?: string }).errMsg ?? "서버에서 오류가 반환됐습니다.";
      setErrorMsg(msg.includes("정리 중") ? "뉴스 데이터를 정리 중입니다. 잠시 후 다시 시도해 주세요." : msg);
      showToast(`❌ ${msg.slice(0, 30)}`);

    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const msg = isAbort ? "응답 시간 초과. n8n 워크플로우를 확인 후 다시 눌러주세요." : "서버 연결 오류가 발생했습니다.";
      setErrorMsg(msg);
      showToast(`❌ ${isAbort ? "시간 초과" : "연결 오류"}`);
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, [showToast, mergeIntoArchive, callAndParse]);

  // ── 카테고리 필터링 ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeCategory === "전체") return archive;
    return archive.filter((n) => n.category === activeCategory);
  }, [archive, activeCategory]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { 전체: archive.length };
    for (const item of archive) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [archive]);

  // 마운트 전: 스피너만 표시 (Hydration mismatch 방지)
  if (!mounted) {
    return (
      <section style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid #e8eeff", borderTopColor: "#0046ff", animation: "spin 0.8s linear infinite" }} />
        </div>
      </section>
    );
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>

      {/* ── 헤더 ── */}
      <div style={{ flexShrink: 0, padding: "18px 22px 12px", backgroundColor: "#faf8f3", borderBottom: "2px solid #e0d9cf" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: "#e8f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📰</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a1a2e", lineHeight: 1.3 }}>오늘의 정보</h1>
              <p style={{ fontSize: 16, color: "#5a5a7a", marginTop: 1 }}>건강 · 복지 · 일자리 · 문화 최신 소식</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 14, fontWeight: 700, backgroundColor: isLive ? "#e8fff0" : errorMsg ? "#fff0f0" : "#f0f4ff", color: isLive ? "#007a38" : errorMsg ? "#cc0000" : "#0046ff", border: `1.5px solid ${isLive ? "#007a38" : errorMsg ? "#ff3b3b" : "#0046ff"}` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", backgroundColor: isLoading ? "#aab4cc" : isLive ? "#00c853" : errorMsg ? "#ff3b3b" : "#0046ff" }} />
              {isLoading ? "취재 중..." : isLive ? `🔴 실시간 (${archive.length}건)` : errorMsg ? "⚠️ 오류" : "대기 중"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {lastUpdated && <span style={{ fontSize: 13, color: "#9ba8bf" }}>{lastUpdated} 업데이트</span>}
              <button
                onClick={() => setShowWriteModal(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, fontSize: 16, fontWeight: 700, color: "#0046ff", border: "2px solid #0046ff", backgroundColor: "#fff", cursor: "pointer", fontFamily: "inherit" }}
              >
                ✏️ 직접 작성
              </button>
              <button
                onClick={fetchNews}
                disabled={isLoading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, fontSize: 16, fontWeight: 700, color: isLoading ? "#888" : "#fff", border: "none", backgroundColor: isLoading ? "#d0d8f0" : "#0046ff", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {isLoading ? <SpinnerInline /> : (
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 15.5-4.5M20 15a9 9 0 0 1-15.5 4.5" />
                  </svg>
                )}
                {isLoading ? "취재 중..." : "최신 소식"}
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count    = countByCategory[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 14, fontSize: 17, fontWeight: 700, border: isActive ? "none" : "2px solid #d0d8f0", backgroundColor: isActive ? "#0046ff" : "#ffffff", color: isActive ? "#ffffff" : "#5a5a7a", cursor: "pointer", fontFamily: "inherit" }}
              >
                {CAT_LABELS[cat]}
                {count > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 20, height: 20, borderRadius: 999, fontSize: 12, fontWeight: 800, backgroundColor: isActive ? "rgba(255,255,255,0.28)" : "#e8eeff", color: isActive ? "#fff" : "#0046ff", padding: "0 5px" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* 외부 링크 버튼 (새 창 열기) */}
          {EXTERNAL_LINKS.map(({ key, label, url }) => (
            <button
              key={key}
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 14, fontSize: 17, fontWeight: 700, border: "2px solid #d0d8f0", backgroundColor: "#ffffff", color: "#5a5a7a", cursor: "pointer", fontFamily: "inherit" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 피드 본문 ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", overflowY: "auto", padding: "12px 20px 24px" }}>

          {isLoading && archive.length === 0 ? (
            <LoadingBanner />
          ) : !isLoading && archive.length === 0 ? (
            <EmptyState onFetch={fetchNews} errorMsg={errorMsg} />
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, textAlign: "center", paddingTop: 32 }}>
              <span style={{ fontSize: 56, marginBottom: 14 }}>🔍</span>
              <p style={{ fontSize: 22, color: "#5a5a7a", fontWeight: 700 }}>[{activeCategory}] 카테고리 기사가 아직 없습니다.</p>
              <p style={{ fontSize: 16, color: "#9ba8bf", marginTop: 8 }}>최신 소식 버튼으로 더 많은 기사를 불러오세요.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 2 }}>
                <p style={{ fontSize: 14, color: "#9ba8bf", fontWeight: 600 }}>
                  {activeCategory === "전체" ? `전체 ${archive.length}건` : `${activeCategory} ${filtered.length}건`} · 최신순
                </p>
                {isLoading && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#0046ff", fontWeight: 600 }}>
                    <SpinnerInline /> 새 기사 취재 중...
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {filtered.map((item) => (
                  <NewsCard key={item.id} item={item} onClick={setSelectedNews} />
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── 오류 배너 ── */}
      {errorMsg && archive.length > 0 && (
        <div style={{ flexShrink: 0, margin: "0 20px 10px", padding: "12px 18px", borderRadius: 14, backgroundColor: "#fff0f0", border: "2px solid #ff3b3b", display: "flex", alignItems: "center", gap: 8, fontSize: 17, color: "#cc0000", fontWeight: 700 }}>
          🔴 {errorMsg}
        </div>
      )}

      {/* ── 토스트 ── */}
      {toastMsg && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 14, backgroundColor: "#1a1a2e", color: "#fff", fontSize: 16, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}

      {selectedNews && (
        <NewsModal
          item={selectedNews}
          onClose={() => setSelectedNews(null)}
          onUpdate={(updated) => {
            const next = archiveRef.current.map((n) => n.id === updated.id ? updated : n);
            archiveRef.current = next;
            setArchive(next);
            saveToStorage(next);
            setSelectedNews(updated);
            showToast("✅ 수정이 저장됐습니다!");
          }}
        />
      )}

      {showWriteModal && (
        <WriteModal
          onClose={() => setShowWriteModal(false)}
          onSave={handleManualSave}
        />
      )}
    </section>
  );
}
