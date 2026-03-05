{/* NewsModal.tsx의 하단 버튼 영역 부분 */}
<div style={{ 
  display: "grid", 
  gridTemplateColumns: "1fr 1fr", // 버튼이 2개이므로 1:1 비율로 조정
  gap: "12px", 
  marginTop: "20px" 
}}>
  {/* 1. 닫기 버튼 */}
  <button 
    onClick={onClose}
    style={{ 
      padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: "800",
      background: "#fff", color: "#333", border: "1px solid #ddd", cursor: "pointer"
    }}
  >
    닫기
  </button>

  {/* 2. 상담하기 버튼 (강조색) */}
  <button 
    style={{ 
      padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: "800",
      background: "linear-gradient(135deg, #ff8a00, #ff6b00)", color: "#fff", 
      border: "none", cursor: "pointer", display: "flex", alignItems: "center", 
      justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(255, 107, 0, 0.2)"
    }}
  >
    🤖 골든이 상담하기
  </button>
</div>

{/* 상단 '원문보기' 버튼만 남기고 나머지는 정리된 모습 */}
<div style={{ marginTop: "16px", textAlign: "center" }}>
  <a 
    href={item.url} 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ 
      display: "inline-flex", alignItems: "center", gap: "6px", color: "#5a5a7a", 
      fontSize: "14px", fontWeight: "700", textDecoration: "none", padding: "8px 16px",
      backgroundColor: "#f0f0f5", borderRadius: "8px"
    }}
  >
    📰 원문보기
  </a>
</div>