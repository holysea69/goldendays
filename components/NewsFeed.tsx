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
    <div className="text-center p-20 text-[#1E3A8A] font-bold bg-[#F4F7FA] min-h-screen">
      소식을 정성껏 모으고 있습니다... 😊
    </div>
  );

  return (
    <main className="pb-20 font-sans">
      
      {/* 1. 상단 헤더: 타이틀(왼쪽) + 구독창(오른쪽) */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-blue-100 mb-10">
        <div className="text-left">
          <h1 className="text-[42px] font-black text-[#1E3A8A] leading-none mb-3">
            골든데이즈
          </h1>
          <p className="text-gray-500 text-lg font-medium tracking-tight">
            시니어들을 위한 최신 정보
          </p>
        </div>

        <div className="w-full md:w-auto pb-1">
          <div className="flex items-center bg-white border border-blue-200 rounded-2xl p-1.5 shadow-sm min-w-[320px]">
            <input 
              type="email" 
              placeholder="이메일을 입력해 주세요" 
              className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-600 placeholder:text-gray-200"
            />
            <button className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1e293b] transition-all">
              구독하기
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6">
        
        {/* 2. 카테고리 필터 영역 */}
        <div className="bg-[#EBF2FF] border border-[#C7D2FE] p-5 rounded-[28px] mb-10 shadow-sm">
          <div className="flex flex-wrap justify-center gap-3">
            {categoryConfig.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-[17px] transition-all border shadow-sm ${
                  selectedCategory === cat.name
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" 
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
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
              className="group bg-white rounded-[32px] border border-blue-50 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer h-full"
              onClick={() => setSelectedNews(item)}
            >
              <div className="p-8 flex-1 flex flex-col">
                <span className="text-[#2563EB] text-[13px] font-black bg-[#EFF6FF] px-3 py-1.5 rounded-lg w-fit mb-5">
                  {item.category}
                </span>
                
                {/* [핵심 수정] line-clamp와 고정 높이를 제거하여 제목을 모두 보여줍니다. */}
                <h3 className="text-[22px] font-bold text-[#1B1E31] mb-5 leading-snug break-keep group-hover:text-[#2563EB] transition-colors">
                  {getCleanTitle(item.title)}
                </h3>
                
                <p className="text-gray-500 text-[17.5px] leading-relaxed mb-8 line-clamp-3 flex-1 break-keep">
                  {item.content}
                </p>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <span className="text-gray-400 text-[15px] font-medium">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="text-[#2563EB] font-bold text-[17px] flex items-center gap-1">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-7 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <span className="bg-[#EFF6FF] text-[#2563EB] px-4 py-1.5 rounded-full font-black text-sm">{selectedNews.category}</span>
              <button onClick={() => setSelectedNews(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 text-2xl hover:text-gray-600 shadow-sm transition-colors">✕</button>
            </div>
            <div className="p-10 max-h-[65vh] overflow-y-auto">
              <h2 className="text-[28px] font-bold text-[#1B1E31] mb-5 leading-tight break-keep">{getCleanTitle(selectedNews.title)}</h2>
              <div className="flex items-center gap-3 text-gray-400 text-[15px] mb-10 border-b border-gray-50 pb-5">
                <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                <span className="text-gray-200">|</span>
                <span className="font-bold text-[#2563EB]">출처: {selectedNews.source}</span>
              </div>
              <div className="text-gray-700 text-[20px] leading-[1.85] whitespace-pre-wrap break-keep">{selectedNews.content}</div>
            </div>
            <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
              <button onClick={() => setSelectedNews(null)} className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-2xl font-bold text-[18px]">닫기</button>
              <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-5 bg-[#2563EB] text-white rounded-2xl font-bold text-[18px] text-center shadow-xl shadow-blue-100 transition-all">기사 원문 보기</a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}