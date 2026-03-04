"use client";

import React from "react";
import NewsFeed from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    <main style={{ 
      position: "relative", // 챗봇을 띄우기 위한 기준
      width: "100vw", 
      height: "100dvh", 
      overflow: "hidden", 
      backgroundColor: "#faf8f3" 
    }}>
      
      {/* 1. 뉴스 영역 (이제 화면 전체를 사용합니다) */}
      <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        <NewsFeed />
      </div>

      {/* 2. 일반 챗봇 형태 (아이콘으로 떠 있다가 클릭 시 나타남) */}
      <ChatBot />

    </main>
  );
}