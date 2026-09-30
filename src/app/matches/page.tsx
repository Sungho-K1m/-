import type { Metadata } from "next";
import MatchList from "./MatchList";

export const metadata: Metadata = { title: "매칭 결과" };

export default function MatchesPage() {
  return <MatchList />;
}
