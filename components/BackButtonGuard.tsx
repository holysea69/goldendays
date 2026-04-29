"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * 안드로이드 뒤로가기 버튼 처리
 * - 홈(/)에서 뒤로가기 → 앱 종료 방지 (히스토리 유지)
 * - 하위 페이지에서 뒤로가기 → 이전 페이지로 이동
 */
export default function BackButtonGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 히스토리 스택에 현재 페이지 상태 추가 (뒤로가기 방지용 더미)
    window.history.pushState({ page: pathname }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      const isHome = pathname === "/";

      if (isHome) {
        // 홈에서 뒤로가기: 히스토리 다시 쌓아서 앱 종료 방지
        window.history.pushState({ page: pathname }, "", window.location.href);
      } else {
        // 하위 페이지에서 뒤로가기: 이전 페이지로 이동
        router.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, router]);

  return null;
}
