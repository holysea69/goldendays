import Link from "next/link";
import NewsFeedSection from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    // 시니어 가독성을 위해 명확한 대비의 배경과 섹션 구분을 적용했습니다.
    <main className="min-h-screen bg-[#E2E8F0] relative">
      
      <section className="bg-[#F8FAFC] border-t-2 border-b-2 border-[#CBD5E1] px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <NewsFeedSection />
        </div>
      </section>

      <footer className="py-20 text-center bg-white border-t-2 border-[#E2E8F0]">
        <p className="text-[#475569] font-semibold text-[17px]">© 2026 골든데이즈. All rights reserved.</p>
        <Link href="/privacy" className="inline-block mt-3 text-slate-400 text-base hover:text-slate-600 hover:underline transition-colors">
          개인정보처리방침
        </Link>
      </footer>

      <ChatBot />
    </main>
  );
}