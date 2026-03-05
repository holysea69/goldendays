"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // [핵심 추가] AI의 답변 기호를 예쁘게 꾸며주는 번역기 함수
  const formatMessage = (text: string) => {
    if (!text) return { __html: "" };
    let formatted = text;
    // 1. 구분선(---)을 실제 점선으로 변경
    formatted = formatted.replace(/---/g, '<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;" />');
    // 2. 글머리 기호(*)를 보기 좋은 동그라미(•)로 변경
    formatted = formatted.replace(/(?:^|\n)\*\s/g, '\n• ');
    // 3. **굵은 글씨**를 진짜 굵게, 그리고 색상(주황색) 포인트 주기
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #d95b00; font-weight: 900;">$1</strong>');
    // 4. 줄바꿈(\n)을 html 태그(<br/>)로 변경하여 띄어쓰기 보장
    formatted = formatted.replace(/\n/g, '<br />');
    return { __html: formatted };
  };

  return (
    <>
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
            height: 100dvh;
            max-height: 100dvh;
            border-radius: 0;
          }
        }
      `}</style>

      {!isOpen && (
        <button className="chatbot-btn" onClick={() => setIsOpen(true)}>
          <span style={{ fontSize: "24px" }}>🤖</span> 
          <span>AI 상담원 골든이</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
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

          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ fontSize: "24px", marginTop: "4px" }}>🤖</div>
              <div style={{
                background: "white", padding: "16px 20px", borderRadius: "2px 20px 20px 20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "16px", color: "#333", lineHeight: "1.6"
              }}>
                안녕하세요! 골든 데이즈의 인공지능 상담원 <strong style={{color: "#d95b00"}}>골든이</strong>입니다.<br/>오늘 어떤 뉴스가 궁금하신가요?
              </div>
            </div>

            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "10px", alignItems: "flex-start"
              }}>
                {msg.role === "ai" && <div style={{ fontSize: "24px", marginTop: "4px" }}>🤖</div>}
                
                <div 
                  style={{
                    background: msg.role === "user" ? "#FF6B00" : "white",
                    color: msg.role === "user" ? "white" : "#333",
                    padding: "16px 20px",
                    borderRadius: msg.role === "user" ? "20px 2px 20px 20px" : "2px 20px 20px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    maxWidth: "85%",
                    fontSize: "16px",
                    lineHeight: "1.7", // 줄간격을 넓혀서 읽기 편하게
                    wordBreak: "keep-all"
                  }}
                  // AI 답변인 경우 번역기를 통과시키고, 사용자 질문은 그대로 출력
                  dangerouslySetInnerHTML={msg.role === "ai" ? formatMessage(msg.content) : { __html: msg.content }}
                />
              </div>
            ))}
            
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