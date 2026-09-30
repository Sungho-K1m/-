import Link from "next/link";

/** 모든 화면 맨 위에 붙는 가상 데이터 고지 (SPEC 10-6) */
export function FakeDataNotice() {
  return (
    <div role="note" aria-label="가상 데이터 고지" className="bg-notice-soft text-[13px] leading-snug text-notice">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2">
        <span className="shrink-0 rounded-md bg-notice/10 px-1.5 py-0.5 font-semibold">가상 데이터</span>
        <p className="min-w-0">
          모든 기업·공고·지원사업은 실제가 아닌 예시예요.{" "}
          <Link href="/about-data" className="font-semibold underline underline-offset-2">
            자세히
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-[15px] font-bold tracking-tight">
          춘천 일자리 격차 진단
        </Link>
        <nav aria-label="주요 메뉴" className="flex shrink-0 gap-4 text-sm text-ink-soft">
          <Link href="/matches" className="hover:text-ink">
            매칭 결과
          </Link>
          <Link href="/about-data" className="hover:text-ink">
            데이터 안내
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-2xl px-4 py-6 text-[13px] leading-relaxed text-ink-faint">
        개인 포트폴리오용 데모예요. 실제 채용 서비스가 아니며, 입력한 조건은 이 브라우저 탭의 메모리에만
        있다가 새로고침하면 사라져요.
      </div>
    </footer>
  );
}
