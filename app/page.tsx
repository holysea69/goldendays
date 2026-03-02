import NewsFeed from "@/components/NewsFeed";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#faf8f3",
      }}
    >
      {/* 왼쪽 패널 — 정보 피드 (2/3) */}
      <div
        style={{
          flex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#faf8f3",
          borderRight: "3px solid #e0d9cf",
        }}
      >
        <NewsFeed />
      </div>

      {/* 오른쪽 패널 — 챗봇 상담창 (1/3) */}
      <div
        style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <ChatBot />
      </div>
    </main>
  );
}
