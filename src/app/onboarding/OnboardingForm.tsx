"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import { allSkills } from "@/lib/data";
import { COMMUTE_OPTIONS, DEFAULT_PROFILE, MAX_DESIRED_FAMILIES, SALARY_RANGE } from "@/lib/profile";
import { JOB_FAMILIES, type JobFamily, type YouthProfile } from "@/lib/types";

const STEPS = [
  { title: "희망 직무를 골라 주세요", hint: `최대 ${MAX_DESIRED_FAMILIES}개까지 고를 수 있어요.` },
  { title: "최소 희망 월급은 얼마인가요?", hint: "세전 월급 기준이에요." },
  { title: "근무조건을 알려 주세요", hint: "통근 시간은 대학가에서 출발하는 기준이에요." },
  { title: "가진 역량을 골라 주세요", hint: "없다면 고르지 않고 넘어가도 돼요." },
];

export default function OnboardingForm() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();
  const [draft, setDraft] = useState<YouthProfile>(profile ?? DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // 단계가 바뀌면 새 질문으로 초점을 옮긴다 (스크린리더가 바뀐 내용을 읽도록).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const update = (patch: Partial<YouthProfile>) => setDraft((current) => ({ ...current, ...patch }));

  const toggleFamily = (family: JobFamily) =>
    update({
      desiredFamilies: draft.desiredFamilies.includes(family)
        ? draft.desiredFamilies.filter((f) => f !== family)
        : [...draft.desiredFamilies, family],
    });

  const toggleSkill = (skill: string) =>
    update({
      skills: draft.skills.includes(skill) ? draft.skills.filter((s) => s !== skill) : [...draft.skills, skill],
    });

  const canProceed = step !== 0 || draft.desiredFamilies.length > 0;
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (!isLast) return setStep(step + 1);
    setProfile(draft);
    router.push("/matches");
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-8 pb-16">
      <div className="flex items-center justify-between text-sm text-ink-faint">
        <span>내 조건 입력</span>
        <span className="tabular-nums" aria-label={`${STEPS.length}단계 중 ${step + 1}단계`}>
          {step + 1} / {STEPS.length}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-track"}`} />
        ))}
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-bold tracking-tight outline-none">
        {STEPS[step].title}
      </h1>
      <p className="mt-2 text-ink-soft">{STEPS[step].hint}</p>

      <div className="mt-6">
        {step === 0 && (
          <fieldset>
            <legend className="sr-only">희망 직무 (최대 {MAX_DESIRED_FAMILIES}개)</legend>
            <div className="flex flex-wrap gap-2">
              {JOB_FAMILIES.map((family) => {
                const checked = draft.desiredFamilies.includes(family);
                const full = draft.desiredFamilies.length >= MAX_DESIRED_FAMILIES;
                return (
                  <label key={family} className="chip">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggleFamily(family)}
                    />
                    {family}
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-ink-faint" aria-live="polite">
              {draft.desiredFamilies.length}/{MAX_DESIRED_FAMILIES}개 선택
            </p>
          </fieldset>
        )}

        {step === 1 && (
          <div className="card p-5">
            <label htmlFor="min-salary" className="text-sm text-ink-soft">
              최소 희망 월급
            </label>
            <p className="mt-1 text-4xl font-bold tabular-nums">
              {draft.minSalary}
              <span className="ml-1 text-xl font-semibold">만원</span>
            </p>
            <input
              id="min-salary"
              type="range"
              min={SALARY_RANGE.min}
              max={SALARY_RANGE.max}
              step={SALARY_RANGE.step}
              value={draft.minSalary}
              onChange={(e) => update({ minSalary: Number(e.target.value) })}
              aria-valuetext={`${draft.minSalary}만원`}
              className="mt-5 h-8 w-full accent-brand"
            />
            <div className="flex justify-between text-[13px] text-ink-faint tabular-nums" aria-hidden="true">
              <span>{SALARY_RANGE.min}만원</span>
              <span>{SALARY_RANGE.max}만원</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <YesNo
              legend="교대근무"
              value={draft.canShift}
              onChange={(canShift) => update({ canShift })}
            />
            <YesNo
              legend="주말 근무"
              value={draft.canWeekend}
              onChange={(canWeekend) => update({ canWeekend })}
            />
            <fieldset>
              <legend className="font-semibold">최대 통근 시간</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMUTE_OPTIONS.map((minutes) => (
                  <label key={minutes} className="chip">
                    <input
                      type="radio"
                      name="commute"
                      className="sr-only"
                      checked={draft.maxCommuteMin === minutes}
                      onChange={() => update({ maxCommuteMin: minutes })}
                    />
                    {minutes}분 이내
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="sr-only">보유 역량</legend>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <label key={skill} className="chip">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={draft.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-faint" aria-live="polite">
              {draft.skills.length}개 선택
            </p>
          </fieldset>
        )}
      </div>

      <div className="mt-10 flex gap-2">
        {step > 0 && (
          <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
            이전
          </button>
        )}
        <button type="button" className="btn-primary flex-1" disabled={!canProceed} onClick={next}>
          {isLast ? "결과 보기" : "다음"}
        </button>
      </div>
      {!canProceed && <p className="mt-3 text-sm text-ink-faint">희망 직무를 하나 이상 골라 주세요.</p>}
    </main>
  );
}

function YesNo({ legend, value, onChange }: { legend: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <fieldset>
      <legend className="font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          { label: "가능", v: true },
          { label: "불가", v: false },
        ].map(({ label, v }) => (
          <label key={label} className="chip">
            <input type="radio" name={legend} className="sr-only" checked={value === v} onChange={() => onChange(v)} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
