import NewsFeedSection from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 relative">
      <NewsFeedSection />

      <footer className="py-10 text-center bg-white border-t border-slate-200">
        <p className="text-slate-400 font-medium text-[15px]">
          © 2026 골든데이즈. All rights reserved.
        </p>
        <p className="text-slate-400 text-[13px] mt-1 mb-3">
          본 앱은 정부 기관을 대표하지 않는 민간 서비스입니다.
        </p>
        <Link
          href="/privacy"
          className="inline-block text-slate-400 text-[13px] hover:text-slate-600 hover:underline transition-colors"
        >
          개인정보처리방침
        </Link>
      </footer>

      <ChatBot />
    </main>
  );
}
