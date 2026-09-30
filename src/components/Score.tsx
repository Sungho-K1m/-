import { AXIS_LABEL, BADGE_LABEL, BADGE_THRESHOLD, badgeFor, type Badge, type GapReport } from "@/lib/scoring";
import { AXES, type Axis } from "@/lib/types";

const BADGE_STYLE: Record<Badge, string> = {
  match: "bg-match-soft text-match",
  mid: "bg-mid-soft text-mid",
  gap: "bg-gap-soft text-gap",
};

const BAR_STYLE: Record<Badge, string> = {
  match: "bg-match-bar",
  mid: "bg-mid-bar",
  gap: "bg-gap-bar",
};

export function StatusBadge({ score }: { score: number }) {
  const badge = badgeFor(score);
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[13px] font-semibold ${BADGE_STYLE[badge]}`}>
      {BADGE_LABEL[badge]}
    </span>
  );
}

/** S4의 4축 막대그래프 한 줄. 옅은 눈금은 배지 경계(보통·일치)를 뜻한다. */
export function ScoreBar({ axis, score }: { axis: Axis; score: number }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
      <span className="text-[15px] font-medium">{AXIS_LABEL[axis]}</span>
      <div className="relative h-3 overflow-hidden rounded-full bg-track" aria-hidden="true">
        <div className={`h-full rounded-full ${BAR_STYLE[badgeFor(score)]}`} style={{ width: `${score}%` }} />
        <span className="absolute inset-y-0 w-px bg-surface" style={{ left: `${BADGE_THRESHOLD.mid}%` }} />
        <span className="absolute inset-y-0 w-px bg-surface" style={{ left: `${BADGE_THRESHOLD.match}%` }} />
      </div>
      <span className="flex w-[6.5rem] items-center justify-end gap-2">
        <span className="text-[15px] font-semibold tabular-nums">{score}</span>
        <StatusBadge score={score} />
      </span>
    </div>
  );
}

/** S3 카드 아래의 작은 4축 요약 */
export function MiniAxes({ report }: { report: GapReport }) {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {AXES.map((axis) => {
        const score = report[axis].score;
        const badge = badgeFor(score);
        return (
          <li key={axis}>
            <span className="sr-only">
              {AXIS_LABEL[axis]} {score}점 {BADGE_LABEL[badge]}
            </span>
            <span aria-hidden="true" className="flex items-baseline justify-between text-[12px] text-ink-faint">
              <span>{AXIS_LABEL[axis]}</span>
              <span className="tabular-nums">{score}</span>
            </span>
            <span aria-hidden="true" className="mt-1 block h-1.5 overflow-hidden rounded-full bg-track">
              <span className={`block h-full rounded-full ${BAR_STYLE[badge]}`} style={{ width: `${score}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
