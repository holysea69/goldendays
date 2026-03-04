import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    // [중요] h-[100dvh]는 모바일 브라우저 주소창을 제외한 실제 높이를 꽉 채웁니다.
    // overflow-hidden을 주어야 전체 페이지가 덜덜거리지 않고 안쪽에서만 스크롤됩니다.
    <main className="flex flex-col md:flex-row w-screen h-[100dvh] overflow-hidden bg-[#faf8f3]">
      
      {/* 1. 뉴스 피드 영역 (상단 65%) */}
      <div className="w-full h-[65%] md:w-2/3 md:h-full flex flex-col overflow-y-auto bg-[#faf8f3] border-b-2 md:border-b-0 md:border-r-[3px] border-[#e0d9cf]">
        <NewsFeed />
      </div>

      {/* 2. AI 상담창 영역 (하단 35%) */}
      {/* shadow를 넣어 뉴스 영역과 확실히 구분되게 했습니다. */}
      <div className="w-full h-[35%] md:w-1/3 md:h-full flex flex-col bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-20">
        <ChatBot />
      </div>

    </main>
  );
}