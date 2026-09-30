import type { Metadata } from "next";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = { title: "내 조건 입력" };

export default function OnboardingPage() {
  return <OnboardingForm />;
}
