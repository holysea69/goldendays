"use client";

import React from "react";

export default function NewsCard({ item, onClick }: { item: any; onClick: (item: any) => void }) {
  return (
    <div 
      onClick={() => onClick(item)}
      style={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        padding: "20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        border: "1px solid #f0ece5",
        height: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
      }}
    >
      <div>
        {/* 상단 태그 및 날짜 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
          <span style={{ 
            fontSize: "11px", color: "#0046ff", fontWeight: "800", 
            backgroundColor: "#f0f4ff", padding: "3px 8px", borderRadius: "6px" 
          }}>
            {item.category}
          </span>
          <span style={{ fontSize: "11px", color: "#a0a0b0" }}>{item.date}</span>
        </div>

        {/* 제목: 2줄로 제한하여 카드 높이 일정하게 유지 */}
        <h3 style={{ 
          fontSize: "17px", fontWeight: "800", marginBottom: "8px", lineHeight: "1.4", color: "#1a1a2e",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" 
        }}>
          {item.title}
        </h3>

        {/* 요약: 3줄로 제한 */}
        <p style={{ 
          fontSize: "14px", color: "#5a5a7a", lineHeight: "1.5", 
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" 
        }}>
          {item.summary}
        </p>
      </div>
      
      {/* 하단 화살표만 남겨서 폭을 좁혀도 깔끔함 */}
      <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f8f8fa", paddingTop: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#0046ff", display: "flex", alignItems: "center", gap: "4px" }}>
          자세히 보기 →
        </span>
      </div>
    </div>
  );
}