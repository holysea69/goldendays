import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "골든데이즈 - 시니어 전용 복지·건강·재테크 플랫폼",
  description:
    "어르신들을 위한 맞춤형 복지, 건강, 재테크 정보와 AI 상담 서비스를 제공하는 골든데이즈입니다.",
  keywords: ["시니어", "골든데이즈", "복지", "건강", "재테크", "노인복지"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className={notoSansKR.className}>{children}</body>
    </html>
  );
}
