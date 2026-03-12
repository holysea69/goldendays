import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "골든데이즈 - 시니어 전용 복지·건강·재테크 플랫폼",
  description:
    "시니어를 위한 맞춤형 복지, 건강, 재테크 정보와 AI 상담 서비스를 제공하는 골든데이즈입니다.",
  keywords: ["시니어", "골든데이즈", "복지", "건강", "재테크", "노인복지"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 폰트(notoSansKR) 적용 코드를 모두 제거한 순수한 HTML입니다.
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}