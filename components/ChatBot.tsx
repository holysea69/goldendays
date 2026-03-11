"use client";

import React, { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! 선생님의 든든한 길잡이 '골든이'입니다. 무엇이든 편하게 물어보세요! 😊" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://n8n.mygolden.kr/webhook/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput }),
      });

      if (!response.ok) throw new Error(`서버 연결 오류: ${response.status}`);

      // n8n에서 Text 응답으로 설정했으므로 .text()로 읽습니다.
      const aiAnswer = await response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiAnswer || "대답을 준비하는 중에 잠시 깜빡했네요. 다시 말씀해주시겠어요?" }
      ]);
    } catch (error) {
      console.error("챗봇 에러:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "선생님, 잠시 연결이 원활하지 않아요. 다시 시도해주시겠어요? 😥" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white text-3xl hover:rotate-12 transition-all active:scale-90"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {isOpen && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-h-[80vh] md:top-auto md:left-auto md:bottom-24 md:right-8 md:translate-x-0 md:translate-y-0 md:w-[400px] md:h-[580px] md:max-h-[580px] z-[1000] bg-white rounded-2xl md:rounded-[32px] shadow-2xl border border-orange-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="bg-orange-500 p-4 md:p-6 text-white text-center flex-shrink-0">
            <h3 className="font-bold text-lg md:text-xl">골든이와 상담하기</h3>
            <p className="text-orange-100 text-xs mt-1">따뜻한 마음으로 소통합니다</p>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-5 bg-orange-50/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] min-w-0 px-6 py-5 rounded-2xl text-[17px] leading-[1.7] shadow-sm break-words ${
                  msg.role === "user" 
                    ? "bg-orange-500 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 rounded-tl-none border border-orange-100"
                }`}>
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-orange-100 px-6 py-5 rounded-2xl text-orange-400 font-bold text-sm animate-pulse">골든이가 생각하고 있어요...</div>
              </div>
            )}
          </div>

          <div className="w-full box-border px-5 py-4 md:py-5 bg-white border-t border-gray-100 flex flex-row items-center gap-3 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="무엇이든 물어보세요..."
              className="flex-1 min-w-0 bg-gray-50 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 text-[16px]"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading}
              className="shrink-0 bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-200 transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}