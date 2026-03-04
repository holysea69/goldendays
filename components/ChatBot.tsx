"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: `'${input}'에 대해 골든이가 답변을 준비하고 있어요!` }]);
    }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
      {/* 1. 상담창 제목 */}
      <div style={{ flexShrink: 0, padding: "8px 15px", borderBottom: "1px solid #f0f0f0", fontSize: "13px", fontWeight: "bold", color: "#0046ff" }}>
        🤖 AI 골든이 상담
      </div>

      {/* 2. 채팅 메시지 영역 (스크롤 가능) */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.role === "user" ? "#0046ff" : "#f0f2f5",
            color: msg.role === "user" ? "#fff" : "#333",
            padding: "8px 12px", borderRadius: "15px", fontSize: "14px", maxWidth: "80%"
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* 3. 입력창 영역 (하단에 딱 붙어있음) */}
      <div style={{ flexShrink: 0, padding: "10px", borderTop: "1px solid #eee", backgroundColor: "#fff", paddingBottom: "env(safe-area-inset-bottom, 10px)" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="질문하세요" 
            style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px", outline: "none" }} 
          />
          <button onClick={handleSend} style={{ padding: "12px 18px", background: "#0046ff", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold" }}>전송</button>
        </div>
      </div>
    </div>
  );
}