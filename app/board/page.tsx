import Link from "next/link";
import PostBoard from "@/components/PostBoard";
import ChatBot from "@/components/ChatBot";

export default function BoardPage() {
  return (
    <main className="min-h-screen bg-[#F4F7FA] relative pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-4 px-6 bg-white border-2 border-sky-200 rounded-xl text-[#1E3A8A] text-xl font-bold hover:bg-sky-50 hover:border-sky-300 transition-colors shadow-sm"
        >
          <span>←</span>
          홈으로 돌아가기
        </Link>
      </div>
      <PostBoard />
      <ChatBot />
    </main>
  );
}
