"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 오면 항상 아래로 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.reply || "답변을 가져오지 못했습니다." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "앗, 통신에 문제가 생겼네요. 다시 말씀해 주시겠어요?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 반응형 CSS 스타일 */}
      <style>{`
        .chatbot-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: linear-gradient(135deg, #FF6B00, #FF9900);
          color: white;
          border: none;
          border-radius: 30px;
          padding: 16px 28px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          transition: transform 0.2s ease;
        }
        .chatbot-btn:hover {
          transform: translateY(-5px);
        }
        .chatbot-window {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 400px;
          height: 650px;
          max-height: 85vh;
          background: #f9f9f9;
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          z-index: 10000;
          overflow: hidden;
          border: 1px solid #eee;
        }
        
        /* 모바일 최적화 (화면이 작을 때) */
        @media (max-width: 600px) {
          .chatbot-btn {
            bottom: 20px;
            right: 20px;
            padding: 14px 20px;
            font-size: 16px;
          }
          .chatbot-window {
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100dvh; /* 모바일 브라우저 주소창 고려 */
            max-height: 100dvh;
            border-radius: 0;
          }
        }
      `}</style>

      {/* 닫혀 있을 때 (호출 버튼) */}
      {!isOpen && (
        <button className="chatbot-btn" onClick={() => setIsOpen(true)}>
          <span style={{ fontSize: "24px" }}>🤖</span> 
          <span>AI 상담원 골든이</span>
        </button>
      )}

      {/* 열려 있을 때 (채팅 창) */}
      {isOpen && (
        <div className="chatbot-window">
          {/* 헤더 */}
          <div style={{
            background: "#1a1a2e", padding: "20px", display: "flex", 
            justifyContent: "space-between", alignItems: "center", color: "white"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>AI 골든이</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>무엇이든 물어보세요!</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "28px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* 대화 내용 영역 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 첫 인사말 */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ fontSize: "24px", marginTop: "4px" }}>🤖</div>
              <div style={{
                background: "white", padding: "14px 18px", borderRadius: "2px 20px 20px 20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "16px", color: "#333", lineHeight: "1.5"
              }}>
                안녕하세요! 골든 데이즈의 인공지능 상담원 <b>골든이</b>입니다.<br/>오늘 어떤 뉴스가 궁금하신가요?
              </div>
            </div>

            {/* 주고받은 메시지들 */}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "10px", alignItems: "flex-start"
              }}>
                {msg.role === "ai" && <div style={{ fontSize: "24px", marginTop: "4px" }}>🤖</div>}
                
                <div style={{
                  background: msg.role === "user" ? "#FF6B00" : "white",
                  color: msg.role === "user" ? "white" : "#333",
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "20px 2px 20px 20px" : "2px 20px 20px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  maxWidth: "80%",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  wordBreak: "keep-all"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* 로딩 표시 */}
            {isLoading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{ fontSize: "24px" }}>🤖</div>
                <div style={{ fontSize: "14px", color: "#666", padding: "14px", background: "white", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  골든이가 생각하는 중입니다... ⏳
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div style={{ padding: "16px", background: "white", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="여기에 궁금한 점을 입력하세요"
              style={{
                flex: 1, padding: "14px 20px", borderRadius: "30px", border: "1px solid #ccc",
                fontSize: "16px", outline: "none", backgroundColor: "#f5f5f5"
              }}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading}
              style={{
                background: "#1a1a2e", color: "white", border: "none", borderRadius: "50%",
                width: "50px", height: "50px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}