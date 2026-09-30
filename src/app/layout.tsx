import type { Metadata, Viewport } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { ProfileProvider } from "@/components/ProfileProvider";
import { FakeDataNotice, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: { default: "춘천 일자리 격차 진단", template: "%s · 춘천 일자리 격차 진단" },
  description:
    "춘천 청년과 지역기업 공고 사이, 직무·임금·근무조건·역량 중 어디가 어긋나는지 보여주는 포트폴리오 데모 (가상 데이터).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full">
      <body className="flex min-h-full flex-col">
        <ProfileProvider>
          <FakeDataNotice />
          <SiteHeader />
          {children}
          <SiteFooter />
        </ProfileProvider>
      </body>
    </html>
  );
}
