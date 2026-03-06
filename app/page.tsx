"use client";

import React from "react";
import NewsFeed from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";
// 1. 이메일 구독 컴포넌트 추가
import EmailSubscription from "../components/EmailSubscription";

export default function Home() {
  return (
    <main style={{ 
      position: "relative", 
      width: "100vw", 
      height: "100dvh", 
      overflow: "hidden", 
      backgroundColor: "#faf8f3" 
    }}>
      {/* 뉴스 영역 (스크롤 가능 영역) */}
      <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        {/* 기존 뉴스 피드 */}
        <NewsFeed />
        
        {/* 2. 뉴스 피드 바로 아래에 구독 섹션 배치 */}
        <EmailSubscription />
      </div>

      {/* 챗봇 아이콘 (화면 고정) */}
      <ChatBot />
    </main>
  );
}