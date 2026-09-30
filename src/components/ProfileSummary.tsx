import Link from "next/link";
import type { YouthProfile } from "@/lib/types";

export function ProfileSummary({ profile }: { profile: YouthProfile }) {
  const items = [
    `희망 ${profile.desiredFamilies.join("·")}`,
    `최소 ${profile.minSalary}만원`,
    `교대 ${profile.canShift ? "가능" : "불가"}`,
    `주말 ${profile.canWeekend ? "가능" : "불가"}`,
    `통근 ${profile.maxCommuteMin}분 이내`,
    profile.skills.length ? `역량 ${profile.skills.join(", ")}` : "역량 선택 없음",
  ];
  return (
    <div className="card flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink-faint">내 조건</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5 text-[13px]">
          {items.map((item) => (
            <li key={item} className="rounded-md bg-canvas px-2 py-1">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Link href="/onboarding" className="shrink-0 py-1 text-sm font-semibold text-brand underline-offset-2 hover:underline">
        조건 수정
      </Link>
    </div>
  );
}

/** 조건을 아직 입력하지 않았거나, 새로고침으로 메모리가 비었을 때 */
export function NeedProfile({ children }: { children?: React.ReactNode }) {
  return (
    <div className="card p-6 text-center">
      <p className="font-semibold">아직 입력한 조건이 없어요</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {children ?? "조건을 입력하면 공고마다 어디서 어긋나는지 보여드려요."} 입력한 조건은 저장하지 않아서,
        새로고침하면 다시 입력해야 해요.
      </p>
      <Link href="/onboarding" className="btn-primary mt-5">
        내 조건 입력하기
      </Link>
    </div>
  );
}
