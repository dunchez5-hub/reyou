"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface Profile {
  name: string;
  age: number | null;
  gender: "m" | "f" | "x" | null;
}

interface ChapterResult {
  answers: Record<string, unknown>;
  date: string;
}

export interface AppState {
  profile: Profile | null;
  ch1: ChapterResult | null;
}

interface AuthCtx {
  ready: boolean;
  user: User | null;
  state: AppState;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  saveChapter: (
    chapter: string,
    answers: Record<string, unknown>,
    measurements: Array<{
      pole: string;
      kind: string;
      value: number;
      weight: number;
    }>
  ) => Promise<void>;
  loadFull: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>({ profile: null, ch1: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadForUser(data.session.user.id);
      else setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) loadForUser(session.user.id);
        else {
          setState({ profile: null, ch1: null });
          setReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadForUser = useCallback(async (uid: string) => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("name, age, gender")
      .eq("id", uid)
      .maybeSingle();

    const { data: ans } = await supabase
      .from("answers")
      .select("answers, created_at")
      .eq("user_id", uid)
      .eq("chapter", "ch1")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setState({
      profile: prof
        ? { name: prof.name, age: prof.age, gender: prof.gender }
        : null,
      ch1: ans
        ? { answers: ans.answers as Record<string, unknown>, date: ans.created_at }
        : null,
    });
    setReady(true);
  }, []);

  const loadFull = useCallback(async () => {
    if (user) await loadForUser(user.id);
  }, [user, loadForUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ profile: null, ch1: null });
  }, []);

  const saveProfile = useCallback(async (p: Profile) => {
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      updated_at: new Date().toISOString(),
    });
    setState((s) => ({ ...s, profile: p }));
  }, [user]);

  const saveChapter = useCallback(async (
    chapter: string,
    answers: Record<string, unknown>,
    measurements: Array<{ pole: string; kind: string; value: number; weight: number }>
  ) => {
    if (!user) return;

    await supabase.from("answers").insert({
      user_id: user.id,
      chapter,
      answers,
    });

    if (measurements.length > 0) {
      await supabase.from("measurements").insert(
        measurements.map((m) => ({
          user_id: user.id,
          chapter,
          pole: m.pole,
          kind: m.kind,
          value: m.value,
          weight: m.weight,
        }))
      );
    }

    const sectionMap: Record<string, string> = { ch1: "pole" };
    const section = sectionMap[chapter];
    if (section) {
      await supabase.from("unlocks").upsert(
        { user_id: user.id, section, chapter },
        { onConflict: "user_id,section" }
      );
    }

    if (chapter === "ch1") {
      setState((s) => ({
        ...s,
        ch1: { answers, date: new Date().toISOString() },
      }));
    }
  }, [user]);

  return (
    <Ctx.Provider value={{
      ready, user, state,
      signUp, signIn, signOut,
      saveProfile, saveChapter, loadFull,
    }}>
      {children}
    </Ctx.Provider>
  );
}