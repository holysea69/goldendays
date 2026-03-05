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

  // 1. [수정됨] 절대 튕기지 않는 원문보기 함수
  const handleOpenSource = (e: React.MouseEvent) => {
    e.preventDefault();  // 기본 클릭 동작(새로고침) 차단
    e.stopPropagation(); // 뒷배경 클릭 방지

    if (!item.url || item.url.trim() === "") {
      alert("원문 링크가 없습니다.");
      return;
    }

    let finalUrl = item.url.trim();
    
    // 주소에 http가 없으면 강제로 붙여서 무조건 외부 사이트로 열리게 만듦
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  // 2. [수정됨] 새로 바꾼 챗봇(오렌지색 버튼)과 연결되도록 수정된 골든이 상담 함수
  const handleAskGolden = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 모달을 닫습니다.
    onClose();
    
    // 0.1초 뒤에 오렌지색 챗봇 버튼(chatbot-btn)을 자동으로 클릭합니다.
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
              <button 
                onClick={handleOpenSource}
                style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#f0f2f5", color: "#1a1a2e", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                📰 원문보기
              </button>
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