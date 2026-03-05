"use client";

import React from "react";

interface NewsModalProps {
  item: any;
  onClose: () => void;
  onUpdate?: (item: any) => void;
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  if (!item) return null;

  // 🕵️ 범인 검거를 위한 클릭 함수
  const handleOpenLink = () => {
    console.log("전달받은 주소:", item.url); // F12 콘솔창에 주소를 찍어줍니다.
    
    if (item.url && item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      alert("이 기사는 연결할 수 있는 주소(URL)가 없습니다. 데이터베이스를 확인해봐야 해요!");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#fff", width: "100%", maxWidth: "520px",
        maxHeight: "90vh", borderRadius: "30px", overflowY: "auto",
        position: "relative", padding: "40px 24px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
      }}>
        
        {/* 닫기 버튼 (가장 위로 올림) */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20, border: "none",
            background: "#f0f0f5", width: "40px", height: "40px", 
            borderRadius: "50%", cursor: "pointer", color: "#333",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", zIndex: 1100
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "16px" }}>
          <span style={{
            padding: "6px 14px", borderRadius: "10px", backgroundColor: "#eef2ff",
            color: "#0046ff", fontSize: "14px", fontWeight: "800"
          }}>
            💚 {item.category}
          </span>
        </div>

        <h2 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "20px", color: "#111" }}>
          {item.title}
        </h2>

        <div style={{ 
          fontSize: "18px", lineHeight: "1.8", color: "#333", 
          marginBottom: "40px", whiteSpace: "pre-wrap"
        }}>
          {item.fullContent}
        </div>

        {/* 🔗 원문 보기 (버튼 방식으로 변경하여 확실하게 작동) */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button 
            onClick={handleOpenLink}
            style={{ 
              display: "inline-flex", alignItems: "center", gap: "8px", 
              color: "#fff", fontSize: "16px", fontWeight: "700", 
              padding: "14px 28px", backgroundColor: "#5a5a7a", 
              borderRadius: "15px", border: "none",
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 10px rgba(90, 90, 122, 0.3)",
              zIndex: 1100 // 다른 요소보다 위에 오도록 설정
            }}
          >
            📰 원문 보기
          </button>
        </div>

        {/* 하단 닫기/상담하기 버튼 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: "18px", borderRadius: "16px", fontSize: "17px", fontWeight: "800",
              background: "#fff", color: "#444", border: "1px solid #ddd", cursor: "pointer"
            }}
          >
            닫기
          </button>
          <button 
            style={{ 
              padding: "18px", borderRadius: "16px", fontSize: "17px", fontWeight: "800",
              background: "linear-gradient(135deg, #ff8a00, #ff6b00)", color: "#fff", 
              border: "none", cursor: "pointer"
            }}
          >
            🤖 골든이 상담하기
          </button>
        </div>
      </div>
    </div>
  );
}