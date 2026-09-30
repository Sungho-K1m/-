"use client";

import { createContext, useContext, useState } from "react";
import type { YouthProfile } from "@/lib/types";

interface ProfileState {
  profile: YouthProfile | null;
  setProfile: (profile: YouthProfile) => void;
}

const ProfileContext = createContext<ProfileState | null>(null);

/** 입력한 조건은 이 React 상태에만 있다. 저장소·서버에 쓰지 않으므로 새로고침하면 사라진다. */
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<YouthProfile | null>(null);
  return <ProfileContext value={{ profile, setProfile }}>{children}</ProfileContext>;
}

export function useProfile(): ProfileState {
  const state = useContext(ProfileContext);
  if (!state) throw new Error("useProfile은 ProfileProvider 안에서만 쓸 수 있어요.");
  return state;
}
