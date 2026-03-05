"use client";

import { useEffect, useState } from "react";

export default function NewsModal({ item, onClose, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.fullContent || item.content);

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

  // 1. [가장 강력한 우회 기술 적용] 절대 안 튕기는 원문보기 함수
  const handleOpenSource = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let finalUrl = item.url ? String(item.url).trim() : "";
    
    if (!finalUrl) {
      alert("아쉽게도 이 기사는 원문 링크가 없습니다.");
      return;
    }

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    try {
      // 1) 주소가 진짜 인터넷 주소 형식이 맞는지 검사
      const checkUrl = new URL(finalUrl);
      
      // 2) 브라우저 팝업 차단을 피하기 위해 보이지 않는 '투명 링크'를 만들어 클릭시킴
      const secretLink = document.createElement("a");
      secretLink.href = checkUrl.href;
      secretLink.target = "_blank";
      secretLink.rel = "noopener noreferrer";
      document.body.appendChild(secretLink);
      secretLink.click();
      document.body.removeChild(secretLink);

    } catch (error) {
      // 주소 형식이 완전히 망가져 있을 경우 (예: "없음" 이라는 글자만 있을 때)
      alert(`데이터베이스에 저장된 기사 주소가 올바르지 않습니다.\n\n확인된 주소: ${item.url}`);
    }
  };

  // 2. 챗봇 연결 함수
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
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "8px", backgroundColor: "#e8f4ff", color: "#0046ff", fontWeight: "bold" }}>
              {item.emoji} {item.category}
            </span>
            <button onClick={onClose} style={{ border: "none", background: "#eee", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", margin: 0 }}>{item.title}</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px", fontSize: "20px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
          {isEditing ? (
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={15} style={{ width: "100%", fontSize: "16px", padding: "10px" }} />
          ) : (
            item.fullContent || item.content
          )}
        </div>

        <div style={{ padding: "15px 20px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #eee", backgroundColor: "#fff" }}>
          {!isEditing && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={handleOpenSource}
                style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#f0f2f5", color: "#1a1a2e", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                📰 원문보기
              </button>
              
              {/* [신규 추가] 만약 새창이 막히면 직접 복사할 수 있는 링크 복사 버튼 */}
              <button 
                onClick={() => {
                  let copyUrl = item.url ? String(item.url).trim() : "";
                  if (!copyUrl) return alert("복사할 원문 링크가 없습니다.");
                  if (!copyUrl.startsWith("http")) copyUrl = "https://" + copyUrl;
                  navigator.clipboard.writeText(copyUrl);
                  alert(`주소가 복사되었습니다!\n인터넷 주소창에 붙여넣기 하세요.\n\n복사된 주소: ${copyUrl}`);
                }}
                style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #d0d8f0", background: "#e8f4ff", color: "#0046ff", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
              >
                🔗 복사
              </button>

              <button onClick={() => setIsEditing(true)} style={{ width: "50px", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>✏️</button>
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