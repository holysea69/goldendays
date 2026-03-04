import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main className="flex flex-col md:flex-row w-screen h-[100dvh] overflow-hidden bg-[#faf8f3]">
      
      {/* 1. 뉴스 피드 영역 (상단 75%) */}
      <div className="w-full h-[75%] md:w-3/4 md:h-full flex flex-col overflow-y-auto bg-[#faf8f3] border-b-[2px] md:border-b-0 md:border-r-[3px] border-[#e0d9cf]">
        <NewsFeed />
      </div>

      {/* 2. AI 상담창 영역 (하단 25% - 크기를 절반으로 축소) */}
      <div className="w-full h-[25%] md:w-1/4 md:h-full flex flex-col bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-20">
        <ChatBot />
      </div>

    </main>
  );
}