"use client";

import { useEffect, useState } from "react";
import { NewsItem, Category, inferEmoji } from "./newsData";

interface NewsModalProps {
  item: NewsItem;
  onClose: () => void;
  onUpdate?: (updated: NewsItem) => void;
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  복지: { backgroundColor: "#e8f4ff", color: "#0046ff", border: "1px solid #0046ff" },
  건강: { backgroundColor: "#e8fff0", color: "#007a38", border: "1px solid #007a38" },
  재테크: { backgroundColor: "#fff8e0", color: "#a06000", border: "1px solid #c8982a" },
  생활: { backgroundColor: "#f0e8ff", color: "#6600cc", border: "1px solid #9944dd" },
  일자리: { backgroundColor: "#fff4e8", color: "#b85c00", border: "1px solid #c87020" },
  문화: { backgroundColor: "#fce8ff", color: "#8800cc", border: "1px solid #aa44dd" },
};

const VALID_CATEGORIES: Category[] = ["건강", "복지", "일자리", "문화", "생활"];

export default function NewsModal({ item, onClose, onUpdate }: NewsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editCat, setEditCat] = useState<Category>(item.category);
  const [editContent, setEditContent] = useState(item.fullContent || item.content);
  const [editErr, setEditErr] = useState("");

  const badgeStyle = BADGE_STYLES[isEditing ? editCat : item.category] ?? BADGE_STYLES["복지"];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) { setIsEditing(false); return; }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, isEditing]);

  const handleEditSave = () => {
    if (!editTitle.trim()) { setEditErr("제목을 입력해 주세요."); return; }
    if (!editContent.trim()) { setEditErr("본문을 입력해 주세요."); return; }
    if (!onUpdate) return;
    const updated: NewsItem = {
      ...item,
      title: editTitle.trim(),
      category: editCat,
      emoji: inferEmoji(editCat),
      fullContent: editContent.trim(),
      content: editContent.trim(),
      summary: editContent.trim().slice(0, 150),
    };
    onUpdate(updated);
    setIsEditing(false);
  };

  const displayItem = isEditing
    ? { ...item, title: editTitle, category: editCat, emoji: inferEmoji(editCat) }
    : item;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end", // 모바일에서 아래에서 올라오는 느낌
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={isEditing ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
          height: "92vh", // 모바일에서 거의 전체 화면 차지
          backgroundColor: "#fff",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -10px 25px rgba(0,0,0,0.2)"
        }}
      >
        {/* 헤더 부분 */}
        <div style={{
          flexShrink: 0,
          padding: "20px 20px 15px",
          background: isEditing ? "#fff8e0" : "#f8f9fa",
          borderBottom: "1px solid #eee"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            {!isEditing && (
              <span style={{ ...badgeStyle, padding: "4px 12px", borderRadius: "8px", fontSize: "16px", fontWeight: 700 }}>
                {displayItem.emoji} {displayItem.category}
              </span>
            )}
            <button onClick={onClose} style={{ border: "none", background: "#eee", width: "32px", height: "32px", borderRadius: "50%", fontSize: "18px", cursor: "pointer" }}>✕</button>
          </div>

          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "18px", fontWeight: 800, borderRadius: "8px", border: "2px solid #0046ff" }}
            />
          ) : (
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#1a1a2e", lineHeight: "1.4", margin: 0 }}>
              {displayItem.title}
            </h2>
          )}
          
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
            <span>📢 {item.source}</span> | <span>📅 {item.date}</span>
          </div>
        </div>

        {/* 본문 영역: 글자 크기 대폭 확대 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={15}
              style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ddd", lineHeight: "1.6" }}
            />
          ) : (
            <div style={{ 
              fontSize: "20px", // 어르신 가독성을 위한 큰 글씨
              color: "#333", 
              lineHeight: "1.8", 
              whiteSpace: "pre-wrap",
              wordBreak: "break-all"
            }}>
              {item.fullContent || item.content}
            </div>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div style={{ flexShrink: 0, padding: "15px 20px", display: "flex", gap: "10px", background: "#fff", borderTop: "1px solid #eee" }}>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>취소</button>
              <button onClick={handleEditSave} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#ff9900", color: "#fff", fontWeight: 700 }}>저장</button>
            </>
          ) : (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>닫기</button>
              {onUpdate && <button onClick={() => setIsEditing(true)} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "#fff" }}>✏️</button>}
              <button onClick={onClose} style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: "#0046ff", color: "#fff", fontWeight: 700 }}>골든이에게 묻기</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}