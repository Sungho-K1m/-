export const JOB_FAMILIES = ["생산", "영업", "사무", "마케팅", "IT"] as const;
export type JobFamily = (typeof JOB_FAMILIES)[number];

export const AXES = ["job", "salary", "conditions", "skills"] as const;
export type Axis = (typeof AXES)[number];

export interface Job {
  id: string;
  company: string;
  jobFamily: JobFamily;
  title: string;
  /** 만원/월 */
  salaryMin: number;
  /** 만원/월 */
  salaryMax: number;
  shift: boolean;
  commuteMinFromCampus: number;
  weekendWork: boolean;
  requiredSkills: string[];
  benefitIds: string[];
  /** 축별 미리 작성한 설명. 숫자는 {salaryMin} {salaryMax} {commute} 자리표시자로만 쓴다. */
  explanations: Record<Axis, string>;
}

export interface Benefit {
  id: string;
  name: string;
  /** 만원/월 */
  monthlyValue: number;
}

/** 희망 직무 → 인접 직무 → 공통 업무 */
export type Adjacency = Record<string, Record<string, string[]>>;

/** 브라우저 메모리에만 존재한다. 서버로 보내거나 저장하지 않는다. */
export interface YouthProfile {
  desiredFamilies: JobFamily[];
  minSalary: number;
  canShift: boolean;
  canWeekend: boolean;
  maxCommuteMin: number;
  skills: string[];
}
