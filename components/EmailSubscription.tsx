"use client";

import React, { useState } from "react";

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      alert("이메일 주소를 정확히 입력해 주세요.");
      return;
    }


    setLoading(true);
    // n8n Webhook의 Production URL로 교체하세요
    const webhookUrl = "https://n8n.mygolden.kr/webhook/subscribe";

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        const message = await response.text();
        alert(message); // n8n에서 설정한 성공 메시지 출력
        setEmail("");
      } else {
        throw new Error("전송 실패");
      }
    } catch (error) {
      alert("잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ 
      padding: "60px 20px", 
      backgroundColor: "#fffdf9", // 페이지 배경보다 살짝 밝은 톤
      textAlign: "center",
      borderTop: "1px solid #eee"
    }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "10px", fontWeight: "bold" }}>
          📮 골든데이즈 '아침 소식지' 신청
        </h2>
        <p style={{ fontSize: "17px", color: "#666", marginBottom: "25px", lineHeight: "1.5" }}>
          매일 아침, 어르신께 꼭 필요한 정보를 <br/> 이메일로 정성껏 배달해 드립니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요" 
            style={{ 
              padding: "15px", 
              fontSize: "18px", 
              borderRadius: "8px", 
              border: "2px solid #f39c12",
              textAlign: "center"
            }}
          />
          <button 
            onClick={handleSubscribe}
            disabled={loading}
            style={{ 
              padding: "15px", 
              fontSize: "18px", 
              backgroundColor: loading ? "#ccc" : "#f39c12", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {loading ? "신청 중..." : "무료 소식지 받아보기"}
          </button>
        </div>
        <p style={{ fontSize: "14px", color: "#999", marginTop: "15px" }}>
          * 언제든 편하게 해지하실 수 있습니다.
        </p>
      </div>
    </section>
  );
}