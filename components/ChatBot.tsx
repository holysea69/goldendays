"use client";

import React, { useState } from "react";

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요?" }]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // 사용자가 입력한 메시지 추가
    setMessages([...messages, { role: "user", text: input }]);
    
    // 답변 로직 (실제 API 연결 전까지는 예시 답변)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: `'${input}'에 대해 골든이가 확인 중입니다. 잠시만 기다려 주세요!` }]);
    }, 600);
    
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#fff" }}>
      {/* 제목 부분에 AI 상담 추가 */}
      <div style={{ padding: "8px 15px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", fontWeight: "bold", color: "#0046ff" }}>
        🤖 AI 골든이 상담
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            backgroundColor: msg.role === "user" ? "#0046ff" : "#f0f2f5",
            color: msg.role === "user" ? "#fff" : "#333",
            padding: "8px 12px", borderRadius: "15px", fontSize: "15px", maxWidth: "85%"
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* 입력창 및 전송 버튼 */}
      <div style={{ padding: "10px", borderTop: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="궁금한 것을 물어보세요" 
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px" }} 
          />
          <button 
            onClick={handleSend}
            style={{ padding: "10px 18px", background: "#0046ff", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
          >
            전송
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "#999", marginTop: "5px", textAlign: "center" }}>
          🎤 마이크로 음성 입력이 가능합니다
        </p>
      </div>
    </div>
  );
}