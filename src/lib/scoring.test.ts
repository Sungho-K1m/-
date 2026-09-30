import { describe, expect, it } from "vitest";
import { adjacency, benefits, getJob, jobs } from "./data";
import { DEFAULT_PROFILE } from "./profile";
import {
  analyzeJob,
  badgeFor,
  effectivePay,
  fillExplanation,
  rankJobs,
  scoreConditions,
  scoreJobFamily,
  scoreSalary,
  scoreSkills,
} from "./scoring";
import type { Job, YouthProfile } from "./types";

const baseJob: Job = {
  id: "T-1",
  company: "테스트(가상)",
  jobFamily: "영업",
  title: "테스트 공고",
  salaryMin: 200,
  salaryMax: 240,
  shift: false,
  commuteMinFromCampus: 20,
  weekendWork: false,
  requiredSkills: [],
  benefitIds: [],
  explanations: { job: "", salary: "", conditions: "", skills: "" },
};
const job = (overrides: Partial<Job>): Job => ({ ...baseJob, ...overrides });
const profile = (overrides: Partial<YouthProfile>): YouthProfile => ({ ...DEFAULT_PROFILE, ...overrides });

describe("직무 축", () => {
  it("희망 직무와 같으면 100", () => {
    expect(scoreJobFamily(job({}), profile({ desiredFamilies: ["영업"] }), adjacency).score).toBe(100);
  });
  it("인접 직무면 60이고 공통 업무를 돌려준다", () => {
    const result = scoreJobFamily(job({}), profile({ desiredFamilies: ["마케팅"] }), adjacency);
    expect(result).toMatchObject({ score: 60, relation: "adjacent", nearFamily: "마케팅" });
    expect(result.commonTasks.length).toBeGreaterThan(0);
  });
  it("그 외는 20", () => {
    expect(scoreJobFamily(job({}), profile({ desiredFamilies: ["IT"] }), adjacency).score).toBe(20);
  });
  it("희망 직무가 두 개면 더 가까운 쪽을 쓴다", () => {
    const result = scoreJobFamily(job({}), profile({ desiredFamilies: ["IT", "영업"] }), adjacency);
    expect(result.score).toBe(100);
  });
});

describe("임금 축", () => {
  it("최대 월급이 희망 이상이면 100", () => {
    expect(scoreSalary(job({ salaryMax: 250 }), profile({ minSalary: 250 }))).toEqual({ score: 100, shortfall: 0 });
  });
  it("gap × 400 만큼 깎는다: 250 희망, 최대 240 → 84", () => {
    expect(scoreSalary(job({ salaryMax: 240 }), profile({ minSalary: 250 }))).toEqual({ score: 84, shortfall: 10 });
  });
  it("0 아래로 내려가지 않는다", () => {
    expect(scoreSalary(job({ salaryMax: 200 }), profile({ minSalary: 400 })).score).toBe(0);
  });
});

describe("근무조건 축", () => {
  it("불일치가 없으면 100", () => {
    expect(scoreConditions(job({}), profile({})).score).toBe(100);
  });
  it("불일치 1개당 35씩 깎는다", () => {
    const one = scoreConditions(job({ shift: true }), profile({ canShift: false }));
    expect(one.score).toBe(65);
    const two = scoreConditions(job({ shift: true, weekendWork: true }), profile({}));
    expect(two.score).toBe(30);
  });
  it("세 개 모두 어긋나면 0 (최저 0)", () => {
    const result = scoreConditions(
      job({ shift: true, weekendWork: true, commuteMinFromCampus: 50 }),
      profile({ maxCommuteMin: 30 }),
    );
    expect(result.score).toBe(0);
    expect(result.mismatches).toContainEqual({ kind: "commute", overMin: 20 });
  });
  it("가능하다고 답한 조건은 불일치가 아니다", () => {
    expect(scoreConditions(job({ shift: true, weekendWork: true }), profile({ canShift: true, canWeekend: true })).score).toBe(100);
  });
  it("통근 시간이 딱 한도면 초과가 아니다", () => {
    expect(scoreConditions(job({ commuteMinFromCampus: 40 }), profile({ maxCommuteMin: 40 })).score).toBe(100);
  });
});

describe("역량 축", () => {
  it("요구 역량이 없으면 100", () => {
    expect(scoreSkills(job({ requiredSkills: [] }), profile({})).score).toBe(100);
  });
  it("보유 비율 × 100, 부족 역량 목록을 돌려준다", () => {
    const result = scoreSkills(job({ requiredSkills: ["엑셀", "영어 회화"] }), profile({ skills: ["엑셀"] }));
    expect(result).toEqual({ score: 50, owned: ["엑셀"], missing: ["영어 회화"] });
  });
});

describe("상태 배지", () => {
  it("80 이상 일치, 50~79 보통, 50 미만 큰 격차", () => {
    expect(badgeFor(80)).toBe("match");
    expect(badgeFor(79)).toBe("mid");
    expect(badgeFor(50)).toBe("mid");
    expect(badgeFor(49)).toBe("gap");
  });
});

describe("종합 일치도", () => {
  it("가중 평균: 직무 35 · 임금 30 · 근무조건 20 · 역량 15", () => {
    // 직무 60, 임금 84, 근무조건 100, 역량 0 → 21 + 25.2 + 20 + 0 = 66.2
    const report = analyzeJob(
      job({ requiredSkills: ["영어 회화"] }),
      profile({ desiredFamilies: ["마케팅"], minSalary: 250 }),
      adjacency,
    );
    expect(report.overall).toBe(66);
  });
});

describe("실질 보상", () => {
  it("최대 월급에 연결된 혜택을 더한다", () => {
    const result = effectivePay(job({ salaryMax: 240, benefitIds: ["B-01"] }), benefits);
    expect(result.total).toBe(260);
    expect(result.benefits.map((b) => b.id)).toEqual(["B-01"]);
  });
});

describe("설명 문장 자리표시자", () => {
  it("공고 데이터 값으로 채운다", () => {
    const text = fillExplanation("월 {salaryMin}~{salaryMax}만원, 약 {commute}분", job({}));
    expect(text).toBe("월 200~240만원, 약 20분");
  });
});

// ── SPEC 10장 검증 시나리오 ────────────────────────────────────────────

describe("청년 A — 마케팅, 최소 250, 교대·주말 불가, 역량 SNS 운영", () => {
  const youthA = profile({ desiredFamilies: ["마케팅"], minSalary: 250, canShift: false, canWeekend: false, skills: ["SNS 운영"] });
  const ranked = rankJobs(jobs, youthA, adjacency);

  it("J-001이 1위이고 4축 모두 일치", () => {
    const top = ranked[0];
    expect(top.job.id).toBe("J-001");
    for (const axis of ["job", "salary", "conditions", "skills"] as const) {
      expect(badgeFor(top.report[axis].score)).toBe("match");
    }
  });
  it("J-001이 단독 1위다 (동점 정렬에 기대지 않는다)", () => {
    expect(ranked[0].report.overall).toBeGreaterThan(ranked[1].report.overall);
  });
  it("J-002는 근무조건 큰 격차", () => {
    const j2 = ranked.find((r) => r.job.id === "J-002")!;
    expect(badgeFor(j2.report.conditions.score)).toBe("gap");
  });
});

describe("청년 B — 마케팅, 최소 250, 교대 불가, 역량 없음", () => {
  const youthB = profile({ desiredFamilies: ["마케팅"], minSalary: 250, canShift: false, skills: [] });
  const j3 = getJob("J-003")!;
  const report = analyzeJob(j3, youthB, adjacency);

  it("J-003 직무 축은 인접 직무 60점", () => {
    expect(report.job).toMatchObject({ score: 60, relation: "adjacent" });
  });
  it("J-003은 임금 격차가 있고 실질 보상은 240 + 20 = 260", () => {
    expect(report.salary.shortfall).toBeGreaterThan(0);
    const pay = effectivePay(j3, benefits);
    expect(pay.base).toBe(240);
    expect(pay.benefits.map((b) => b.monthlyValue)).toEqual([20]);
    expect(pay.total).toBe(260);
  });
  it("J-003 부족 역량은 영어 회화", () => {
    expect(report.skills.missing).toEqual(["영어 회화"]);
  });
});

describe("청년 C — IT, 최소 350", () => {
  const youthC = profile({ desiredFamilies: ["IT"], minSalary: 350 });
  const ranked = rankJobs(jobs, youthC, adjacency);

  it("리스트가 비지 않는다", () => {
    expect(ranked).toHaveLength(jobs.length);
  });
  it("모든 공고의 임금 축이 보통 이하", () => {
    for (const { report } of ranked) {
      expect(badgeFor(report.salary.score)).not.toBe("match");
    }
  });
});
