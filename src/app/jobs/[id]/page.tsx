import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJob, jobs } from "@/lib/data";
import JobReport from "./JobReport";

// 정적 내보내기: 공고 30개의 페이지를 빌드할 때 모두 만든다.
export const dynamicParams = false;

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export async function generateMetadata(props: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const job = getJob(id);
  return { title: job ? `${job.title} — ${job.company}` : "공고" };
}

export default async function JobPage(props: PageProps<"/jobs/[id]">) {
  const { id } = await props.params;
  const job = getJob(id);
  if (!job) notFound();
  return <JobReport job={job} />;
}
