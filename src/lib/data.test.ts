import { describe, expect, it } from "vitest";
import { adjacency, benefits, getJob, jobs } from "./data";
import { TEMPLATE_KEYS } from "./scoring";
import { AXES, JOB_FAMILIES } from "./types";

// SPEC 8장 가상 데이터 요구사항. data/*.json을 손으로 고친 뒤 규칙이 깨지지 않았는지 확인한다.

describe("가상 데이터 규칙", () => {
  it("공고 30개, 가상 기업 15곳", () => {
    expect(jobs).toHaveLength(30);
    expect(new Set(jobs.map((j) => j.company)).size).toBe(15);
  });

  it("공고 id가 겹치지 않는다", () => {
    expect(new Set(jobs.map((j) => j.id)).size).toBe(jobs.length);
  });

  it("기업명과 혜택명은 모두 (가상)으로 끝난다", () => {
    for (const j of jobs) expect(j.company).toMatch(/\(가상\)$/);
    for (const b of benefits) expect(b.name).toMatch(/\(가상\)$/);
  });

  it("직무 분포: 생산 10, 영업 8, 사무 5, 마케팅 4, IT 3", () => {
    const count = (family: string) => jobs.filter((j) => j.jobFamily === family).length;
    expect({ 생산: count("생산"), 영업: count("영업"), 사무: count("사무"), 마케팅: count("마케팅"), IT: count("IT") }).toEqual({
      생산: 10,
      영업: 8,
      사무: 5,
      마케팅: 4,
      IT: 3,
    });
  });

  it("월급은 200~300만원 안이고 최소 ≤ 최대", () => {
    for (const j of jobs) {
      expect(j.salaryMin).toBeGreaterThanOrEqual(200);
      expect(j.salaryMax).toBeLessThanOrEqual(300);
      expect(j.salaryMin).toBeLessThanOrEqual(j.salaryMax);
    }
  });

  it("직무는 정해진 5개 중 하나이고, 혜택 id는 모두 존재한다", () => {
    const benefitIds = new Set(benefits.map((b) => b.id));
    for (const j of jobs) {
      expect(JOB_FAMILIES).toContain(j.jobFamily);
      for (const id of j.benefitIds) expect(benefitIds).toContain(id);
    }
  });

  it("인접 직무 표는 정해진 직무 이름만 쓴다", () => {
    for (const [from, targets] of Object.entries(adjacency)) {
      expect(JOB_FAMILIES).toContain(from);
      for (const to of Object.keys(targets)) expect(JOB_FAMILIES).toContain(to);
    }
  });

  it("설명 문장은 4축 모두 있고, 숫자를 직접 쓰지 않는다 (자리표시자만)", () => {
    for (const j of jobs) {
      for (const axis of AXES) {
        const text = j.explanations[axis];
        expect(text, `${j.id}.${axis}`).toBeTruthy();
        const placeholders = [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
        for (const key of placeholders) expect(TEMPLATE_KEYS).toContain(key);
        expect(text.replace(/\{\w+\}/g, ""), `${j.id}.${axis}`).not.toMatch(/[0-9０-９]/);
      }
    }
  });
});

describe("검증용 공고 (SPEC 8장)", () => {
  it("J-001: 마케팅, 월 260~300, 교대·주말 없음, 역량 SNS 운영", () => {
    expect(getJob("J-001")).toMatchObject({
      jobFamily: "마케팅",
      salaryMin: 260,
      salaryMax: 300,
      shift: false,
      weekendWork: false,
      requiredSkills: ["SNS 운영"],
    });
  });
  it("J-002: 생산, 월 230~250, 교대·주말 있음", () => {
    expect(getJob("J-002")).toMatchObject({ jobFamily: "생산", salaryMin: 230, salaryMax: 250, shift: true, weekendWork: true });
  });
  it("J-003: 영업(수출 영업), 월 220~240, 교대 없음, 역량 영어 회화, 혜택 B-01", () => {
    const j3 = getJob("J-003")!;
    expect(j3).toMatchObject({ jobFamily: "영업", salaryMin: 220, salaryMax: 240, shift: false, requiredSkills: ["영어 회화"] });
    expect(j3.title).toContain("수출 영업");
    expect(j3.benefitIds).toContain("B-01");
  });
});
