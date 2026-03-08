import NewsFeedSection from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    // 시니어 가독성을 위해 명확한 대비의 배경과 섹션 구분을 적용했습니다.
    <main className="min-h-screen bg-[#E2E8F0] relative">
      
      {/* [중복 제거 완료] 
        기존의 중앙 정렬 헤더와 구독 컴포넌트를 삭제했습니다. 
        이제 타이틀과 구독창은 NewsFeedSection 안에서 가로로 출력됩니다. 
      */}
      <section className="bg-[#F8FAFC] border-t-2 border-b-2 border-[#CBD5E1]">
        <div className="max-w-7xl mx-auto">
          <NewsFeedSection />
        </div>
      </section>

      <footer className="py-20 text-center text-[#475569] font-semibold text-[17px] bg-white border-t-2 border-[#E2E8F0]">
        <p>© 2026 골든데이즈. All rights reserved.</p>
      </footer>

      <ChatBot />
    </main>
  );
}