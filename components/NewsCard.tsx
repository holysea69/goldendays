"use client";

import React from "react";

export default function NewsCard({ item, onClick }: any) {
  return (
    <div 
      onClick={() => onClick(item)}
      style={{
        backgroundColor: "#fff",
        borderRadius: "20px",
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid #f0f0f0",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ 
          padding: "6px 12px", 
          borderRadius: "10px", 
          fontSize: "13px", 
          fontWeight: "bold",
          backgroundColor: "#f0f7ff",
          color: "#0046ff" 
        }}>
          {item.category}
        </span>
        <span style={{ color: "#999", fontSize: "13px" }}>{item.date}</span>
      </div>

      <h3 style={{ 
        fontSize: "19px", 
        fontWeight: "800", 
        lineHeight: "1.4", 
        color: "#1a1a2e",
        margin: 0,
        height: "54px", // 두 줄 높이 고정
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }}>
        {item.title}
      </h3>

      <p style={{ 
        fontSize: "15px", 
        color: "#555", 
        lineHeight: "1.6",
        margin: 0,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical"
      }}>
        {item.summary}
      </p>

      <div style={{ 
        marginTop: "auto", 
        paddingTop: "16px", 
        borderTop: "1px solid #f9f9f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#0046ff",
        fontWeight: "bold",
        fontSize: "14px"
      }}>
        <span>{item.source}</span>
        <span>자세히 보기 →</span>
      </div>
    </div>
  );
}