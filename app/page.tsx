import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    // h-[100dvh]로 모바일 브라우저 높이에 딱 맞춤
    <main className="flex flex-col md:flex-row w-screen h-[100dvh] overflow-hidden bg-[#faf8f3]">
      
      {/* 1. 뉴스 피드 영역 (상단 60% - 더 넓게) */}
      <div className="w-full h-[60%] md:w-3/5 md:h-full flex flex-col overflow-y-auto bg-[#faf8f3] border-b-[3px] md:border-b-0 md:border-r-[4px] border-[#e0d9cf]">
        <NewsFeed />
      </div>

      {/* 2. AI 상담창 영역 (하단 40% - 2/5 비율) */}
      <div className="w-full h-[40%] md:w-2/5 md:h-full flex flex-col bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.15)] z-20">
        <ChatBot />
      </div>

    </main>
  );
}