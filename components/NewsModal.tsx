"use client";

import { useEffect, useState } from "react";
import { NewsItem, Category, inferEmoji } from "./newsData";

interface NewsModalProps {
  item: NewsItem;
  onClose: () => void;
  onUpdate?: (updated: NewsItem) => void;
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  복지: { backgroundColor: "#e8f4ff", color: "#0046ff", border: "2px solid #0046ff" },
  건강: { backgroundColor: "#e8fff0", color: "#007a38", border: "2px solid #007a38" },
  재테크: { backgroundColor: "#fff8e0", color: "#a06000", border: "2px solid #c8982a" },
  생활: { backgroundColor: "#f0e8ff", color: "#6600cc", border: "2px solid #9944dd" },
  일자리: { backgroundColor: "#fff4e8", color: "#b85c00", border: "2px solid #c87020" },
  문화: { backgroundColor: "#fce8ff", color: "#8800cc", border: "2px solid #aa44dd" },
};

const VALID_CATEGORIES: Category[] = ["건강", "복지", "일자리", "문화", "생활"];

export default function NewsModal({ item, onClose, onUpdate }: NewsModalProps) {
  const [isEditing,   setIsEditing]   = useState(false);
  const [editTitle,   setEditTitle]   = useState(item.title);
  const [editCat,     setEditCat]     = useState<Category>(item.category);
  const [editContent, setEditContent] = useState(item.fullContent || item.content);
  const [editErr,     setEditErr]     = useState("");

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
      title:       editTitle.trim(),
      category:    editCat,
      emoji:       inferEmoji(editCat),
      fullContent: editContent.trim(),
      content:     editContent.trim(),
      summary:     editContent.trim().slice(0, 150),
    };
    onUpdate(updated);
    setIsEditing(false);
  };

  const displayItem = isEditing
    ? { ...item, title: editTitle, category: editCat, emoji: inferEmoji(editCat) }
    : item;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "rgba(26, 26, 46, 0.65)",
        backdropFilter: "blur(5px)",
      }}
      onClick={isEditing ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          backgroundColor: "#fffdf9",
          borderRadius: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 모달 헤더 */}
        <div
          style={{
            flexShrink: 0,
            padding: "32px 32px 24px",
            background: isEditing
              ? "linear-gradient(135deg, #fff8e0 0%, #fff3d0 100%)"
              : "linear-gradient(135deg, #e8f0ff 0%, #f0ebe3 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              {/* 카테고리 배지 (편집 모드: 선택 버튼) */}
              {isEditing ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {VALID_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditCat(cat)}
                      style={{ padding: "6px 14px", borderRadius: 999, fontSize: 16, fontWeight: 700, border: editCat === cat ? "none" : "2px solid #d0d8f0", backgroundColor: editCat === cat ? "#0046ff" : "#fff", color: editCat === cat ? "#fff" : "#5a5a7a", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {inferEmoji(cat)} {cat}
                    </button>
                  ))}
                </div>
              ) : (
                <span
                  style={{
                    ...badgeStyle,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 20px",
                    borderRadius: 999,
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {displayItem.emoji} {displayItem.category}
                </span>
              )}

              {/* 제목 (편집 모드: input) */}
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); setEditErr(""); }}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #0046ff", fontSize: 24, fontWeight: 900, color: "#1a1a2e", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              ) : (
                <h2
                  id="modal-title"
                  style={{ fontSize: 30, fontWeight: 900, color: "#1a1a2e", lineHeight: 1.4 }}
                >
                  {displayItem.title}
                </h2>
              )}
            </div>

            {/* 편집/닫기 버튼 영역 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              {onUpdate && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#b85c00", border: "2px solid #e0a060", backgroundColor: "#fff8ee", cursor: "pointer", fontFamily: "inherit" }}
                  aria-label="편집"
                  title="편집"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={isEditing ? () => setIsEditing(false) : onClose}
                style={{ width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#5a5a7a", border: "none", backgroundColor: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit", transition: "background-color 0.2s" }}
                aria-label={isEditing ? "취소" : "닫기"}
              >
                {isEditing ? "✕" : "✕"}
              </button>
            </div>
          </div>

          {/* 출처 및 날짜 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontSize: 19, color: "#5a5a7a", flexWrap: "wrap" }}>
            <span>📢 {item.source}</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#b0b8d0", display: "inline-block" }} />
            <span>📅 {item.date}</span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#b0b8d0", display: "inline-block" }} />
            <span>⏱ 읽는 시간 {item.readTime}</span>
          </div>

          {isEditing && (
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 10, backgroundColor: "#fff8e0", border: "1.5px solid #e0c060", fontSize: 15, color: "#a06000", fontWeight: 700 }}>
              ✏️ 편집 모드 — 수정 후 [저장]을 눌러주세요. ESC 또는 ✕로 취소합니다.
            </div>
          )}
        </div>

        {/* 모달 본문 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
          }}
        >
          {/* 요약 강조 박스 (편집 모드에서는 숨김) */}
          {!isEditing && (
            <div
              style={{
                borderRadius: 18,
                padding: 20,
                marginBottom: 24,
                backgroundColor: "#e8f0ff",
                border: "2px solid rgba(0,70,255,0.15)",
              }}
            >
              <p style={{ fontSize: 21, fontWeight: 700, color: "#0046ff", lineHeight: 1.7 }}>
                💡 {item.summary}
              </p>
            </div>
          )}

          {/* 본문 내용 (편집 모드: textarea) */}
          {isEditing ? (
            <div>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#3a3a5a", marginBottom: 8 }}>본문 *</label>
              <textarea
                value={editContent}
                onChange={(e) => { setEditContent(e.target.value); setEditErr(""); }}
                rows={12}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "2px solid #0046ff", fontSize: 19, fontFamily: "inherit", color: "#1a1a2e", outline: "none", resize: "vertical", lineHeight: 1.75, boxSizing: "border-box" }}
              />
              {editErr && <p style={{ marginTop: 8, fontSize: 15, color: "#cc0000", fontWeight: 700 }}>🔴 {editErr}</p>}
            </div>
          ) : (
            <p style={{ fontSize: 23, color: "#1a1a2e", lineHeight: 1.85, whiteSpace: "pre-line" }}>
              {item.content}
            </p>
          )}
        </div>

        {/* 모달 하단 버튼 */}
        <div
          style={{
            flexShrink: 0,
            padding: "20px 32px",
            display: "flex",
            gap: 14,
            borderTop: "2px solid #ede8df",
          }}
        >
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: "16px 0", borderRadius: 18, fontSize: 22, fontWeight: 700, color: "#5a5a7a", border: "2px solid #d0d8e8", backgroundColor: "white", cursor: "pointer", fontFamily: "inherit" }}
              >
                취소
              </button>
              <button
                onClick={handleEditSave}
                style={{ flex: 2, padding: "16px 24px", borderRadius: 18, fontSize: 22, fontWeight: 700, color: "white", border: "none", background: "linear-gradient(135deg, #e87000, #ff9900)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(200,120,0,0.35)" }}
              >
                💾 저장하기
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: "16px 0", borderRadius: 18, fontSize: 22, fontWeight: 700, color: "#5a5a7a", border: "2px solid #d0d8e8", backgroundColor: "white", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
              >
                닫기
              </button>
              <button
                style={{ flex: 2, padding: "16px 24px", borderRadius: 18, fontSize: 22, fontWeight: 700, color: "white", border: "none", background: "linear-gradient(135deg, #0046ff, #0066ff)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,70,255,0.35)" }}
                onClick={onClose}
              >
                🤖 골든이에게 더 물어보기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
