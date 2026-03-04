"use client";

import { useEffect, useState } from "react";
import { Category, inferEmoji } from "./newsData";

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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "600px", height: "92vh", backgroundColor: "#fff", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* 헤더 */}
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "8px", backgroundColor: "#e8f4ff", color: "#0046ff", fontWeight: "bold" }}>
              {item.emoji} {item.category}
            </span>
            <button onClick={onClose} style={{ border: "none", background: "#eee", width: "32px", height: "32px", borderRadius: "50%" }}>✕</button>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "900", margin: 0 }}>{item.title}</h2>
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px", fontSize: "20px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
          {isEditing ? <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={15} style={{ width: "100%", fontSize: "16px" }} /> : (item.fullContent || item.content)}
        </div>

        {/* 하단 버튼: 원문보기 연결 핵심 */}
        <div style={{ padding: "15px 20px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #eee" }}>
          {!isEditing && (
            <div style={{ display: "flex", gap: "10px" }}>
              {item.url && (
                <button 
                  onClick={() => {
                    console.log("원문 링크 접속:", item.url);
                    window.open(item.url, "_blank", "noopener,noreferrer");
                  }}
                  style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#f0f2f5", fontWeight: "700", border: "none", cursor: "pointer" }}
                >
                  📰 원문보기
                </button>
              )}
              <button onClick={() => setIsEditing(true)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff" }}>✏️</button>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid #ddd", background: "#fff", fontWeight: "700" }}>닫기</button>
            <button onClick={onClose} style={{ flex: 2, padding: "14px", borderRadius: "12px", background: "#0046ff", color: "#fff", fontWeight: "700", border: "none" }}>🤖 골든이 상담하기</button>
          </div>
        </div>
      </div>
    </div>
  );
}