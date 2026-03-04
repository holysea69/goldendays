"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가될 때마다 자동으로 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. 사용자 메시지 추가
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 2. AI 답변 시뮬레이션 (0.6초 뒤)
    setTimeout(() => {
      const aiResponse = { 
        role: "ai", 
        text: `'${input}'에 대해 골든이가 답변을 준비하고 있어요. 곧 더 자세히 알려드릴게요!` 
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
      {/* 상단 라벨 */}
      <div style={{ padding: "8px 15px", borderBottom: "1px solid #f0f0f0", fontSize: "13px", fontWeight: "bold", color: "#0046ff" }}>
        🤖 AI 골든이 상담
      </div>

      {/* 메시지 채팅 영역 */}
      <div 
        ref={scrollRef} 
        style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.role === "user" ? "#0046ff" : "#f0f2f5",
            color: msg.role === "user" ? "#fff" : "#333",
            padding: "10px 14px", 
            borderRadius: "15px", 
            fontSize: "15px", 
            maxWidth: "80%", 
            wordBreak: "break-all" 
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* ⚠️ 복구된 입력창 및 전송 버튼 영역 ⚠️ */}
      <div style={{ padding: "10px", borderTop: "1px solid #eee", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="궁금한 것을 물어보세요" 
            style={{ 
              flex: 1, 
              padding: "12px", 
              borderRadius: "10px", 
              border: "1px solid #ddd", 
              fontSize: "16px",
              outline: "none"
            }} 
          />
          <button 
            onClick={handleSend} 
            style={{ 
              padding: "12px 20px", 
              background: "#0046ff", 
              color: "#fff", 
              border: "none", 
              borderRadius: "10px", 
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            전송
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "#999", marginTop: "6px", textAlign: "center" }}>
          🎤 마이크로 음성 입력이 가능합니다
        </p>
      </div>
    </div>
  );
}