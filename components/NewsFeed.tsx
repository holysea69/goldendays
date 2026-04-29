"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  category: string;
  created_at: string;
}

interface FeaturedVideoData {
  youtube_id: string;
  title: string;
  is_enabled: boolean;
}

const FEATURED_VIDEO_FALLBACK: FeaturedVideoData = {
  youtube_id: "voklZaAIJjc",
  title: "추천 영상",
  is_enabled: true,
};

const categoryConfig = [
  { name: "전체",     icon: "📋", bg: "bg-slate-100",   bgActive: "bg-slate-700",   border: "border-slate-300",   text: "text-slate-700",   textActive: "text-white" },
  { name: "복지",     icon: "💙", bg: "bg-sky-50",      bgActive: "bg-sky-600",     border: "border-sky-200",     text: "text-sky-800",     textActive: "text-white" },
  { name: "건강",     icon: "💚", bg: "bg-emerald-50",  bgActive: "bg-emerald-600", border: "border-emerald-200", text: "text-emerald-800", textActive: "text-white" },
  { name: "재테크",   icon: "📈", bg: "bg-amber-50",    bgActive: "bg-amber-600",   border: "border-amber-200",   text: "text-amber-800",   textActive: "text-white" },
  { name: "일자리",   icon: "💼", bg: "bg-violet-50",   bgActive: "bg-violet-600",  border: "border-violet-200",  text: "text-violet-800",  textActive: "text-white" },
  { name: "생활정보", icon: "🏠", bg: "bg-teal-50",     bgActive: "bg-teal-600",    border: "border-teal-200",    text: "text-teal-800",    textActive: "text-white" },
  { name: "문화",     icon: "🎭", bg: "bg-fuchsia-50",  bgActive: "bg-fuchsia-600", border: "border-fuchsia-200", text: "text-fuchsia-800", textActive: "text-white" },
  {
    name: "건강 유튜브", icon: "▶️",
    bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800",
    url: "https://www.youtube.com/watch?v=sUE9ad87RpI&list=PLjlxfKqF4CuBPQ-10Z8160p3VsIZgvxX-",
    isLink: true,
  },
] as const;

// 로고 SVG
const SunLogo = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: size, height: size }} className="drop-shadow-sm flex-shrink-0">
    <defs>
      <linearGradient id="gG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#F59E0B" />
        <stop offset="50%"  stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="glG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#FEF3C7" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="28" fill="url(#glG)" stroke="url(#gG)" strokeWidth="3" />
    <circle cx="40" cy="40" r="18" fill="url(#gG)" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
      <g key={i} transform={`rotate(${deg} 40 40)`}>
        <rect x="38" y="12" width="4" height="12" rx="2" fill="url(#gG)" opacity="0.9" />
      </g>
    ))}
  </svg>
);

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideoData | null>(null);
  const [featuredVideoLoading, setFeaturedVideoLoading] = useState(true);

  const jobLinks = [
    { label: "노인 일자리 여기", url: "https://www.seniorro.or.kr/noin/main.do" },
    { label: "고용24",          url: "https://www.work24.go.kr/cm/main.do" },
  ] as const;
  const jobMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (jobMenuRef.current && !jobMenuRef.current.contains(e.target as Node))
        setJobMenuOpen(false);
    };
    if (jobMenuOpen) document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, [jobMenuOpen]);

  // 구독
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;
    setSubscribeStatus("loading");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: new Date().toISOString() }),
      });
      if (response.ok) {
        setSubscribeStatus("success");
        setSubscribeEmail("");
        alert("구독 신청이 완료되었습니다! 💌");
      } else {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
    } catch (err) {
      setSubscribeStatus("error");
      console.error(err);
      alert("죄송합니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubscribeStatus("idle");
    }
  };

  // 추천 영상
  useEffect(() => {
    setFeaturedVideoLoading(true);
    fetch("/api/featured-video")
      .then(res => res.json())
      .then(data => {
        setFeaturedVideo({
          youtube_id: data?.youtube_id?.trim() && data.youtube_id.length >= 10
            ? data.youtube_id.trim()
            : FEATURED_VIDEO_FALLBACK.youtube_id,
          title: data?.title?.trim() || FEATURED_VIDEO_FALLBACK.title,
          is_enabled: data?.is_enabled !== false,
        });
      })
      .catch(() => setFeaturedVideo(FEATURED_VIDEO_FALLBACK))
      .finally(() => setFeaturedVideoLoading(false));
  }, []);

  // 뉴스 데이터
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("데이터 오류");
        const data = await response.json();
        if (Array.isArray(data)) {
          setNews(data);
          setFilteredNews(data);
        }
      } catch (err) {
        console.error("뉴스 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // 카테고리 필터
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setFilteredNews(category === "전체" ? news : news.filter(item => item.category === category));
  };

  // 제목 정리
  const getCleanTitle = (fullTitle: string) => {
    if (!fullTitle) return "";
    const noHtml = fullTitle.replace(/<[^>]+>/g, "").trim();
    return noHtml.split(/\s*[-–—]\s*/)[0].trim();
  };

  // HTML 제거 (카드 미리보기용)
  const stripHtml = (raw: string): string => {
    if (!raw) return "";
    return raw
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, " ").trim();
  };

  // 본문 단락 파싱 (모달용)
  const formatArticleContent = (raw: string): string[] => {
    if (!raw) return [];
    const text = raw
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/div>\s*<div[^>]*>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n").trim();
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    return paragraphs.length > 0 ? paragraphs : (text ? [text] : []);
  };

  // 카테고리별 뱃지 스타일
  const getCategoryBadge = (catName: string) => {
    const cfg = categoryConfig.find(c => c.name === catName);
    if (!cfg) return "bg-slate-100 text-slate-700 border border-slate-200";
    return `${"bg" in cfg ? cfg.bg : "bg-slate-100"} ${"text" in cfg ? cfg.text : "text-slate-700"} border ${"border" in cfg ? cfg.border : "border-slate-200"}`;
  };

  // 로딩
  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 p-8">
      <SunLogo size={64} />
      <div className="text-center">
        <h2 className="text-[22px] font-black italic text-amber-700 mb-1">골든데이즈</h2>
        <p className="text-slate-400 text-[16px]">소식을 정성껏 모으고 있습니다... 😊</p>
      </div>
    </div>
  );

  const emojis = ["📌", "💡", "✨", "🔹", "⭐", "●", "◆", "◎", "✓", "📎"];

  return (
    <>
      {/* ══════════════════════════════════════════
          1. 스티키 네비게이션
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <SunLogo size={44} />
            <div>
              <div className="text-[18px] sm:text-[21px] font-black italic text-amber-700 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                골든데이즈
              </div>
              <div className="hidden sm:block text-[12px] text-slate-400 font-medium leading-tight">
                시니어 정보 플랫폼
              </div>
            </div>
          </div>

          {/* 구독 CTA */}
          <button
            onClick={() => document.getElementById("subscribe-section")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[17px] sm:text-[18px] font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-sm"
          >
            뉴스레터 구독
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          2. 히어로 섹션
      ══════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-4 sm:px-6 py-10 sm:py-14 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[16px] sm:text-[18px] font-bold px-4 py-2 rounded-full mb-5 border border-emerald-200">
            ✦ 시니어를 위한 따뜻한 최신 정보
          </span>
          <h1 className="text-[34px] sm:text-[40px] md:text-[48px] font-black text-slate-900 leading-tight mb-4 break-keep">
            황금기를 더 알차게,{" "}
            <span className="italic bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
              골든데이즈
            </span>
          </h1>
          <p className="text-[19px] sm:text-[22px] text-slate-500 font-medium leading-relaxed mb-8 break-keep">
            복지 혜택부터 건강, 재테크, 일자리까지<br />
            50+ 세대에 꼭 필요한 정보를 매일 전해드립니다.
          </p>

          {/* CTA 버튼 — 계층 구분 */}
          <div className="flex flex-wrap justify-center gap-3">
            {/* 주 CTA */}
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[19px] sm:text-[20px] px-6 sm:px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
              뉴스 브리핑
            </Link>

            {/* 보조 CTA — 일자리 (드롭다운) */}
            <div ref={jobMenuRef} className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setJobMenuOpen(v => !v); }}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-[19px] sm:text-[20px] px-6 sm:px-8 py-4 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow transition-all"
                aria-expanded={jobMenuOpen}
                aria-haspopup="true"
              >
                <span>💼</span>
                일자리 찾기
              </button>
              {jobMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 min-w-[200px] bg-white rounded-xl shadow-xl border border-amber-200 z-[100] overflow-hidden">
                  {jobLinks.map(item => (
                    <a
                      key={item.url}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-4 px-5 text-[16px] font-bold text-slate-700 hover:bg-amber-50 border-b border-amber-100 last:border-b-0 transition-colors"
                      onClick={() => setJobMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* 3순위 CTA */}
            <Link
              href="/board"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:scale-95 text-slate-500 font-semibold text-[19px] sm:text-[20px] px-6 sm:px-8 py-4 rounded-xl border border-slate-200 transition-all"
            >
              <span>💬</span>
              소통방
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. 카테고리 탭 (스티키, 가로 스크롤)
      ══════════════════════════════════════════ */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            {categoryConfig.map(cat => {
              const isActive = !("isLink" in cat && cat.isLink) && selectedCategory === cat.name;
              if ("isLink" in cat && cat.isLink && cat.url) {
                return (
                  <a
                    key={cat.name}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-[17px] sm:text-[18px] font-bold border transition-all bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 whitespace-nowrap"
                  >
                    <span className="text-[20px]">{cat.icon}</span>
                    {cat.name}
                  </a>
                );
              }
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-[17px] sm:text-[18px] font-bold border transition-all whitespace-nowrap ${
                    isActive
                      ? `${"bgActive" in cat ? cat.bgActive : "bg-slate-700"} text-white border-transparent shadow-sm`
                      : `${cat.bg} ${cat.text} ${cat.border} hover:opacity-75`
                  }`}
                >
                  <span className="text-[20px]">{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          4. 뉴스 그리드
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* 추천 유튜브 카드 */}
          {(featuredVideoLoading || (featuredVideo && featuredVideo.is_enabled !== false && featuredVideo.youtube_id)) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                {featuredVideo?.youtube_id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${featuredVideo.youtube_id}?rel=0`}
                    title={featuredVideo.title || "추천 영상"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-slate-200">
                    <div className="w-12 h-12 rounded-full bg-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 text-[16px] font-bold px-3 py-1.5 rounded-full mb-3 w-fit">
                  ▶ 추천 영상
                </span>
                <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-800 leading-snug break-keep flex-1">
                  {featuredVideoLoading ? "영상 불러오는 중..." : (featuredVideo?.title || "")}
                </h3>
              </div>
            </div>
          )}

          {/* 뉴스 카드 */}
          {filteredNews.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => setSelectedNews(item)}
              className="news-card bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group"
            >
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className={`inline-block text-[16px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                  <span className="text-[15px] text-slate-400 flex-shrink-0">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-[21px] sm:text-[23px] font-bold text-slate-900 leading-snug mb-3 break-keep group-hover:text-emerald-700 transition-colors line-clamp-2 flex-shrink-0">
                  {getCleanTitle(item.title)}
                </h3>

                <p className="text-[18px] sm:text-[19px] text-slate-500 leading-relaxed flex-1 line-clamp-3 break-keep font-medium min-w-0">
                  {stripHtml(item.content)}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
                  <span className="text-[15px] text-slate-400 truncate mr-2">{item.source}</span>
                  <span className="text-[17px] font-bold text-emerald-600 flex items-center gap-0.5 flex-shrink-0">
                    자세히 보기 <span className="text-xl">›</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. 구독 배너 (하단)
      ══════════════════════════════════════════ */}
      <section id="subscribe-section" className="bg-emerald-800 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-[26px] sm:text-[30px] font-black mb-3">무료 뉴스레터 구독</h2>
          <p className="text-emerald-200 text-[18px] sm:text-[20px] mb-8 font-medium leading-relaxed">
            매일 아침, 꼭 알아야 할 시니어 정보를 이메일로 전해드립니다.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={subscribeEmail}
              onChange={e => setSubscribeEmail(e.target.value)}
              placeholder="이메일 주소를 입력해 주세요"
              className="flex-1 px-4 py-4 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-emerald-300 font-medium text-[18px] focus:outline-none focus:border-white focus:bg-white/20 transition-colors"
              required
              disabled={subscribeStatus === "loading"}
            />
            <button
              type="submit"
              disabled={subscribeStatus === "loading"}
              className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-900 font-black text-[18px] px-7 py-4 rounded-xl transition-all shadow-md disabled:opacity-60"
            >
              {subscribeStatus === "loading" ? "전송 중..." : "구독하기"}
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. 상세 보기 모달 (로직 그대로 유지)
      ══════════════════════════════════════════ */}
      {selectedNews && (
        <>
          {/* 모바일: 하단 시트 */}
          <div className="sm:hidden fixed inset-0 bg-black/70 z-[2000] flex flex-col justify-end modal-overlay">
            <div className="bg-white w-full max-h-[95vh] rounded-t-3xl border-t border-x border-slate-200 overflow-hidden flex flex-col modal-content">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                <span className={`inline-block text-[17px] font-bold px-3 py-1.5 rounded-full ${getCategoryBadge(selectedNews.category)}`}>
                  {selectedNews.category}
                </span>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 text-2xl"
                >✕</button>
              </div>
              <div className="p-5 flex-1 min-h-0 overflow-y-auto">
                <h2 className="text-[24px] font-bold text-slate-900 mb-4 leading-tight break-keep">
                  {getCleanTitle(selectedNews.title)}
                </h2>
                <div className="flex items-center gap-3 text-slate-400 text-[17px] mb-5 border-b border-slate-100 pb-4">
                  <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                  <span>|</span>
                  <span className="font-semibold text-slate-600">출처: {selectedNews.source}</span>
                </div>
                <div className="text-slate-700 text-[19px] leading-[2.0] break-keep space-y-4">
                  {formatArticleContent(selectedNews.content).map((paragraph, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="flex-shrink-0 flex items-center gap-1 text-xl" aria-hidden>
                        <span className="text-amber-600 font-bold">{(i % 10) + 1}.</span>
                        <span>{emojis[i % emojis.length]}</span>
                      </span>
                      <p className="whitespace-pre-wrap flex-1 min-w-0">{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-[19px] hover:bg-slate-200 transition-colors"
                >닫기</button>
                {selectedNews.url?.trim() && selectedNews.url?.trim() !== "#" && selectedNews.source?.trim() !== "골든데이즈 AI" && (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold text-[19px] text-center hover:bg-emerald-700 transition-colors"
                  >기사 원문 보기</a>
                )}
              </div>
            </div>
          </div>

          {/* PC: 중앙 모달 */}
          <div className="hidden sm:flex fixed inset-0 bg-black/70 items-center justify-center z-[2000] p-4 modal-overlay">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden modal-content">
              <div className="p-7 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className={`inline-block text-[16px] font-bold px-4 py-2 rounded-full ${getCategoryBadge(selectedNews.category)}`}>
                  {selectedNews.category}
                </span>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 text-2xl hover:text-slate-900 hover:border-slate-300 shadow-sm transition-colors"
                >✕</button>
              </div>
              <div className="p-8 max-h-[65vh] overflow-y-auto">
                <h2 className="text-[28px] font-bold text-slate-900 mb-5 leading-tight break-keep">
                  {getCleanTitle(selectedNews.title)}
                </h2>
                <div className="flex items-center gap-3 text-slate-400 text-[16px] mb-8 border-b border-slate-100 pb-5">
                  <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                  <span>|</span>
                  <span className="font-semibold text-slate-600">출처: {selectedNews.source}</span>
                </div>
                <div className="text-slate-700 text-[20px] sm:text-[21px] leading-[2.0] break-keep space-y-5">
                  {formatArticleContent(selectedNews.content).map((paragraph, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 flex items-center gap-1.5 text-2xl" aria-hidden>
                        <span className="text-amber-600 font-bold">{(i % 10) + 1}.</span>
                        <span>{emojis[i % emojis.length]}</span>
                      </span>
                      <p className="whitespace-pre-wrap flex-1 min-w-0">{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-7 bg-white border-t border-slate-200 flex gap-4">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-bold text-[18px] hover:bg-slate-200 transition-colors"
                >닫기</button>
                {selectedNews.url?.trim() && selectedNews.url?.trim() !== "#" && selectedNews.source?.trim() !== "골든데이즈 AI" && (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[18px] text-center shadow hover:bg-emerald-700 transition-colors"
                  >기사 원문 보기</a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
