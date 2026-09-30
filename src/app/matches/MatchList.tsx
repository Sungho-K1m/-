"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NeedProfile, ProfileSummary } from "@/components/ProfileSummary";
import { useProfile } from "@/components/ProfileProvider";
import { MiniAxes } from "@/components/Score";
import { adjacency, jobs } from "@/lib/data";
import { rankJobs } from "@/lib/scoring";
import { JOB_FAMILIES, type JobFamily } from "@/lib/types";

type Filter = "전체" | JobFamily;

export default function MatchList() {
  const { profile } = useProfile();
  const [filter, setFilter] = useState<Filter>("전체");
  const ranked = useMemo(() => (profile ? rankJobs(jobs, profile, adjacency) : []), [profile]);

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16">
        <h1 className="text-2xl font-bold tracking-tight">매칭 결과</h1>
        <div className="mt-6">
          <NeedProfile />
        </div>
      </main>
    );
  }

  const visible = filter === "전체" ? ranked : ranked.filter(({ job }) => job.jobFamily === filter);
  const filters: Filter[] = ["전체", ...JOB_FAMILIES];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16">
      <h1 className="text-2xl font-bold tracking-tight">매칭 결과</h1>
      <p className="mt-1 text-sm text-ink-soft">공고 {ranked.length}개를 종합 일치도가 높은 순으로 보여드려요.</p>

      <div className="mt-5">
        <ProfileSummary profile={profile} />
      </div>

      <fieldset className="mt-6">
        <legend className="sr-only">직무 필터</legend>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const count = f === "전체" ? ranked.length : ranked.filter(({ job }) => job.jobFamily === f).length;
            return (
              <label key={f} className="chip min-h-10 px-3.5 text-sm">
                <input
                  type="radio"
                  name="family-filter"
                  className="sr-only"
                  checked={filter === f}
                  onChange={() => setFilter(f)}
                />
                {f} <span className="ml-1 tabular-nums opacity-70">{count}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <ul className="mt-4 grid gap-3" aria-live="polite">
        {visible.map(({ job, report }) => (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className="card block p-4 transition-colors hover:border-brand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink-faint">{job.company}</p>
                  <h2 className="mt-0.5 font-semibold leading-snug">{job.title}</h2>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
                    <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-[13px] font-medium text-brand">
                      {job.jobFamily}
                    </span>
                    <span className="tabular-nums">
                      월 {job.salaryMin}~{job.salaryMax}만원
                    </span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[26px] leading-none font-bold tabular-nums">
                    {report.overall}
                    <span className="text-base font-semibold">%</span>
                  </p>
                  <p className="mt-1 text-[12px] text-ink-faint">종합 일치도</p>
                </div>
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <MiniAxes report={report} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
