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
        position: "relative", padding: "40px 24px",
        display: "flex", flexDirection: "column"
      }}>
        
        {/* 상단 닫기 X 아이콘 (보조) */}
        <button 
          onClick={onClose} 
          style={{ position: "absolute", top: 20, right: 20, border: "none", background: "#f0f0f5", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", color: "#666", zIndex: 10 }}
        >✕</button>

        <div style={{ marginBottom: "16px" }}>
          <span style={{ padding: "6px 14px", borderRadius: "10px", backgroundColor: "#eef2ff", color: "#0046ff", fontSize: "14px", fontWeight: "bold" }}>
            💚 {item.category}
          </span>
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: "900", marginBottom: "20px", lineHeight: "1.4", color: "#111" }}>
          {item.title}
        </h2>

        {/* 본문 내용 */}
        <div style={{ fontSize: "18px", lineHeight: "1.8", color: "#333", marginBottom: "30px", whiteSpace: "pre-wrap" }}>
          {item.fullContent}
          
          {/* 출처 표시 */}
          <div style={{ marginTop: "24px", fontSize: "16px", color: "#888", fontWeight: "700", textAlign: "right" }}>
            (출처: {item.source || "AI 뉴스"})
          </div>
        </div>

        {/* 🌟 하단 버튼 재배치: 원문 보기와 닫기를 나란히 */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "12px",
          marginTop: "auto" // 내용이 적어도 항상 하단에 위치하도록
        }}>
          <button 
            onClick={handleOpenLink}
            style={{ 
              padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: "800", 
              background: "#f3f4f9", color: "#5a5a7a", border: "1px solid #e2e2e9", cursor: "pointer" 
            }}
          >
            📰 원문 보기
          </button>
          
          <button 
            onClick={onClose} 
            style={{ 
              padding: "16px", borderRadius: "16px", fontSize: "16px", fontWeight: "800", 
              background: "#1a1a2e", color: "#fff", border: "none", cursor: "pointer" 
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}