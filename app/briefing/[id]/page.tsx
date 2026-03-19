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
        setItem(found);
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
          석간 브리핑을 불러오는 중입니다...
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

  // `morning_briefing.content(news_brief)`에 HTML 전체가 들어오는 경우에는
  // 템플릿을 코드에서 만들지 않고, 저장된 HTML을 그대로 렌더링합니다.
  // (그 외의 경우: 기존 방식대로 editor-text 위치에 본문만 주입)
  const rawNewsBrief = item.news_brief || "";
  const isFullHtmlTemplate =
    /<!doctype\s+html/i.test(rawNewsBrief) ||
    /<html[\s>]/i.test(rawNewsBrief) ||
    /<head[\s>]/i.test(rawNewsBrief) ||
    /<body[\s>]/i.test(rawNewsBrief);

  if (isFullHtmlTemplate) {
    return (
      <>
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-[9999] flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <Link
            href="/briefing"
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-md border border-slate-300 bg-white/95 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
          >
            ← 목록으로
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-md border border-slate-300 bg-white/95 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
          >
            메인으로
          </Link>
        </div>
        <div
          className="min-h-screen"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: rawNewsBrief }}
        />
      </>
    );
  }

  // HTML 전체가 아닌 일반 텍스트 데이터는 항목별 원문을 그대로 보여줍니다.
  // (고정 샘플 템플릿으로 인해 모든 상세가 동일하게 보이는 문제 방지)
  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#0e0d0b] pb-16">
      <header className="bg-[#0e0d0b] text-[#f5f2eb] border-t-4 border-[#b5341a]">
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

  // 기존 방식(본문 텍스트 주입): 사용자가 업로드한 HTML 템플릿을 "그대로" 유지하되,
  // 동적으로 바꾸는 곳은 mastheadDate, editor-text, footer 날짜만 반영합니다.
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>석간 브리핑 — ${escapeHtml(footerDateText)}</title>
  <style>
${String.raw`
  :root {
    --ink: #0e0d0b;
    --ink-soft: #3a3832;
    --ink-muted: #7a7670;
    --ink-faint: #b8b4ae;
    --paper: #f5f2eb;
    --paper-warm: #ede9df;
    --paper-dark: #e2ddd3;
    --accent: #b5341a;
    --accent-soft: #f0ece3;
    --rule: #c8c3b8;
    --serif: 'Noto Serif KR', Georgia, serif;
    --sans: 'Noto Sans KR', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.75;
    min-height: 100vh;
  }

  /* MASTHEAD */
  .masthead {
    background: var(--ink);
    color: var(--paper);
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .masthead::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: var(--accent);
  }
  .masthead-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 2rem 2.5rem;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 2rem;
  }
  .masthead-flag {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    opacity: 0;
    animation: fadeUp 0.6s 0.1s forwards;
  }
  .masthead-title {
    font-family: var(--serif);
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--paper);
    opacity: 0;
    animation: fadeUp 0.6s 0.2s forwards;
  }
  .masthead-title em {
    font-style: normal;
    color: var(--accent);
  }
  .masthead-meta {
    text-align: right;
    opacity: 0;
    animation: fadeUp 0.6s 0.3s forwards;
  }
  .masthead-date {
    font-family: var(--serif);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--paper);
    display: block;
  }
  .masthead-time {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.1em;
    display: block;
    margin-top: 4px;
  }
  .masthead-rule {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.12);
    margin-bottom: 0;
  }
  .masthead-byline {
    max-width: 900px;
    margin: 0 auto;
    padding: 0.85rem 2rem;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(245,242,235,0.7);
    display: flex;
    gap: 2rem;
    opacity: 0;
    animation: fadeUp 0.5s 0.5s forwards;
  }

  /* NAV PILLS */
  .nav-strip {
    background: var(--paper-warm);
    border-bottom: 1px solid var(--rule);
    position: sticky;
    top: 0;
    z-index: 100;
    opacity: 0;
    animation: fadeIn 0.4s 0.7s forwards;
  }
  .nav-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 0.6rem 2rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .nav-pill {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-soft);
    text-decoration: none;
    padding: 5px 12px;
    border-radius: 2px;
    border: 1px solid var(--rule);
    background: transparent;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .nav-pill:hover {
    background: var(--ink);
    color: var(--paper);
    border-color: var(--ink);
  }

  /* MAIN LAYOUT */
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 2rem 4rem;
  }

  /* SECTION */
  .section {
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(16px);
    animation: fadeUp 0.5s forwards;
  }
  .section:nth-child(1) { animation-delay: 0.8s; }
  .section:nth-child(2) { animation-delay: 0.95s; }
  .section:nth-child(3) { animation-delay: 1.1s; }
  .section:nth-child(4) { animation-delay: 1.25s; }
  .section:nth-child(5) { animation-delay: 1.4s; }
  .section:nth-child(6) { animation-delay: 1.55s; }
  .section:nth-child(7) { animation-delay: 1.7s; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.6rem;
    border-bottom: 2px solid var(--ink);
  }
  .section-tag {
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 2px;
  }
  .tag-politics  { background: #1a1a2e; color: #a8b4ff; }
  .tag-economy   { background: #0d2137; color: #7fc4e8; }
  .tag-industry  { background: #0a2218; color: #6fcfa0; }
  .tag-society   { background: #2a1a08; color: #e8b96a; }
  .tag-intl      { background: #2a0d0d; color: #e88080; }
  .tag-compare   { background: #251020; color: #d98ed4; }
  .tag-editor    { background: var(--accent); color: var(--paper); }

  .section-title-text {
    font-family: var(--serif);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ink);
  }

  /* ARTICLE CARD */
  .article-card {
    background: var(--paper);
    border: 1px solid var(--rule);
    border-left: 3px solid var(--ink);
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.85rem;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .article-card:hover {
    background: var(--paper-warm);
    border-left-color: var(--accent);
  }
  .article-card:last-child { margin-bottom: 0; }

  .article-headline {
    font-family: var(--serif);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.5;
    margin-bottom: 0.55rem;
  }
  .article-body {
    font-size: 13.5px;
    color: var(--ink-soft);
    line-height: 1.8;
    margin-bottom: 0.65rem;
  }
  .article-source {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .source-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }

  /* COMPARE GRID */
  .compare-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--rule);
    border: 1px solid var(--rule);
    margin-bottom: 1rem;
  }
  .compare-cell {
    background: var(--paper);
    padding: 1.1rem 1.25rem;
    transition: background 0.2s;
  }
  .compare-cell:hover { background: var(--paper-warm); }
  .compare-outlet {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 0.5rem;
  }
  .compare-body {
    font-size: 13px;
    color: var(--ink-soft);
    line-height: 1.7;
    font-style: italic;
    font-family: var(--serif);
  }
  .compare-verdict {
    font-size: 11px;
    font-family: var(--mono);
    margin-top: 0.5rem;
    padding: 3px 8px;
    border-radius: 2px;
    display: inline-block;
  }
  .verdict-pro  { background: #e8f5ee; color: #085041; }
  .verdict-con  { background: #fdecea; color: #7a1f1f; }

  .compare-footnote {
    font-size: 12.5px;
    color: var(--ink-muted);
    line-height: 1.7;
    padding: 0.75rem 1rem;
    background: var(--paper-dark);
    border-left: 2px solid var(--rule);
    font-style: italic;
  }

  /* EDITOR BOX */
  .editor-box {
    background: var(--ink);
    color: var(--paper);
    padding: 2rem 2.25rem;
    position: relative;
    overflow: hidden;
  }
  .editor-box::before {
    content: '\\201C';
    position: absolute;
    top: -0.5rem;
    left: 1rem;
    font-family: var(--serif);
    font-size: 8rem;
    color: rgba(255,255,255,0.05);
    line-height: 1;
    pointer-events: none;
  }
  .editor-label {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .editor-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.1);
  }
  .editor-text {
    font-family: var(--serif);
    font-size: 1rem;
    line-height: 1.9;
    color: rgba(245,242,235,0.88);
    position: relative;
    z-index: 1;
  }

  /* FOOTER */
  footer {
    background: var(--ink);
    color: var(--ink-faint);
    text-align: center;
    padding: 1.5rem 2rem;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    border-top: 4px solid var(--accent);
  }

  /* DIVIDER */
  .rule-double {
    border: none;
    border-top: 1px solid var(--rule);
    position: relative;
    margin: 0 0 3rem;
  }
  .rule-double::after {
    content: '';
    display: block;
    border-top: 1px solid var(--rule);
    margin-top: 3px;
  }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .masthead-inner { grid-template-columns: 1fr; }
    .masthead-meta { text-align: left; }
    .compare-grid { grid-template-columns: 1fr; }
    .container { padding: 2rem 1.25rem 3rem; }
  }
`};
  </style>
</head>
<body>

<header class="masthead">
  <div class="masthead-inner">
    <div>
      <p class="masthead-flag">Daily News Briefing · Evening Edition</p>
      <h1 class="masthead-title">석간 브리핑<br><em>오늘의 주요 뉴스</em></h1>
    </div>
    <div class="masthead-meta">
      <span class="masthead-date">${mastheadDateText}</span>
      <span class="masthead-time">편집 기준 오후 12시 이후</span>
    </div>
  </div>
  <hr class="masthead-rule">
  <div class="masthead-byline">
    <span>정치 · 경제 · 산업 · 사회 · 국제</span>
    <span>관점 비교 포함</span>
    <span>에디터 한마디</span>
  </div>
</header>

<nav class="nav-strip">
  <div class="nav-inner">
    <a href="#politics" class="nav-pill">정치</a>
    <a href="#economy" class="nav-pill">경제</a>
    <a href="#industry" class="nav-pill">산업</a>
    <a href="#society" class="nav-pill">사회</a>
    <a href="#intl" class="nav-pill">국제</a>
    <a href="#compare" class="nav-pill">관점 비교</a>
    <a href="#editor" class="nav-pill">에디터</a>
  </div>
</nav>

<main class="container">

  <section class="section" id="politics">
    <div class="section-header">
      <span class="section-tag tag-politics">Politics</span>
      <span class="section-title-text">정치</span>
    </div>
    <div class="article-card">
      <p class="article-headline">중수청·공소청법, 오늘 본회의 상정… 78년 검찰 체계 전면 개편 초읽기</p>
      <p class="article-body">검찰청을 폐지하고 수사와 기소를 분리하는 내용의 중대범죄수사청(중수청)·공소청 설치법이 18일 국회 법사위를 통과, 19일 본회의에 상정됐다. 중수청은 행안부 소속으로 부패·마약·사이버범죄 등 6대 범죄를 전담 수사하며, 오는 10월 검찰청 폐지 후 공식 출범할 예정이다. 국민의힘은 필리버스터로 저항했으나 민주당은 토론 종결 절차를 통해 법안 처리를 강행한다는 방침이다.</p>
      <p class="article-source"><span class="source-dot"></span> 머니투데이 · 법률신문 · 헤럴드경제 (2026.03.18~19)</p>
    </div>
    <div class="article-card">
      <p class="article-headline">6·3 지방선거 공천 경쟁 본격화… 홍준표, 오세훈 겨냥 작심 비판</p>
      <p class="article-body">국민의힘 내부에서 6·3 지방선거를 앞두고 공천 갈등이 격화되고 있다. 홍준표 전 대구시장은 오세훈 서울시장이 '바른정당 시즌2' 구상에 실패했다고 비판했고, 대구시장 공천을 둘러싸고 이정현 공관위원장과 주호영 의원 간 지역감정 논란까지 불거졌다. 당내 보수 재편을 둘러싼 계파 갈등이 선거를 앞두고 더욱 가시화되는 양상이다.</p>
      <p class="article-source"><span class="source-dot"></span> 헤럴드경제 · 한국일보 (2026.03.19)</p>
    </div>
  </section>

  <hr class="rule-double">

  <section class="section" id="economy">
    <div class="section-header">
      <span class="section-tag tag-economy">Economy</span>
      <span class="section-title-text">경제</span>
    </div>
    <div class="article-card">
      <p class="article-headline">국내 은행 순이익 24조 1천억원… 사상 최대, 한은 총재는 추경 지지</p>
      <p class="article-body">금융감독원이 19일 발표한 2025년 영업실적에 따르면 국내 은행 당기순이익이 전년 대비 8.2% 증가한 24조 1천억원을 기록하며 역대 최대치를 경신했다. 이자이익과 외환·파생 관련 이익이 함께 늘었다. 같은 날 이창용 한국은행 총재는 정부의 추가경정예산 편성 필요성에 동의한다고 밝혀, 중동 발 에너지 위기에 대응하는 '전쟁 추경' 논의에 힘이 실렸다.</p>
      <p class="article-source"><span class="source-dot"></span> 경향신문 · 재정경제부 (2026.03.19)</p>
    </div>
    <div class="article-card">
      <p class="article-headline">중동 전쟁 여파로 코스피 5800선 붕괴 출발… '마이크론 효과'도 역부족</p>
      <p class="article-body">19일 코스피가 전일 5% 급등 후 하루 만에 2.76% 하락, 5761선으로 출발하며 투자심리가 다시 얼어붙었다. 전날 삼성전자 주총 호재와 마이크론 기대감으로 반등했으나, 이란-미국 전쟁 확전 우려와 국제유가 재상승이 분위기를 뒤집었다. 원·달러 환율은 전날 야간거래에서 1,500원을 재돌파했다.</p>
      <p class="article-source"><span class="source-dot"></span> 서울경제 · YTN (2026.03.19)</p>
    </div>
  </section>

  <hr class="rule-double">

  <section class="section" id="industry">
    <div class="section-header">
      <span class="section-tag tag-industry">Industry</span>
      <span class="section-title-text">산업</span>
    </div>
    <div class="article-card">
      <p class="article-headline">삼성전자·SK하이닉스, 코스피 시총 합산 40% 사상 첫 돌파</p>
      <p class="article-body">18일 삼성전자가 7.53% 급등하며 '20만전자'를 12거래일 만에 재탈환하고, SK하이닉스도 8.87% 오르며 '100만닉스'를 회복했다. 두 기업의 합산 시총 비중이 코스피 전체의 40.61%를 기록해 사상 처음 40% 선을 넘었다. 엔비디아 GTC 기대감, 삼성전자의 3조 7500억원 결산 배당 및 16조원 자사주 소각 확정, 마이크론 실적 기대가 복합적으로 작용했다.</p>
      <p class="article-source"><span class="source-dot"></span> EBN뉴스 · 머니투데이 (2026.03.18)</p>
    </div>
    <div class="article-card">
      <p class="article-headline">카타르 라스라판 LNG 시설 타격… 한국 에너지 수급 '비상'</p>
      <p class="article-body">이란의 드론 공격으로 세계 최대 LNG 생산단지인 카타르 라스라판 시설이 폐쇄되고 카타르에너지가 불가항력을 선언했다. 한국의 카타르산 LNG 의존도는 15% 수준으로, 전문가들은 최소 4~6주의 공급 공백을 예상한다. 정부는 UAE에서 총 2400만 배럴 원유를 긴급 도입하고 대체 공급처 확보에 나섰다.</p>
      <p class="article-source"><span class="source-dot"></span> 글로벌이코노믹 · 정책브리핑 (2026.03.18~19)</p>
    </div>
  </section>

  <hr class="rule-double">

  <section class="section" id="society">
    <div class="section-header">
      <span class="section-tag tag-society">Society</span>
      <span class="section-title-text">사회</span>
    </div>
    <div class="article-card">
      <p class="article-headline">BTS 광화문 공연 D-2, 정부 도심 테러경보 '주의' 단계로 격상</p>
      <p class="article-body">정부가 오는 21일 예정된 BTS 광화문 공연에 대비해 19일 0시부터 21일 자정까지 서울 종로구·중구 일대 테러경보를 '관심'에서 '주의'로 한 단계 높였다. 수십만 명 이상의 인파가 몰릴 것으로 예상되는 대규모 행사인 만큼 선제적 안전 조치에 나선 것이다. 경찰과 관계기관은 현장 배치를 대폭 강화할 방침이다.</p>
      <p class="article-source"><span class="source-dot"></span> 한국경제 · 다음뉴스 (2026.03.19)</p>
    </div>
    <div class="article-card">
      <p class="article-headline">수원 공사현장 사망사고 이랜드건설 압수수색… 노동안전 수사 확대</p>
      <p class="article-body">지난달 수원시 민간 임대주택 공사 현장에서 발생한 노동자 사망사고와 관련해 경찰과 고용노동부가 19일 이랜드건설 현장사무소 등 2곳에 대한 압수수색을 진행했다. 수사관 36명이 투입된 이번 압수수색은 산업재해 책임 규명을 위한 것으로, 원청인 이랜드건설의 안전관리 책임 여부가 핵심 쟁점이다.</p>
      <p class="article-source"><span class="source-dot"></span> 경향신문 (2026.03.19)</p>
    </div>
  </section>

  <hr class="rule-double">

  <section class="section" id="intl">
    <div class="section-header">
      <span class="section-tag tag-intl">International</span>
      <span class="section-title-text">국제</span>
    </div>
    <div class="article-card">
      <p class="article-headline">이란 2인자 라리자니 사망 공식 확인… 이란 지도부 혼란 가중</p>
      <p class="article-body">이란의 안보 수장이자 '2인자'로 불리던 알리 라리자니가 이스라엘 공습으로 사망했음이 공식 확인됐다. 전쟁 발발 이후 이란 고위 지도부가 직접 타격을 입은 첫 사례로, 지도부 의사결정 체계에 혼란을 줄 수 있다는 분석이 나온다. 한편 트럼프 대통령은 호르무즈 해협 안전 확보를 위해 동맹국들에 군함 파견을 요구하고 있으나 유럽 국가들은 이를 거부하고 있다.</p>
      <p class="article-source"><span class="source-dot"></span> 뉴스공장 · 서울경제 (2026.03.19)</p>
    </div>
    <div class="article-card">
      <p class="article-headline">연준 FOMC 금리 동결, 파월 매파 발언… 아시아 금융시장 출렁</p>
      <p class="article-body">미국 연방준비제도가 기준금리를 연 3.50~3.75%로 동결한 가운데 파월 의장이 매파적 발언을 내놓으며 아시아 금융시장에 충격을 줬다. 한국은행 유상대 부총재는 "연준 통화정책 경로의 불확실성이 더 커졌다"며 중동 리스크까지 겹친 환경에 경계를 높였다. 원·달러 환율은 장중 1,505원까지 오르며 2009년 금융위기 이후 최고 수준을 기록했다.</p>
      <p class="article-source"><span class="source-dot"></span> 경향신문 · YTN (2026.03.19)</p>
    </div>
  </section>

  <hr class="rule-double">

  <section class="section" id="compare">
    <div class="section-header">
      <span class="section-tag tag-compare">Analysis</span>
      <span class="section-title-text">관점 비교 — 중수청·공소청법</span>
    </div>
    <div class="compare-grid">
      <div class="compare-cell">
        <p class="compare-outlet">디지털타임스 / 민주당 측</p>
        <p class="compare-body">"78년 검찰 해체 초읽기. 수사·기소 분리로 권력형 비리에 흔들리지 않는 공정한 형사사법 체계를 만드는 역사적 첫걸음."</p>
        <span class="compare-verdict verdict-pro">→ 검찰개혁 완성 · 사법 정상화 프레임</span>
      </div>
      <div class="compare-cell">
        <p class="compare-outlet">조선비즈 / 국민의힘 측</p>
        <p class="compare-body">"행안부 아래 수사기관을 두면 권력의 수사 통제가 가능해진다. 정치적 보복이자 인민 수사 체계의 서막이 될 수 있다."</p>
        <span class="compare-verdict verdict-con">→ 권력 남용 · 보복 입법 프레임</span>
      </div>
    </div>
    <p class="compare-footnote">핵심 쟁점: 중수청이 행안부 소속인 점을 놓고 '수사 독립성 확보'(여당)와 '정치 권력의 수사 도구화'(야당) 간 정면충돌. 야당은 수사심의회 구성의 실효성도 의문시.</p>
  </section>

  <hr class="rule-double">

  <section class="section" id="editor">
    <div class="section-header">
      <span class="section-tag tag-editor">Editor</span>
      <span class="section-title-text">오늘의 에디터 한마디</span>
    </div>
    <div class="editor-box">
      <p class="editor-label">Editor's Note · ${escapeHtml(editorLabelDate)} 석간</p>
      <p class="editor-text">${editorText}</p>
    </div>
  </section>

</main>

<footer>
<p>석간 브리핑 · ${escapeHtml(footerDateText)} · 편집 기준 오후 12시 이후 &nbsp; |&nbsp; 본 브리핑은 각 언론사 보도를 바탕으로 편집되었습니다</p>
</footer>

</body>
</html>
`;

  return (
    <div
      className="min-h-screen"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

