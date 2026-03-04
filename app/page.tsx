import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main
      // flex-col: 모바일에서는 세로로 배치
      // md:flex-row: PC(중간 화면 이상)에서는 가로로 배치
      className="flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-[#faf8f3]"
    >
      {/* 1. 뉴스 피드 패널 */}
      <div
        // 모바일: 높이 60% (뉴스를 좀 더 길게 보여줌), 너비 꽉 참
        // PC(md): 높이 100%, 너비 2/3 (원래 비율 유지)
        className="w-full h-[60%] md:w-2/3 md:h-full flex flex-col overflow-hidden bg-[#faf8f3] border-b-2 md:border-b-0 md:border-r-[3px] border-[#e0d9cf]"
      >
        <NewsFeed />
      </div>

      {/* 2. 챗봇 패널 */}
      <div
        // 모바일: 높이 40%, 너비 꽉 참
        // PC(md): 높이 100%, 너비 1/3
        className="w-full h-[40%] md:w-1/3 md:h-full flex flex-col overflow-hidden bg-white"
      >
        <ChatBot />
      </div>
    </main>
  );
}