{/* ChatBot.tsx 내 입력창 부분 수정 예시 */}
<div style={{ padding: "10px 15px", backgroundColor: "#fff", borderTop: "1px solid #eee" }}>
  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
    <textarea 
      placeholder="궁금하신 것을 적어주세요..."
      style={{ 
        width: "100%", 
        height: "44px", // 높이 최적화
        padding: "10px 12px", 
        fontSize: "16px", // 가독성 향상
        borderRadius: "12px", 
        border: "1px solid #ddd",
        resize: "none",
        lineHeight: "1.4"
      }}
    />
    <button style={{ background: "#0046ff", color: "#fff", border: "none", borderRadius: "50%", width: "36px", height: "36px" }}>
      ➔
    </button>
  </div>
  <p style={{ fontSize: "11px", color: "#999", marginTop: "5px", textAlign: "center" }}>
    Enter 키로 전송 · Shift+Enter로 줄바꿈
  </p>
</div>