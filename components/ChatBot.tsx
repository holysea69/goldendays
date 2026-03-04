"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false); // 열림/닫힘 상태
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: `'${input}'에 대해 골든이가 답변을 준비하고 있어요!` }]);
    }, 600);
  };

  return (
    <>
      {/* 1. 우측 하단 둥근 플로팅 버튼 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", right: "20px", bottom: "30px",
          width: "60px", height: "60px", borderRadius: "30px",
          backgroundColor: "#0046ff", color: "#fff", fontSize: "28px",
          border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          cursor: "pointer", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* 2. 실제 채팅창 (isOpen일 때만 보임) */}
      {isOpen && (
        <div style={{
          position: "fixed", right: "20px", bottom: "100px",
          width: "calc(100% - 40px)", maxWidth: "350px", height: "450px",
          backgroundColor: "#fff", borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1000
        }}>
          {/* 헤더 */}
          <div style={{ padding: "15px", background: "#0046ff", color: "#fff", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            <span>🤖 AI 골든이 상담</span>
            <span onClick={() => setIsOpen(false)} style={{ cursor: "pointer" }}>⚊</span>
          </div>

          {/* 대화창 */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "#0046ff" : "#f0f2f5",
                color: msg.role === "user" ? "#fff" : "#333",
                padding: "10px 14px", borderRadius: "15px", fontSize: "15px", maxWidth: "85%"
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* 입력창 */}
          <div style={{ padding: "15px", borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="질문하세요..." 
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", outline: "none" }} 
              />
              <button onClick={handleSend} style={{ padding: "10px 15px", background: "#0046ff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" }}>전송</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}