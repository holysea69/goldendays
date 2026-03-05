"use client";

import { useEffect, useState } from "react";

export default function NewsModal({ item, onClose, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.fullContent || item.content);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleEditSave = () => {
    if (!onUpdate) return;
    onUpdate({ ...item, title: editTitle, content: editContent, fullContent: editContent });
    setIsEditing(false);
  };

  // [수정됨] 렌더링될 때 링크 주소를 미리 완벽하게 조립해 둡니다.
  const getValidUrl = (url: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "https://" + trimmed;
    }
    return trimmed;
  };
  const finalUrl = getValidUrl(item.url);

  // 챗봇 열기 함수
  const handleAskGolden = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    setTimeout(() => {
      const chatbotBtn = document.querySelector('.chatbot-btn') as HTMLButtonElement;
      if (chatbotBtn) chatbotBtn.click();
    }, 100);
  };

  return (
    <div 
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }} 
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: "100%", maxWidth: "600px", height: "92vh", backgroundColor: "#fff", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* 헤더 */}
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "8px", backgroundColor: "#e8f4ff", color: "#0046ff", fontWeight: "bold" }}>
              {item.emoji} {item.category}
            </span>
            <button onClick={onClose} style={{ border: "none", background: "#eee", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", margin: 0 }}>{item.title}</h2>
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", fontSize: "20px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
          {isEditing ? (
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={15} style={{ width: "100%", fontSize: "16px", padding: "10px" }} />
          ) : (
            item.fullContent || item.content
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{ padding: "15px 20px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #eee", backgroundColor: "#fff" }}>
          {!isEditing && (
            <div style={{ display: "flex", gap: "10px" }}>
              {/* [핵심 변경] 자바스크립트 대신 가장 확실한 HTML 링크(a 태그)를 버튼처럼 꾸밈 */}
              {finalUrl ? (
                <a 
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    flex: 2, padding: "14px", borderRadius: "12px", background: "#f0f2f5", 
                    color: "#1a1a2e", fontWeight: "700", textDecoration: "none", 
                    display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" 
                  }}
                >
                  📰 원문보기
                </a>
              ) : (
                <button 
                  onClick={() => alert("이 기사는 원문 링크가 제공되지 않습니다.")}
                  style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#f0f2f5", color: "#1a1a2e", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "16px" }}
                >
                  📰 원문보기 (링크 없음)
                </button>
              )}
              <button onClick={() => setIsEditing(true)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>✏️</button>
            </div>
          )}
          
          <div style={{ display: "flex", gap: "10px" }}>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff" }}>취소</button>
                <button onClick={handleEditSave} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: "#ff9900", color: "#fff", border: "none", fontWeight: "bold" }}>저장</button>
              </>
            ) : (
              <>
                <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", fontWeight: "700", cursor: "pointer" }}>닫기</button>
                <button 
                  onClick={handleAskGolden}
                  style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#FF6B00", color: "#fff", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "16px" }}
                >
                  🤖 골든이 상담하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}