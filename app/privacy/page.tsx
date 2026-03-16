import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-3 px-5 mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-800 text-base sm:text-lg font-bold hover:bg-amber-100 hover:border-amber-300 transition-colors"
        >
          <span>←</span>
          홈으로
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 border-b-2 border-amber-400 pb-4 mb-8">
          개인정보처리방침
        </h1>

        <div className="space-y-8 text-base sm:text-lg text-slate-700 leading-relaxed">
          <p className="text-slate-600">
            골든데이즈(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 서비스 이용 시 수집·이용·보관·파기되는 개인정보에 관한 사항을 안내합니다.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              1. 수집하는 개인정보 항목
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>이메일 주소</strong>: 뉴스레터 구독 시 수집</li>
              <li><strong>서비스 이용 기록(쿠키)</strong>: 방문·이용 기록 등</li>
              <li><strong>기기 정보</strong>: 접속 기기 종류, OS 등 (자동 수집)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              2. 개인정보의 이용 목적
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>뉴스레터 발송 및 구독 관리</li>
              <li>서비스 품질 개선 및 안정적 운영</li>
              <li>사용자 문의 응대 및 불만 처리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              3. 보유 및 이용 기간
            </h2>
            <p>
              수집된 개인정보는 <strong>서비스 탈퇴 시</strong> 또는 <strong>수집·이용 목적 달성 후</strong> 지체 없이 파기합니다. 별도 법령에 따라 보존이 필요한 경우 해당 기간 동안만 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              4. 제3자 제공
            </h2>
            <p>
              원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 서비스 제공을 위해 <strong>Supabase, Vercel 등 인프라 서비스</strong>를 이용하는 과정에서 해당 업체의 서버에 저장·처리될 수 있으며, 이 경우 해당 업체의 개인정보 처리 방침이 적용됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              5. 개인정보 보호책임자
            </h2>
            <p>
              골든데이즈 개인정보 보호 관련 문의는 아래 담당자에게 연락해 주시기 바랍니다.
            </p>
            <ul className="mt-3 space-y-1">
              <li><strong>담당</strong>: 도성해</li>
              <li><strong>이메일</strong>: goldendays5080@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded" />
              6. 시행일
            </h2>
            <p>본 개인정보처리방침은 2026년 3월 12일부터 시행됩니다.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-5 bg-amber-500 text-white rounded-xl text-base font-bold hover:bg-amber-600 transition-colors"
          >
            <span>←</span>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
