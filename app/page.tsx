import NewsFeedSection from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";

export default function Home() {
  return (
    // 전체 배경을 시원하고 깔끔한 연블루 계열(#F4F7FA)로 설정했습니다.
    <main className="min-h-screen bg-[#F4F7FA] relative">
      
      {/* [중복 제거 완료] 
        기존의 중앙 정렬 헤더와 구독 컴포넌트를 삭제했습니다. 
        이제 타이틀과 구독창은 NewsFeedSection 안에서 가로로 출력됩니다. 
      */}
      <section>
        <div className="max-w-7xl mx-auto">
          <NewsFeedSection />
        </div>
      </section>

      <footer className="py-20 text-center text-gray-400">
        <p>© 2026 골든데이즈. All rights reserved.</p>
      </footer>

      <ChatBot />
    </main>
  );
}