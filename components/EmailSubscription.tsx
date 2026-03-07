"use client";

import React, { useState } from "react";

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // n8n 웹훅으로 POST 요청 (이메일 전송)
      const response = await fetch("https://n8n.mygolden.kr/webhook/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, date: new Date().toISOString() }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        alert("구독 신청이 완료되었습니다! 💌");
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus("error");
      alert("죄송합니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="bg-orange-50 py-12 px-4 text-center">
      <h2 className="text-2xl font-bold mb-4">매일 아침, 따뜻한 소식을 보내드려요</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          {status === "loading" ? "전송 중..." : "구독하기"}
        </button>
      </form>
    </section>
  );
}