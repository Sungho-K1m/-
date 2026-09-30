import Link from "next/link";
import { benefits, jobs } from "@/lib/data";
import { AXIS_LABEL, WEIGHTS } from "@/lib/scoring";
import { AXES, type Axis } from "@/lib/types";

const AXIS_HINT: Record<Axis, string> = {
  job: "희망 직무와 같은지, 가까운 직무인지",
  salary: "희망 월급과 공고 최대 월급의 차이",
  conditions: "교대·주말 근무, 대학가에서의 통근 시간",
  skills: "공고가 요구하는 역량 중 가진 것",
};

export default function Home() {
  const companyCount = new Set(jobs.map((job) => job.company)).size;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-16">
      <p className="text-sm font-semibold text-brand">춘천 청년 × 지역기업</p>
      <h1 className="mt-3 text-[28px] leading-[1.3] font-bold tracking-tight text-balance sm:text-4xl">
        내 조건과 지역 공고, 어디서 어긋나는지 보여드려요
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
        직무·임금·근무조건·역량 네 가지로 격차를 재고, 좁힐 방법까지 알려드려요.
      </p>
      <Link href="/onboarding" className="btn-primary mt-8 w-full sm:w-auto">
        내 조건 입력하기
      </Link>

      <section aria-labelledby="axes-title" className="mt-12">
        <h2 id="axes-title" className="text-sm font-semibold text-ink-faint">
          이렇게 비교해요
        </h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {AXES.map((axis) => (
            <li key={axis} className="card flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{AXIS_LABEL[axis]}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{AXIS_HINT[axis]}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-brand tabular-nums">
                {Math.round(WEIGHTS[axis] * 100)}%
              </span>
            </li>
          ))}
        </ol>
      </section>

      <aside className="mt-8 rounded-2xl border border-notice/20 bg-notice-soft p-4 text-[15px] leading-relaxed text-notice">
        <p className="font-semibold">가상 데이터로 만든 데모예요</p>
        <p className="mt-1">
          기업 {companyCount}곳, 공고 {jobs.length}개, 지원사업 {benefits.length}개는 모두 설명을 위해 지어낸 데이터예요.
          실제 채용 정보가 아니며 실존 기업과 관계없어요.
        </p>
      </aside>
    </main>
  );
}
