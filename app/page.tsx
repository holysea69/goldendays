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
      backgroundColor: "#faf8f3",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* 🌟 상단 고정 바로가기 바 */}
      <div style={{
        padding: "12px 16px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #eee",
        display: "flex",
        gap: "10px",
        zIndex: 10
      }}>
        <a
          href="https://www.youtube.com/watch?v=voklZaAIJjc&list=PLjlxfKqF4CuBPQ-10Z8160p3VsIZgvxX-"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#ffeeee",
            color: "#ff0000",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "bold",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            border: "1px solid #ffcccc"
          }}
        >
          📺 건강 유튜브
        </a>

        <a
          href="https://t.me/CBSsenior_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#eef6ff",
            color: "#0088cc",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "bold",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            border: "1px solid #cce4ff"
          }}
        >
          💬 채팅방
        </a>
      </div>

      <div style={{ flex: 1, width: "100%", overflowY: "auto" }}>
        <NewsFeed />
      </div>

      <ChatBot />

    </main>
  );
}