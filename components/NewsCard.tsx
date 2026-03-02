"use client";

import { NewsItem } from "./newsData";

interface NewsCardProps {
  item: NewsItem;
  onClick: (item: NewsItem) => void;
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  복지:   { backgroundColor: "#e8f4ff", color: "#0046ff",  border: "2px solid #0046ff" },
  건강:   { backgroundColor: "#e8fff0", color: "#007a38",  border: "2px solid #007a38" },
  일자리: { backgroundColor: "#fff4e0", color: "#b85c00",  border: "2px solid #e07a20" },
  문화:   { backgroundColor: "#fde8ff", color: "#8800cc",  border: "2px solid #bb44ee" },
  생활:   { backgroundColor: "#f0e8ff", color: "#6600cc",  border: "2px solid #9944dd" },
  재테크: { backgroundColor: "#fff8e0", color: "#a06000",  border: "2px solid #c8982a" },
};

export default function NewsCard({ item, onClick }: NewsCardProps) {
  const badgeStyle = BADGE_STYLES[item.category] ?? BADGE_STYLES["복지"];

  return (
    <article
      className="news-card"
      style={{
        backgroundColor: "#fffdf9",
        borderRadius: 24,
        padding: "26px 28px 22px",
        marginBottom: 22,
        border: "1.5px solid #ede8df",
        boxShadow: "0 4px 24px rgba(0, 70, 255, 0.07)",
        cursor: "pointer",
      }}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(item)}
      aria-label={`${item.category} 뉴스: ${item.title}`}
    >
      {/* ── 카테고리 뱃지 + 날짜 ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            ...badgeStyle,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 20px",
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {item.emoji} {item.category}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 16px",
            borderRadius: 999,
            backgroundColor: "#f0f0f8",
            fontSize: 19,
            fontWeight: 600,
            color: "#5a5a7a",
            flexShrink: 0,
          }}
        >
          📅 {item.date}
        </div>
      </div>

      {/* ── 제목 (n8n title) ── */}
      <h2
        style={{
          fontSize: 31,
          fontWeight: 800,
          color: "#1a1a2e",
          lineHeight: 1.45,
          marginBottom: 14,
          letterSpacing: "-0.4px",
        }}
      >
        {item.title}
      </h2>

      {/* ── 요약 (n8n subtitle) ── */}
      <div
        style={{
          fontSize: 24,
          color: "#2a2a4a",
          lineHeight: 1.75,
          marginBottom: 18,
          fontWeight: 600,
          borderLeft: "5px solid #0046ff",
          backgroundColor: "#f0f4ff",
          borderRadius: "0 14px 14px 0",
          padding: "14px 16px",
        }}
      >
        {item.summary}
      </div>

      {/* ── 출처(골든데이즈) + 더 보기 ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "1.5px solid #ede8df",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: "#0046ff",
              fontSize: 15,
              color: "white",
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            G
          </span>
          <span style={{ fontSize: 20, color: "#0046ff", fontWeight: 700 }}>
            {item.source}
          </span>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 22,
            fontWeight: 700,
            color: "#0046ff",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "6px 0",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(item);
          }}
        >
          자세히 보기
          <svg width={22} height={22} fill="none" stroke="#0046ff" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
