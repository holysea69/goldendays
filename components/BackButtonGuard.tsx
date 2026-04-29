"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 안드로이드 뒤로가기 버튼 처리
 * - 홈(/)에서만 동작: 뒤로가기 눌러도 앱 종료 안 됨
 * - 하위 페이지에서는 자연스럽게 이전 페이지로 이동
 */
export default function BackButtonGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return; // 홈에서만 적용

    // 홈 진입 시 더미 히스토리 추가 → 뒤로가기해도 앱 안 닫힘
    window.history.pushState({ homeGuard: true }, "");

    const handlePopState = () => {
      // 뒤로가기 감지 → 다시 더미 추가 (홈 유지)
      window.history.pushState({ homeGuard: true }, "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname]);

  return null;
}
