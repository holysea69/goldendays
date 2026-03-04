"use client";

import React from "react";
import NewsFeed from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      width: "100vw", 
      height: "100dvh", // 모바일 실제 높이 반영
      overflow: "hidden", 
      backgroundColor: "#faf8f3" 
    }}>
      
      {/* 1. 뉴스 영역 (남은 공간 모두 차지) */}
      <div style={{ flex: 1, width: "100%", overflowY: "auto", borderBottom: "1px solid #e0d9cf" }}>
        <NewsFeed />
      </div>

      {/* 2. AI 상담창 영역 (고정된 높이 비율 확보) */}
      <div style={{ 
        height: "25%", 
        minHeight: "180px", // 입력창이 잘리지 않도록 최소 높이 고정
        width: "100%", 
        backgroundColor: "#ffffff", 
        boxShadow: "0 -4px 15px rgba(0,0,0,0.05)", 
        zIndex: 10 
      }}>
        <ChatBot />
      </div>

    </main>
  );
}