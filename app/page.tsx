"use client";

import React from "react";
import NewsFeed from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    <main style={{ 
      position: "relative", 
      width: "100vw", 
      height: "100dvh", 
      overflow: "hidden", 
      backgroundColor: "#faf8f3" 
    }}>
      {/* 뉴스 영역 (카테고리는 이 안에 들어있습니다) */}
      <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        <NewsFeed />
      </div>

      {/* 챗봇 아이콘 */}
      <ChatBot />
    </main>
  );
}