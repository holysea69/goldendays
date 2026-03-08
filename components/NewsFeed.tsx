"use client";

import React, { useState, useEffect } from "react";

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
  { name: "전체", icon: "📋" },
  { name: "복지", icon: "💙" },
  { name: "건강", icon: "💎" },
  { name: "재테크", icon: "📈" },
  { name: "일자리", icon: "👤" },
];

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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

  // [핵심 로직 보존] 제목 정리
  const getCleanTitle = (fullTitle: string) => {
    if (!fullTitle) return "";
    return fullTitle.split(/\s*[-–—]\s*/)[0].trim();
  };

  if (loading) return (
    <div className="text-center p-20 text-[#0F172A] font-bold text-[20px] bg-[#F1F5F9] min-h-screen border-2 border-[#E2E8F0] rounded-2xl mx-4">
      소식을 정성껏 모으고 있습니다... 😊
    </div>
  );

  return (
    <main className="pb-20 font-sans">
      
      {/* 1. 상단 헤더: 로고 + 타이틀 + 구독창 */}
      <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 mb-10 bg-gradient-to-br from-white via-[#FFFBEB] to-[#FEF3C7]/30 rounded-3xl border border-amber-200/60 shadow-[0_8px_40px_-12px_rgba(201,152,42,0.15)]">
        <div className="flex items-center gap-5">
          {/* 골든데이즈 로고 - 따뜻한 골드 톤의 해/빛 */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
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
          <div>
            <h1 className="text-[38px] sm:text-[44px] font-black leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-[#92400E] via-[#B45309] to-[#92400E] bg-clip-text text-transparent" style={{ fontStyle: "italic", letterSpacing: "-0.02em" }}>
                골든데이즈
              </span>
            </h1>
            <p className="text-amber-800/80 text-base sm:text-lg font-medium tracking-wide mt-1">
              시니어들을 위한 따뜻한 최신 정보
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <div className="flex items-center bg-white/90 backdrop-blur-sm border border-amber-200 rounded-2xl px-4 py-2 shadow-lg shadow-amber-900/5 min-w-[300px] sm:min-w-[340px]">
            <input 
              type="email" 
              placeholder="이메일 입력 후 최신정보" 
              className="flex-1 px-4 py-3 bg-transparent outline-none text-[#1E293B] placeholder:text-amber-700/50 font-medium text-[17px] focus:ring-0"
            />
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg shadow-amber-900/20">
              구독하기
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6">
        
        {/* 2. 카테고리 필터 영역 */}
        <div className="bg-white border-2 border-[#94A3B8] p-6 rounded-[28px] mb-10 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap justify-center gap-4">
            {categoryConfig.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-[18px] transition-all border-2 shadow-sm ${
                  selectedCategory === cat.name
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" 
                    : "bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:border-[#94A3B8]"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
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
                  {item.content}
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

      {/* 4. 상세 보기 모달 [핵심 기능 유지] */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-[0_24px_64px_rgba(0,0,0,0.25)] border-2 border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b-2 border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <span className="bg-[#1E3A8A] text-white px-5 py-2 rounded-full font-black text-[16px]">{selectedNews.category}</span>
              <button onClick={() => setSelectedNews(null)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-[#CBD5E1] text-[#475569] text-2xl hover:text-[#0F172A] hover:border-[#94A3B8] shadow-sm transition-colors">✕</button>
            </div>
            <div className="p-10 max-h-[65vh] overflow-y-auto">
              <h2 className="text-[30px] font-bold text-[#0F172A] mb-6 leading-tight break-keep">{getCleanTitle(selectedNews.title)}</h2>
              <div className="flex items-center gap-3 text-[#64748B] text-[17px] mb-10 border-b-2 border-[#E2E8F0] pb-5 font-semibold">
                <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                <span className="text-[#CBD5E1]">|</span>
                <span className="font-bold text-[#1E3A8A]">출처: {selectedNews.source}</span>
              </div>
              <div className="text-[#334155] text-[21px] leading-[1.9] whitespace-pre-wrap break-keep font-medium">{selectedNews.content}</div>
            </div>
            <div className="p-8 bg-white border-t-2 border-[#E2E8F0] flex gap-4">
              <button onClick={() => setSelectedNews(null)} className="flex-1 py-5 bg-[#F1F5F9] text-[#334155] border-2 border-[#CBD5E1] rounded-2xl font-bold text-[19px] hover:bg-[#E2E8F0] transition-colors">닫기</button>
              <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-5 bg-[#1E3A8A] text-white rounded-2xl font-bold text-[19px] text-center shadow-lg hover:bg-[#1E40AF] transition-colors">기사 원문 보기</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}