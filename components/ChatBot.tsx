"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "기초연금 신청 방법",
  "독감 예방접종 무료 대상",
  "노인 무료 법률 상담",
  "치매 예방 운동법",
  "장기요양보험 신청",
];

const BOT_RESPONSES: Record<string, string> = {
  기초연금:
    "기초연금은 만 65세 이상이며 소득 하위 70%에 해당하는 어르신께 지급됩니다. 월 최대 34만 3,510원을 받으실 수 있어요. 신청은 가까운 주민센터나 국민연금공단 지사에 직접 방문하시거나, 복지로 홈페이지(bokjiro.go.kr)에서 온라인으로도 하실 수 있습니다. 궁금한 점이 더 있으시면 언제든지 말씀해 주세요! 😊",
  독감:
    "65세 이상 어르신은 매년 독감 예방접종을 무료로 받으실 수 있습니다. 접종 시기는 보통 10월부터 12월까지이며, 가까운 지정 의원이나 보건소에서 받으실 수 있습니다. 신분증만 지참하시면 됩니다. 올해 접종 일정은 주소지 관할 보건소(☎129)에 문의해 주시기 바랍니다.",
  법률:
    "65세 이상 어르신은 대한법률구조공단에서 무료 법률 상담을 받으실 수 있습니다. 전화(☎132)로도 상담이 가능하며, 가까운 출장소를 방문하셔도 됩니다. 상속, 재산 문제, 사기 피해 등 다양한 법률 문제를 상담받으실 수 있으니 걱정 마세요.",
  치매:
    "치매 예방을 위한 '치매안심센터'가 전국에 운영되고 있습니다. 치매 검진, 예방 프로그램, 인지 훈련 등의 서비스를 무료로 받으실 수 있습니다. 가까운 치매안심센터를 찾으시려면 치매안심센터 콜센터(☎1899-9988)에 문의하거나, 중앙치매센터 홈페이지를 이용해 주세요.",
  장기요양:
    "노인장기요양보험 신청은 국민건강보험공단(☎1577-1000)에 신청하시면 됩니다. 방문 조사 후 등급이 결정되며, 1~5등급과 인지지원등급으로 나뉩니다. 요양 등급에 따라 재가급여(방문요양, 방문목욕 등) 또는 시설급여(요양원 입소)를 이용하실 수 있습니다.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return `안녕하세요! 골든이 상담사입니다. 말씀하신 "${input}"에 대해 더 자세히 알려드릴게요. 아직 학습 중인 내용이라 전문 상담사 연결이 필요하시면 골든데이즈 상담전화(☎1588-1234)로 연락해 주세요. 복지, 건강, 재테크 등 어떤 것이든 편하게 여쭤보세요! 😊`;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "안녕하세요! 저는 골든데이즈 상담사 '골든이'예요. 😊\n\n복지 혜택, 건강 관리, 재테크 등 궁금하신 것을 무엇이든 편하게 여쭤보세요. 아래 자주 찾는 질문을 눌러보셔도 됩니다!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsLoading(true);

      setTimeout(() => {
        const reply = getResponse(trimmed);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
      }, 1200);
    },
    [isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleVoice = useCallback(() => {
    type SpeechRecognitionCtor = new () => {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start(): void;
      stop(): void;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
    };
    type AnyWindow = typeof window & {
      webkitSpeechRecognition?: SpeechRecognitionCtor;
      SpeechRecognition?: SpeechRecognitionCtor;
    };
    const w = window as AnyWindow;
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isRecording]);

  // suppressHydrationWarning과 함께 사용: 서버/클라이언트 시간 불일치 방지
  const formatTime = (date: Date) => {
    if (typeof window === "undefined") return "";
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 챗봇 헤더 — 골든이 프로필 */}
      <div
        style={{
          flexShrink: 0,
          padding: "20px 24px",
          background: "linear-gradient(135deg, #0046ff 0%, #0066ff 60%, #3388ff 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* 캐릭터 아바타 */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "4px solid white",
              backgroundColor: "#e8f0ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            👴
            <span
              style={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "2px solid white",
                backgroundColor: "#00e676",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", lineHeight: 1.3 }}>
              골든데이즈 상담사
            </h2>
            <h3 style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1.3 }}>
              골든이 ✨
            </h3>
            <p style={{ fontSize: 17, color: "#c7d9ff", marginTop: 4 }}>
              복지 · 건강 · 재테크 무엇이든 물어보세요
            </p>
          </div>

          {/* 상태 뱃지 */}
          <div
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
            }}
          >
            🟢 상담 중
          </div>
        </div>
      </div>

      {/* 빠른 질문 버튼 */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 20px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          backgroundColor: "#f0f4ff",
          borderBottom: "2px solid #e0e8ff",
          alignItems: "center",
        }}
      >
        <span style={{ flexShrink: 0, fontSize: 18, fontWeight: 700, color: "#5a5a7a", marginRight: 4 }}>
          💬 바로 묻기:
        </span>
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: 12,
              fontSize: 19,
              fontWeight: 600,
              color: "#0046ff",
              border: "2px solid #0046ff",
              backgroundColor: "white",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0046ff";
              (e.currentTarget as HTMLButtonElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
              (e.currentTarget as HTMLButtonElement).style.color = "#0046ff";
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="chat-bubble"
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            {/* 봇 아바타 */}
            {msg.role === "assistant" && (
              <div
                style={{
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#e8f0ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                👴
              </div>
            )}

            <div
              style={{
                maxWidth: "78%",
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={
                  msg.role === "user"
                    ? {
                        padding: "16px 24px",
                        borderRadius: "24px 24px 6px 24px",
                        fontSize: 21,
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                        color: "white",
                        fontWeight: 500,
                        background: "linear-gradient(135deg, #0046ff, #0066ff)",
                        boxShadow: "0 4px 16px rgba(0, 70, 255, 0.3)",
                      }
                    : {
                        padding: "16px 24px",
                        borderRadius: "24px 24px 24px 6px",
                        fontSize: 21,
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                        color: "#1a1a2e",
                        fontWeight: 400,
                        backgroundColor: "#f5f7ff",
                        border: "1.5px solid #e0e8ff",
                        boxShadow: "0 2px 8px rgba(0,70,255,0.06)",
                      }
                }
              >
                {msg.text}
              </div>
              <span
                suppressHydrationWarning
                style={{ fontSize: 15, color: "#9ba8bf", marginTop: 6, padding: "0 4px" }}
              >
                {formatTime(msg.timestamp)}
              </span>
            </div>

            {/* 사용자 아바타 */}
            {msg.role === "user" && (
              <div
                style={{
                  flexShrink: 0,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#fef3d0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🙂
              </div>
            )}
          </div>
        ))}

        {/* 로딩 타이핑 표시 */}
        {isLoading && (
          <div
            className="chat-bubble"
            style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 12 }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "#e8f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              👴
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderRadius: "24px 24px 24px 6px",
                backgroundColor: "#f5f7ff",
                border: "1.5px solid #e0e8ff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, color: "#5a5a7a", marginRight: 8 }}>골든이가 답변 중</span>
                <span className="typing-dot" style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#0046ff", display: "inline-block" }} />
                <span className="typing-dot" style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#0046ff", display: "inline-block" }} />
                <span className="typing-dot" style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#0046ff", display: "inline-block" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 영역 */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 20px",
          borderTop: "2px solid #e0e8ff",
          backgroundColor: "#fafbff",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {/* 텍스트 입력 */}
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="궁금하신 것을 여기에 써주세요..."
                rows={2}
                style={{
                  width: "100%",
                  resize: "none",
                  padding: "14px 20px",
                  borderRadius: 18,
                  border: `2px solid ${inputText ? "#0046ff" : "#d0d8f0"}`,
                  fontSize: 21,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  outline: "none",
                  backgroundColor: "white",
                  color: "#1a1a2e",
                  boxShadow: inputText ? "0 0 0 3px rgba(0,70,255,0.12)" : "none",
                  lineHeight: 1.6,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                disabled={isLoading}
                aria-label="메시지 입력"
              />
            </div>

            {/* 마이크 버튼 */}
            <button
              type="button"
              onClick={handleVoice}
              className={isRecording ? "mic-recording" : ""}
              style={{
                flexShrink: 0,
                width: 64,
                height: 64,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                backgroundColor: isRecording ? "#ff3b30" : "#e8f0ff",
                boxShadow: isRecording
                  ? "0 4px 20px rgba(255,59,48,0.4)"
                  : "0 2px 12px rgba(0,70,255,0.15)",
                transform: isRecording ? "scale(1.1)" : "scale(1)",
                transition: "all 0.2s ease",
              }}
              aria-label={isRecording ? "음성 인식 중지" : "음성으로 말하기"}
              title={isRecording ? "누르면 중지됩니다" : "클릭하여 말씀해 주세요"}
            >
              <svg viewBox="0 0 24 24" fill={isRecording ? "white" : "#0046ff"} width={36} height={36}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
              </svg>
            </button>

            {/* 전송 버튼 */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              style={{
                flexShrink: 0,
                width: 64,
                height: 64,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: inputText.trim() && !isLoading ? "pointer" : "not-allowed",
                background: inputText.trim() && !isLoading
                  ? "linear-gradient(135deg, #0046ff, #0066ff)"
                  : "#d0d8f0",
                boxShadow: inputText.trim() && !isLoading
                  ? "0 4px 16px rgba(0,70,255,0.4)"
                  : "none",
                opacity: !inputText.trim() || isLoading ? 0.4 : 1,
                transition: "all 0.2s ease",
              }}
              aria-label="전송"
            >
              <svg viewBox="0 0 24 24" fill="white" width={32} height={32}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          {/* 음성 인식 상태 안내 */}
          {isRecording && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 12,
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 19,
                fontWeight: 700,
                backgroundColor: "#ffe8e8",
                color: "#ff3b30",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ff3b30",
                  display: "inline-block",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
              🎙️ 지금 말씀하세요... (마이크를 다시 누르면 중지)
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 16, color: "#9ba8bf", marginTop: 10 }}>
            Enter 키로 전송 · Shift+Enter로 줄바꿈 · 마이크로 음성 입력
          </p>
        </form>
      </div>
    </section>
  );
}
