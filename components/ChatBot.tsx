"use client";

import React, { useState } from "react";

// 함수 앞에 'export default'가 반드시 붙어있어야 page.tsx의 빨간불이 꺼집니다.
export default function ChatBot() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "10px" }}>
      <div style={{ flex: 1, overflowY: "auto", fontSize: "16px", color: "#333", marginBottom: "10px" }}>
        안녕하세요! 무엇을 도와드릴까요?
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="궁금한 것을 물어보세요" 
          style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "16px" }} 
        />
        <button style={{ padding: "10px 15px", background: "#0046ff", color: "#fff", border: "none", borderRadius: "10px" }}>전송</button>
      </div>
      <p style={{ fontSize: "12px", color: "#999", marginTop: "5px", textAlign: "center" }}>
        마이크로 음성 입력이 가능합니다
      </p>
    </div>
  );
}