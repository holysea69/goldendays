"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Calendar, ChevronDown } from "lucide-react";

interface MorningBriefingItem {
  id: string | number;
  date: string;
  news_brief: string;
  created_at?: string;
}

export default function BriefingPage() {
  const [items, setItems] = useState<MorningBriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchBriefings = async () => {
      try {
        const res = await fetch("/api/morning-briefing");
        const data: MorningBriefingItem[] = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error("morning_briefing archive load failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefings();
  }, []);

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const datePart = d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const weekday = d.toLocaleDateString("ko-KR", { weekday: "short" });
    return `${datePart} (${weekday})`;
  };

  return (
    <main className="min-h-screen bg-[#E5EDF7] pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-slate-900">
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D35400] text-white shadow-md">
              <Newspaper className="w-6 h-6" />
            </span>
            <span>조간 브리핑</span>
          </h1>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← 메인으로
          </Link>
        </div>
        <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
          시니어 독자님을 위한 매일 아침 조간 브리핑을 한 곳에서 모아봅니다.
        </p>

        {loading && (
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-center text-slate-500 text-base sm:text-lg">
            조간 브리핑을 불러오는 중입니다...
          </div>
        )}

        {!loading && !items.length && (
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-center text-slate-500 text-base sm:text-lg">
            아직 등록된 조간 브리핑이 없습니다.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => {
              const isOpen = openId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full text-left rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow px-4 sm:px-5 py-3 sm:py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                      <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-0">
                        <Calendar className="w-4 h-4 text-[#D35400]" />
                        <span>
                          {formatDate(item.date || item.created_at || "")} 조간 브리핑 입니다
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <div className="space-y-3">
                        {(() => {
                          const raw = item.news_brief || "";

                          // 1) '1.', '2.' 처럼 시작하는 번호 기준으로 큰 단락 분리 (줄바꿈 여부와 상관없이)
                          let chunks = raw
                            .split(/(?=\d+\.\s*)/)
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);

                          // 2) 번호 단위가 없다면 '맥락;' 키워드 기준으로 분리
                          if (chunks.length === 1) {
                            chunks = raw
                              .split("맥락;")
                              .map((chunk, idx) =>
                                idx === 0 ? chunk.trim() : `맥락; ${chunk.trim()}`
                              )
                              .filter((s) => s.length > 0);
                          }

                          // 3) 그래도 하나라면, 마침표 기준으로 큰 문장 단위로 나눔
                          if (chunks.length === 1) {
                            chunks = raw
                              .split(/(?<=[.!?])\s+/)
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0);
                          }

                          return chunks.map((line, index) => {
                            const match = line.match(/^(\d+)\.\s*(.*)$/);
                            const num = match ? match[1] : null;
                            const body = match ? match[2] : line;

                            // 첫 번호 단락은 강조(굵은 숫자 배지), 이후는 동일 스타일로 번호 배지만 변경
                            return (
                              <div
                                key={`${item.id}-${index}`}
                                className="flex items-start gap-3"
                              >
                                {num ? (
                                  <div className="mt-1 w-7 h-7 rounded-full bg-emerald-500 text-white text-xs sm:text-sm flex items-center justify-center font-bold flex-shrink-0">
                                    {num}
                                  </div>
                                ) : (
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                )}
                                <p className="text-base sm:text-lg text-slate-800 leading-relaxed whitespace-pre-line break-keep">
                                  {body}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 sm:mt-10 flex justify-center sm:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← 메인으로
          </Link>
        </div>
      </div>
    </main>
  );
}

