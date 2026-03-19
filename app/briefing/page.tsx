"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Calendar, ChevronDown } from "lucide-react";

interface MorningBriefingItem {
  id: string | number;
  title?: string;
  date: string;
  news_brief: string;
  created_at?: string;
}

export default function BriefingPage() {
  const [items, setItems] = useState<MorningBriefingItem[]>([]);
  const [loading, setLoading] = useState(true);

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
            <span>뉴스 브리핑</span>
          </h1>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← 메인으로
          </Link>
        </div>
        <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
          시니어 독자님을위한 조간-석간 브리핑을 한 곳에서 모아봅니다.
        </p>

        {loading && (
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-center text-slate-500 text-base sm:text-lg">
            뉴스 브리핑을 불러오는 중입니다.
          </div>
        )}

        {!loading && !items.length && (
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-center text-slate-500 text-base sm:text-lg">
            아직 등록된 석간 브리핑이 없습니다.
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item, index) => {
              const linkId =
                item.id ?? item.date ?? item.created_at ?? "";

              return (
                <Link
                  key={item.id ?? item.date ?? item.created_at}
                  href={`/briefing/${encodeURIComponent(String(linkId))}?idx=${index}`}
                  className="w-full min-h-[56px] text-left rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.99] transition px-4 sm:px-5 py-3 sm:py-4 inline-flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-0">
                      <Calendar className="w-4 h-4 text-[#D35400]" />
                      <span className="leading-snug break-words">
                        {item.title?.trim()
                          ? item.title
                          : `${formatDate(item.date || item.created_at || "")} 석간 브리핑 입니다`}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-200" />
                </Link>
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

