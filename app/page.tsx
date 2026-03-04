import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main
      // h-screen(고정) 대신 h-full(유동적) 사용, overflow-y-auto로 스크롤 허용
      className="flex flex-col md:flex-row w-screen min-h-screen h-full overflow-y-auto md:overflow-hidden bg-[#faf8f3]"
    >
      {/* 1. 뉴스 피드 패널 */}
      <div
        // 모바일에서는 내용에 따라 높이가 늘어나도록 h-auto 설정
        className="w-full h-auto md:w-2/3 md:h-full flex flex-col bg-[#faf8f3] border-b-2 md:border-b-0 md:border-r-[3px] border-[#e0d9cf]"
      >
        <NewsFeed />
      </div>

      {/* 2. 챗봇 패널 */}
      <div
        // 챗봇 영역도 모바일에서 내용만큼 늘어나도록 설정
        className="w-full h-auto md:w-1/3 md:h-full flex flex-col bg-white"
      >
        <ChatBot />
      </div>
    </main>
  );
}