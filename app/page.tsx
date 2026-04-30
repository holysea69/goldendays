import NewsFeedSection from "../components/NewsFeed";
import ChatBot from "../components/ChatBot";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 relative">
      <NewsFeedSection />

      <footer className="py-10 text-center bg-white border-t border-slate-200">
        {/* 문의하기 섹션 */}
        <div className="mb-6 pb-6 border-b border-slate-100">
          <h3 className="text-[16px] font-bold text-slate-700 mb-3">문의하기</h3>
          <p className="text-[14px] text-slate-500 mb-2">
            서비스 관련 문의 및 불편 사항은 이메일로 연락해 주세요.
          </p>
          <a
            href="mailto:goldendays5080@gmail.com"
            className="inline-flex items-center gap-2 text-emerald-600 font-bold text-[15px] hover:underline"
          >
            📧 goldendays5080@gmail.com
          </a>
          <p className="text-[13px] text-slate-400 mt-2">
            운영시간: 평일 09:00 ~ 18:00
          </p>
        </div>

        <p className="text-slate-400 font-medium text-[15px]">
          © 2026 골든데이즈. All rights reserved.
        </p>
        <p className="text-slate-400 text-[13px] mt-1 mb-3">
          본 앱은 정부 기관을 대표하지 않는 민간 서비스입니다.
        </p>
        <p className="text-slate-400 text-[13px] mb-3">
          뉴스 출처: 정책브리핑(korea.kr) 및 각 정부 부처 공식 보도자료
        </p>
        <Link
          href="/privacy"
          className="inline-block text-slate-400 text-[13px] hover:text-slate-600 hover:underline transition-colors"
        >
          개인정보처리방침
        </Link>
      </footer>

      <ChatBot />
    </main>
  );
}
