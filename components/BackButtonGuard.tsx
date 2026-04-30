"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function BackButtonGuard() {
  const pathname = usePathname();
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    // 히스토리 스택에 더미 추가 → popstate 이벤트 발생하게 함
    window.history.pushState({ homeGuard: true }, "");

    const handlePopState = () => {
      if (pathname === "/") {
        // 홈: 뒤로가기 → 종료 확인 다이얼로그 표시
        setShowExitDialog(true);
        // 다시 더미 추가해서 다이얼로그 닫아도 히스토리 유지
        window.history.pushState({ homeGuard: true }, "");
      }
      // 하위 페이지: 브라우저가 자연스럽게 뒤로가기 처리
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname]);

  if (!showExitDialog) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setShowExitDialog(false)}
      />
      {/* 다이얼로그 */}
      <div className="relative w-full max-w-sm mx-4 mb-6 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center border-b border-slate-100">
          <p className="text-[19px] font-bold text-slate-900 mb-1">앱을 종료하겠습니까?</p>
          <p className="text-[15px] text-slate-500">골든데이즈를 닫습니다.</p>
        </div>
        <div className="flex">
          <button
            onClick={() => setShowExitDialog(false)}
            className="flex-1 py-4 text-[17px] font-bold text-slate-600 border-r border-slate-100 hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              setShowExitDialog(false);
              // PWA 앱 종료 시도
              window.history.go(-(window.history.length));
              setTimeout(() => window.close(), 100);
            }}
            className="flex-1 py-4 text-[17px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
