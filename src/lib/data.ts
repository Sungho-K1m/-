import jobsJson from "../../data/jobs.json";
import benefitsJson from "../../data/benefits.json";
import adjacencyJson from "../../data/adjacency.json";
import type { Adjacency, Benefit, Job } from "./types";

export const jobs = jobsJson as Job[];
export const benefits = benefitsJson as Benefit[];
export const adjacency = adjacencyJson as Adjacency;

export function getJob(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

/** 온보딩 ④단계의 역량 태그. 공고에 실제로 등장하는 역량만 보여준다. */
export const allSkills = [...new Set(jobs.flatMap((job) => job.requiredSkills))].sort((a, b) =>
  a.localeCompare(b, "ko"),
);
