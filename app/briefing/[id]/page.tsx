"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Newspaper } from "lucide-react";

interface MorningBriefingItem {
  id: string | number;
  title?: string;
  date: string;
  news_brief: string;
  created_at?: string;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatForEditorLabel(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatForFooter(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

export default function BriefingDetailPage() {
  const [item, setItem] = useState<MorningBriefingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const routeParams = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paramId = String(routeParams?.id ?? "");
  const idxParam = searchParams.get("idx");
  const idx =
    idxParam !== null && Number.isFinite(Number(idxParam))
      ? Number(idxParam)
      : null;

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await fetch("/api/morning-briefing");
        const data: MorningBriefingItem[] = await res.json();

        const found =
          (idx !== null ? data[idx] || null : null) ||
          data.find((d) => String(d.id) === paramId) ||
          data.find((d) => String(d.date || d.created_at) === paramId) ||
          null;
        setItem(found ?? null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [idx, paramId]);

  const mastheadDateText = useMemo(() => {
    if (!item) return "";
    const src = item.date || item.created_at || "";
    const d = new Date(src);
    if (Number.isNaN(d.getTime())) return src;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}. ${m}. ${day}`;
  }, [item]);

  const editorLabelDate = useMemo(() => {
    if (!item) return "";
    return formatForEditorLabel(item.date || item.created_at || "");
  }, [item]);

  const footerDateText = useMemo(() => {
    if (!item) return "";
    return formatForFooter(item.date || item.created_at || "");
  }, [item]);

  const editorText = useMemo(() => {
    const raw = item?.news_brief ?? "";
    return escapeHtml(raw);
  }, [item]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#E5EDF7] flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-slate-600 text-base font-semibold">
          뉴스 브리핑을 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#E5EDF7] flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white/80 border border-slate-200 p-6 text-slate-600 text-base font-semibold">
          해당 석간 브리핑을 찾을 수 없습니다.
          <div className="mt-4">
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 text-amber-700 font-bold hover:underline"
            >
              ← 목록으로
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const rawNewsBrief = item.news_brief || "";
  const isFullHtmlTemplate =
    /<!doctype\s+html/i.test(rawNewsBrief) ||
    /<html[\s>]/i.test(rawNewsBrief) ||
    /<head[\s>]/i.test(rawNewsBrief) ||
    /<body[\s>]/i.test(rawNewsBrief);

  if (isFullHtmlTemplate) {
    return (
      <>
        {/* 상단 네비 버튼 — safe area 적용 */}
        <div className="fixed top-0 left-0 right-0 z-[9999] safe-top">
          <div className="flex justify-end items-center gap-2 px-3 py-2 pointer-events-none">
            <Link
              href="/briefing"
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white/95 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
            >
              ← 목록으로
            </Link>
            <Link
              href="/"
              className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white/95 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
            >
              메인으로
            </Link>
          </div>
        </div>
        <div
          className="min-h-screen"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: rawNewsBrief }}
        />
      </>
    );
  }

  // 일반 텍스트 데이터
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#0e0d0b] pb-16 safe-bottom">
      <header className="bg-[#0e0d0b] text-[#f5f2eb] border-t-4 border-[#b5341a] safe-top">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-[#b8b4ae] mb-2">
              Daily News Briefing
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-keep">
              {item.title?.trim() || "석간 브리핑"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* 내부 페이지 링크 — 같은 창 */}
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border border-[#c8c3b8]/40 text-xs sm:text-sm font-semibold text-[#f5f2eb] hover:bg-white/10"
            >
              ← 목록으로
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md border border-[#c8c3b8]/40 text-xs sm:text-sm font-semibold text-[#f5f2eb] hover:bg-white/10"
            >
              메인으로
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <section className="bg-[#ede9df] border border-[#c8c3b8] p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-4 sm:mb-5 text-[#7a7670]">
            <Newspaper className="w-4 h-4" />
            <p className="text-sm sm:text-base tracking-wide">
              {formatForFooter(item.date || item.created_at || "")}
            </p>
          </div>

          <article className="bg-[#f5f2eb] border-l-[3px] border-[#0e0d0b] p-4 sm:p-5 text-[15px] sm:text-[17px] leading-[1.9] whitespace-pre-wrap break-keep text-[#3a3832]">
            {item.news_brief || "본문이 없습니다."}
          </article>
        </section>
      </div>
    </main>
  );
}
