"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  category: string;
  created_at: string;
}

const categoryConfig = [
  { name: "전체", icon: "📋", bg: "bg-slate-100", bgActive: "bg-slate-700", border: "border-slate-300", text: "text-slate-700", textActive: "text-white" },
  { name: "복지", icon: "💙", bg: "bg-sky-50", bgActive: "bg-sky-600", border: "border-sky-200", text: "text-sky-800", textActive: "text-white" },
  { name: "건강", icon: "💎", bg: "bg-emerald-50", bgActive: "bg-emerald-600", border: "border-emerald-200", text: "text-emerald-800", textActive: "text-white" },
  { name: "재테크", icon: "📈", bg: "bg-amber-50", bgActive: "bg-amber-600", border: "border-amber-200", text: "text-amber-800", textActive: "text-white" },
  { name: "일자리", icon: "👤", bg: "bg-violet-50", bgActive: "bg-violet-600", border: "border-violet-200", text: "text-violet-800", textActive: "text-white" },
  { name: "생활정보", icon: "🏠", bg: "bg-teal-50", bgActive: "bg-teal-600", border: "border-teal-200", text: "text-teal-800", textActive: "text-white" },
  { name: "문화", icon: "🎭", bg: "bg-fuchsia-50", bgActive: "bg-fuchsia-600", border: "border-fuchsia-200", text: "text-fuchsia-800", textActive: "text-white" },
  { name: "건강 유튜브", icon: "▶️", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", url: "https://www.youtube.com/watch?v=sUE9ad87RpI&list=PLjlxfKqF4CuBPQ-10Z8160p3VsIZgvxX-", isLink: true },
];

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const SUBSCRIBE_WEBHOOK_URL = "https://n8n.mygolden.kr/webhook/subscribe";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = subscribeEmail.trim();
    if (!email) return;
    setSubscribeStatus("loading");
    try {
      const response = await fetch(SUBSCRIBE_WEBHOOK_URL, {
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
        console.error("[구독 전송 실패] URL:", SUBSCRIBE_WEBHOOK_URL, "status:", response.status, "body:", text);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      setSubscribeStatus("error");
      if (err instanceof Error && !err.message.startsWith("HTTP ")) {
        console.error("[구독 전송 실패] URL:", SUBSCRIBE_WEBHOOK_URL, "error:", err);
      }
      alert("죄송합니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubscribeStatus("idle");
    }
  };

  // [핵심 로직 보존] 데이터 페칭
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

  // [핵심 로직 보존] 필터링
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setFilteredNews(category === "전체" ? news : news.filter(item => item.category === category));
  };

  // [핵심 로직 보존] 제목 정리 - HTML 태그 제거 후 앞부분만 반환
  const getCleanTitle = (fullTitle: string) => {
    if (!fullTitle) return "";
    const noHtml = fullTitle.replace(/<[^>]+>/g, "").trim();
    return noHtml.split(/\s*[-–—]\s*/)[0].trim();
  };

  // HTML 태그 제거 (미리보기용 - 평문 반환)
  const stripHtml = (raw: string): string => {
    if (!raw) return "";
    return raw
      .replace(/\*\*(.+?)\*\*/g, "$1") // Markdown **볼드** 제거
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  // HTML 태그 제거 및 구조화된 본문으로 변환
  const formatArticleContent = (raw: string): string[] => {
    if (!raw) return [];
    const text = raw
      .replace(/\*\*(.+?)\*\*/g, "$1") // Markdown 볼드(**텍스트**) 제거, 내용만 유지
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<\/div>\s*<div[^>]*>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
    return paragraphs.length > 0 ? paragraphs : (text ? [text] : []);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFFBEB] to-[#FEF3C7]/30 flex flex-col items-center justify-center p-8 border border-amber-200/60 rounded-2xl mx-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="goldGradientLoading" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="glowGradientLoading" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r="28" fill="url(#glowGradientLoading)" stroke="url(#goldGradientLoading)" strokeWidth="3" />
            <circle cx="40" cy="40" r="18" fill="url(#goldGradientLoading)" />
            {[0, 90, 180, 270].map((deg, i) => (
              <g key={i} transform={`rotate(${deg} 40 40)`}>
                <rect x="38" y="12" width="4" height="12" rx="2" fill="url(#goldGradientLoading)" opacity="0.9" />
              </g>
            ))}
          </svg>
        </div>
        <div className="text-left">
          <h1 className="text-[28px] sm:text-[34px] font-black bg-gradient-to-r from-[#92400E] via-[#B45309] to-[#92400E] bg-clip-text text-transparent" style={{ fontStyle: "italic", letterSpacing: "-0.02em" }}>
            골든데이즈
          </h1>
          <p className="text-amber-800/80 text-sm sm:text-base font-medium mt-0.5">시니어들을 위한 따뜻한 최신 정보</p>
        </div>
      </div>
      <p className="text-[#0F172A] font-bold text-[18px] sm:text-[20px]">
        소식을 정성껏 모으고 있습니다... 😊
      </p>
    </div>
  );

  return (
    <main className="pb-20 font-sans">
      
      {/* 1. 상단 헤더: 로고 + 타이틀 + 구독창 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-8 mb-8 md:mb-10 bg-gradient-to-br from-white via-[#FFFBEB] to-[#FEF3C7]/30 rounded-2xl md:rounded-3xl border border-amber-200/60 shadow-[0_8px_40px_-12px_rgba(201,152,42,0.15)]">
        <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto justify-center md:justify-start">
          {/* 골든데이즈 로고 - 따뜻한 골드 톤의 해/빛 */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-20 md:h-20">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="100%" stopColor="#FDE68A" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="28" fill="url(#glowGradient)" stroke="url(#goldGradient)" strokeWidth="3" />
              <circle cx="40" cy="40" r="18" fill="url(#goldGradient)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <g key={i} transform={`rotate(${deg} 40 40)`}>
                  <rect x="38" y="12" width="4" height="12" rx="2" fill="url(#goldGradient)" opacity="0.9" />
                </g>
              ))}
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg, i) => (
                <g key={i} transform={`rotate(${deg} 40 40)`}>
                  <rect x="38.5" y="14" width="3" height="8" rx="1.5" fill="#D97706" opacity="0.7" />
                </g>
              ))}
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] sm:text-[38px] md:text-[44px] font-black leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-[#92400E] via-[#B45309] to-[#92400E] bg-clip-text text-transparent whitespace-nowrap" style={{ fontStyle: "italic", letterSpacing: "-0.02em" }}>
                골든데이즈
              </span>
            </h1>
            <p className="text-amber-800/80 text-sm sm:text-base md:text-lg font-medium tracking-wide mt-1 break-keep">
              시니어들을 위한 따뜻한 최신 정보
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto md:flex-shrink-0 flex flex-col items-end gap-3">
          <form onSubmit={handleSubscribe} className="flex items-center bg-white/90 backdrop-blur-sm border border-amber-200 rounded-xl md:rounded-2xl px-3 py-2 shadow-lg shadow-amber-900/5 w-full min-w-0 md:min-w-[340px]">
            <input 
              type="email" 
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="이메일로 최신정보 받기" 
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 bg-transparent outline-none text-[#1E293B] placeholder:text-amber-700/50 font-medium text-[15px] sm:text-[17px] focus:ring-0"
              required
              disabled={subscribeStatus === "loading"}
            />
            <button 
              type="submit"
              disabled={subscribeStatus === "loading"}
              className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-5 py-2.5 rounded-lg md:rounded-xl font-bold text-[15px] sm:text-base hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg shadow-amber-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {subscribeStatus === "loading" ? "전송 중..." : "구독하기"}
            </button>
          </form>
          <Link
            href="/board"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-base sm:text-lg font-bold rounded-xl transition-colors shadow-md"
          >
            <span>💬</span>
            소통방(게시판)
          </Link>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* 2. 카테고리 필터 영역 - 모바일: 가로 스크롤, 데스크톱: 2행 4열 그리드 */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-200/60 p-4 rounded-2xl mb-8 md:mb-10 shadow-[0_4px_20px_-4px_rgba(201,152,42,0.12)] -mx-4 sm:mx-0 overflow-visible">
          <div className="flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-2 pl-2 pr-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-4 md:flex-none md:overflow-visible md:pb-0 md:pr-0">
            {categoryConfig.map((cat) => {
              const isActive = !cat.isLink && selectedCategory === cat.name;
              const btnClass = isActive
                ? `${cat.bgActive} ${cat.textActive} border-transparent`
                : `${cat.bg} ${cat.border} ${cat.text}`;
              if (cat.isLink && cat.url) {
                return (
                  <a
                    key={cat.name}
                    href={cat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 min-w-[100px] md:min-w-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[15px] transition-all border shadow-sm no-underline bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-600 hover:text-white hover:border-rose-500 whitespace-nowrap"
                  >
                    <span className="text-[17px]">{cat.icon}</span>
                    {cat.name}
                  </a>
                );
              }
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex-shrink-0 min-w-[100px] md:min-w-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[15px] transition-all border shadow-sm whitespace-nowrap ${btnClass} hover:opacity-90`}
                >
                  <span className="text-[17px]">{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 뉴스 카드 목록 (제목 전체 노출 수정) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item, index) => (
            <div 
              key={item.id || index} 
              className="group bg-white rounded-[32px] border-2 border-[#CBD5E1] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_8px_32px_rgba(30,58,138,0.15)] hover:border-[#94A3B8] transition-all duration-300 flex flex-col cursor-pointer h-full"
              onClick={() => setSelectedNews(item)}
            >
              <div className="p-8 flex-1 flex flex-col">
                <span className="text-[#1E3A8A] text-[15px] font-black bg-[#E0E7FF] px-4 py-2 rounded-lg w-fit mb-5 border border-[#C7D2FE]">
                  {item.category}
                </span>
                
                {/* [핵심 수정] line-clamp와 고정 높이를 제거하여 제목을 모두 보여줍니다. */}
                <h3 className="text-[23px] font-bold text-[#0F172A] mb-5 leading-snug break-keep group-hover:text-[#1E3A8A] transition-colors">
                  {getCleanTitle(item.title)}
                </h3>
                
                <p className="text-[#475569] text-[18px] leading-[1.75] mb-8 line-clamp-3 flex-1 break-keep font-medium">
                  {stripHtml(item.content)}
                </p>

                <div className="flex justify-between items-center pt-6 border-t-2 border-[#E2E8F0]">
                  <span className="text-[#64748B] text-[16px] font-semibold">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="text-[#1E3A8A] font-bold text-[18px] flex items-center gap-1">
                    자세히 보기 <span className="text-xl">›</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 상세 보기 모달 - 모바일: 하단시트, PC: 중앙 모달 (원래 스타일) */}
      {selectedNews && (
        <>
          {/* 모바일: 하단 시트 스타일 */}
          <div className="sm:hidden fixed inset-0 bg-black/70 z-[2000] flex flex-col justify-end">
            <div className="bg-white w-full max-h-[95vh] rounded-t-3xl border-2 border-b-0 border-[#E2E8F0] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
              <div className="p-4 border-b-2 border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] flex-shrink-0">
                <span className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-full font-black text-[14px]">{selectedNews.category}</span>
                <button onClick={() => setSelectedNews(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-[#CBD5E1] text-[#475569] text-xl">✕</button>
              </div>
              <div className="p-5 flex-1 min-h-0 overflow-y-auto">
                <h2 className="text-[22px] font-bold text-[#0F172A] mb-4 leading-tight break-keep">{getCleanTitle(selectedNews.title)}</h2>
                <div className="flex items-center gap-3 text-[#64748B] text-[14px] mb-6 border-b-2 border-[#E2E8F0] pb-4 font-semibold">
                  <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="font-bold text-[#1E3A8A]">출처: {selectedNews.source}</span>
                </div>
                <div className="text-[#334155] text-[17px] leading-[1.85] break-keep font-medium space-y-4">
                  {formatArticleContent(selectedNews.content).map((paragraph, i) => {
                    const emojis = ["📌", "💡", "✨", "🔹", "⭐", "●", "◆", "◎", "✓", "📎"];
                    const emoji = emojis[i % emojis.length];
                    return (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="flex-shrink-0 flex items-center gap-1 text-base" aria-hidden>
                          <span className="text-amber-600 font-bold">{(i % 10) + 1}.</span>
                          <span>{emoji}</span>
                        </span>
                        <p className="whitespace-pre-wrap flex-1 min-w-0">{paragraph}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 bg-white border-t-2 border-[#E2E8F0] flex gap-3 flex-shrink-0">
                <button onClick={() => setSelectedNews(null)} className="flex-1 py-3 bg-[#F1F5F9] text-[#334155] border-2 border-[#CBD5E1] rounded-xl font-bold text-[15px]">닫기</button>
                {selectedNews.url?.trim() && selectedNews.url?.trim() !== "#" && selectedNews.source?.trim() !== "골든데이즈 AI" && (
                  <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold text-[15px] text-center">기사 원문 보기</a>
                )}
              </div>
            </div>
          </div>
          {/* PC: 중앙 모달 (원래 레이아웃) */}
          <div className="hidden sm:flex fixed inset-0 bg-black/70 items-center justify-center z-[2000] p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] border-2 border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b-2 border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                <span className="bg-[#1E3A8A] text-white px-5 py-2 rounded-full font-black text-[16px]">{selectedNews.category}</span>
                <button onClick={() => setSelectedNews(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-[#CBD5E1] text-[#475569] text-2xl hover:text-[#0F172A] hover:border-[#94A3B8] shadow-sm">✕</button>
              </div>
              <div className="p-10 max-h-[65vh] overflow-y-auto">
                <h2 className="text-[30px] font-bold text-[#0F172A] mb-6 leading-tight break-keep">{getCleanTitle(selectedNews.title)}</h2>
                <div className="flex items-center gap-3 text-[#64748B] text-[17px] mb-10 border-b-2 border-[#E2E8F0] pb-5 font-semibold">
                  <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                  <span className="text-[#CBD5E1]">|</span>
                  <span className="font-bold text-[#1E3A8A]">출처: {selectedNews.source}</span>
                </div>
                <div className="text-[#334155] text-[21px] leading-[1.9] break-keep font-medium space-y-5">
                  {formatArticleContent(selectedNews.content).map((paragraph, i) => {
                    const emojis = ["📌", "💡", "✨", "🔹", "⭐", "●", "◆", "◎", "✓", "📎"];
                    const emoji = emojis[i % emojis.length];
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 flex items-center gap-1.5 text-xl" aria-hidden>
                          <span className="text-amber-600 font-bold">{(i % 10) + 1}.</span>
                          <span>{emoji}</span>
                        </span>
                        <p className="whitespace-pre-wrap flex-1 min-w-0">{paragraph}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-8 bg-white border-t-2 border-[#E2E8F0] flex gap-4">
                <button onClick={() => setSelectedNews(null)} className="flex-1 py-5 bg-[#F1F5F9] text-[#334155] border-2 border-[#CBD5E1] rounded-2xl font-bold text-[19px] hover:bg-[#E2E8F0]">닫기</button>
                {selectedNews.url?.trim() && selectedNews.url?.trim() !== "#" && selectedNews.source?.trim() !== "골든데이즈 AI" && (
                  <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-5 bg-[#1E3A8A] text-white rounded-2xl font-bold text-[19px] text-center shadow-lg hover:bg-[#1E40AF]">기사 원문 보기</a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}