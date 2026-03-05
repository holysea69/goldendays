"use client";

import React from "react";

interface NewsModalProps {
  item: any;
  onClose: () => void;
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  if (!item) return null;

  const handleOpenLink = () => {
    if (item.url && item.url.trim() !== "") {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      alert("이 기사는 원문 링크 정보가 없습니다.");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.75)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#fff", width: "100%", maxWidth: "500px",
        maxHeight: "90vh", borderRadius: "28px", overflowY: "auto",
        position: "relative", padding: "40px 24px"
      }}>
        
        {/* 닫기 X 아이콘 */}
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, border: "none", background: "#f0f0f5", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", color: "#666" }}>✕</button>

        <div style={{ marginBottom: "16px" }}><span style={{ padding: "6px 14px", borderRadius: "10px", backgroundColor: "#eef2ff", color: "#0046ff", fontSize: "14px", fontWeight: "bold" }}>💚 {item.category}</span></div>

        <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "20px", lineHeight: "1.4", color: "#111" }}>{item.title}</h2>

        {/* 본문 + 출처 결합 */}
        <div style={{ fontSize: "18px", lineHeight: "1.8", color: "#333", marginBottom: "30px", whiteSpace: "pre-wrap" }}>
          {item.fullContent}
          
          <div style={{ marginTop: "24px", fontSize: "16px", color: "#888", fontWeight: "700", textAlign: "right" }}>
            (출처: {item.source || "AI 뉴스"})
          </div>
        </div>

        {/* 원문 보기 링크 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button onClick={handleOpenLink} style={{ background: "none", border: "none", color: "#5a5a7a", textDecoration: "underline", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
            📰 원문 보기
          </button>
        </div>

        {/* 하단 메인 버튼 2개 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: "800", background: "#fff", color: "#444", border: "1px solid #ddd", cursor: "pointer" }}>
            닫기
          </button>
          <button style={{ padding: "16px", borderRadius: "14px", fontSize: "16px", fontWeight: "800", background: "linear-gradient(135deg, #ff8a00, #ff6b00)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 107, 0, 0.2)" }}>
            🤖 골든이와 상담하기
          </button>
        </div>
      </div>
    </div>
  );
}