import type { YouthProfile } from "./types";

export const MAX_DESIRED_FAMILIES = 2;
export const SALARY_RANGE = { min: 150, max: 400, step: 10 } as const;
export const COMMUTE_OPTIONS = [20, 30, 40, 60] as const;

/** 온보딩 첫 화면의 기본값. 시나리오에서 언급되지 않은 항목도 이 값을 따른다. */
export const DEFAULT_PROFILE: YouthProfile = {
  desiredFamilies: [],
  minSalary: 250,
  canShift: false,
  canWeekend: false,
  maxCommuteMin: 40,
  skills: [],
};
