import type { Metadata } from "next";
import { benefits, jobs } from "@/lib/data";
import {
  AXIS_LABEL,
  BADGE_THRESHOLD,
  CONDITION_PENALTY,
  JOB_FAMILY_SCORE,
  SALARY_GAP_MULTIPLIER,
  WEIGHTS,
} from "@/lib/scoring";
import { AXES, JOB_FAMILIES, type Axis } from "@/lib/types";

export const metadata: Metadata = { title: "데이터 안내" };

const RULE: Record<Axis, string> = {
  job: `희망 직무와 같으면 ${JOB_FAMILY_SCORE.same}, 가까운 직무면 ${JOB_FAMILY_SCORE.adjacent}, 그 외는 ${JOB_FAMILY_SCORE.other}`,
  salary: `최대 월급이 희망 이상이면 100. 모자라면 모자란 비율 × ${SALARY_GAP_MULTIPLIER}만큼 감점`,
  conditions: `교대·주말·통근 시간 중 어긋나는 항목 하나당 −${CONDITION_PENALTY}`,
  skills: "요구 역량 중 가진 비율 × 100 (요구 역량이 없으면 100)",
};

export default function AboutDataPage() {
  const companyCount = new Set(jobs.map((job) => job.company)).size;
  const familyCounts = JOB_FAMILIES.map((family) => ({
    family,
    count: jobs.filter((job) => job.jobFamily === family).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...familyCounts.map((f) => f.count));
  const lowestPay = Math.min(...jobs.map((job) => job.salaryMin));
  const highestPay = Math.max(...jobs.map((job) => job.salaryMax));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16">
      <h1 className="text-2xl font-bold tracking-tight">데이터 안내</h1>

      <div className="mt-5 rounded-2xl border border-notice/20 bg-notice-soft p-4 leading-relaxed text-notice">
        <p className="font-semibold">이 앱의 모든 기업·공고·지원사업은 가상 데이터예요.</p>
        <p className="mt-1 text-[15px]">
          포트폴리오를 위해 지어낸 데이터로, 실제 채용 정보가 아니에요. 실존 기업명과 상표는 쓰지 않았고, 모든 기업명과
          지원사업명 뒤에 &lsquo;(가상)&rsquo;을 붙였어요.
        </p>
      </div>

      <Section title="데이터 구성">
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "공고", value: `${jobs.length}개` },
            { label: "가상 기업", value: `${companyCount}곳` },
            { label: "지원 혜택", value: `${benefits.length}개` },
          ].map(({ label, value }) => (
            <div key={label} className="card p-3">
              <dt className="text-[13px] text-ink-faint">{label}</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="card mt-3 p-4">
          <h3 className="text-sm font-semibold text-ink-faint">직무별 공고 수</h3>
          <ul className="mt-3 grid gap-2">
            {familyCounts.map(({ family, count }) => (
              <li key={family} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3 text-[15px]">
                <span>{family}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(count / maxCount) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] text-ink-soft">
            월급 범위는 월 <span className="tabular-nums">{lowestPay}~{highestPay}</span>만원이에요.
          </p>
        </div>
      </Section>

      <Section title="설계 의도">
        <ul className="card grid gap-3 p-4 text-[15px] leading-relaxed">
          <li>
            <b className="font-semibold">지역 일자리 구조를 반영했어요.</b> 춘천 지역 공고는 생산·영업(수출 영업 포함)이 많고
            IT·마케팅이 적다는 문제 정의에 맞춰 공고 수를 나눴어요.
          </li>
          <li>
            <b className="font-semibold">월급은 청년 희망보다 낮게 분포시켰어요.</b> 임금 격차가 실제로 드러나야 &lsquo;지원 혜택을
            더한 실질 보상&rsquo;이 의미가 있기 때문이에요.
          </li>
          <li>
            <b className="font-semibold">숫자는 모두 계산값이에요.</b> 공고마다 설명 문장을 미리 써 두었지만, 문장 속 숫자는
            공고 데이터와 점수 산식에서 채워 넣어요. 실시간 AI 호출은 없어요.
          </li>
        </ul>
      </Section>

      <Section title="격차 점수 계산 방식">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-[15px]">
            <thead className="text-[13px] text-ink-faint">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-2.5 font-medium">
                  축
                </th>
                <th scope="col" className="px-2 py-2.5 font-medium">
                  비중
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  계산
                </th>
              </tr>
            </thead>
            <tbody>
              {AXES.map((axis) => (
                <tr key={axis} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-3 align-top font-semibold whitespace-nowrap">
                    {AXIS_LABEL[axis]}
                  </th>
                  <td className="px-2 py-3 align-top tabular-nums">{Math.round(WEIGHTS[axis] * 100)}%</td>
                  <td className="px-4 py-3 leading-relaxed text-ink-soft">{RULE[axis]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          각 축은 0~100점이고, 종합 일치도는 비중을 곱한 가중 평균이에요. {BADGE_THRESHOLD.match}점 이상은
          &lsquo;일치&rsquo;, {BADGE_THRESHOLD.mid}~{BADGE_THRESHOLD.match - 1}점은 &lsquo;보통&rsquo;,{" "}
          {BADGE_THRESHOLD.mid}점 미만은 &lsquo;큰 격차&rsquo;로 표시해요.
        </p>
      </Section>

      <Section title="지원 혜택 (가상)">
        <ul className="card divide-y divide-line">
          {benefits.map((benefit) => (
            <li key={benefit.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
              <span>{benefit.name}</span>
              <span className="shrink-0 text-ink-soft tabular-nums">월 {benefit.monthlyValue}만원</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          실질 보상은 공고의 최대 월급에 그 공고와 연결된 혜택의 월 환산액을 더한 값이에요.
        </p>
      </Section>

      <Section title="입력한 조건은 어디에 남나요?">
        <p className="card p-4 text-[15px] leading-relaxed">
          어디에도 남지 않아요. 입력한 조건은 지금 열려 있는 브라우저 탭의 메모리에만 있고, 서버로 보내거나 기기에 저장하지
          않아요. 새로고침하거나 탭을 닫으면 사라져요.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
