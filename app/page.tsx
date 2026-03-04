"use client";

import React from "react";
// 경로 오류를 방지하기 위해 가장 확실한 상대 경로(../) 방식을 사용합니다.
import NewsFeed from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      width: "100vw", 
      height: "100dvh", 
      overflow: "hidden", 
      backgroundColor: "#faf8f3" 
    }}>
      
      {/* 1. 뉴스 영역 (상단 80% - 4/5 비율) */}
      <div style={{ 
        flex: "0 0 80%", 
        width: "100%", 
        overflowY: "auto", 
        borderBottom: "1px solid #e0d9cf" 
      }}>
        <NewsFeed />
      </div>

      {/* 2. AI 상담창 영역 (하단 20% - 절반으로 축소) */}
      <div style={{ 
        flex: "0 0 20%", 
        width: "100%", 
        backgroundColor: "#ffffff", 
        boxShadow: "0 -4px 15px rgba(0,0,0,0.05)",
        zIndex: 50 
      }}>
        <ChatBot />
      </div>

    </main>
  );
}