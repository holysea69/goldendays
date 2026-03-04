"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // 진짜 AI 서버 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "연결에 문제가 생겼어요. 다시 시도해 주세요." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} style={{ position: "fixed", right: "20px", bottom: "30px", width: "60px", height: "60px", borderRadius: "30px", backgroundColor: "#0046ff", color: "#fff", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", zIndex: 1000, cursor: "pointer" }}>
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div style={{ position: "fixed", right: "20px", bottom: "100px", width: "calc(100% - 40px)", maxWidth: "350px", height: "500px", backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden" }}>
          <div style={{ padding: "15px", background: "#0046ff", color: "#fff", fontWeight: "bold" }}>🤖 AI 골든이 상담</div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", backgroundColor: msg.role === "user" ? "#0046ff" : "#f0f2f5", color: msg.role === "user" ? "#fff" : "#333", padding: "10px 14px", borderRadius: "15px", fontSize: "15px", maxWidth: "85%" }}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div style={{ fontSize: "12px", color: "#999", marginLeft: "5px" }}>골든이가 생각 중...</div>}
          </div>
          <div style={{ padding: "15px", borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="궁금한 것을 물어보세요" style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }} />
              <button onClick={handleSend} style={{ padding: "10px 15px", background: "#0046ff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" }}>전송</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}