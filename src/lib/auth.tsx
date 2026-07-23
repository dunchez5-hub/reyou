"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/* ------------------------------------------------------------------ */
/*  Типы                                                               */
/* ------------------------------------------------------------------ */

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

export interface Measurement {
  pole: string;
  kind: string;
  value: number;
  weight: number;
}

export interface CompletionStats {
  chapter: string;
  leadPole: string | null;
  scores: Record<string, number>;
  isFlat: boolean;
  hasGap: boolean;
  secondsSpent: number;
  savedAccount: boolean;
}

interface AuthCtx {
  ready: boolean;
  user: User | null;
  state: AppState;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  saveChapter: (
    chapter: string,
    answers: Record<string, unknown>,
    measurements: Measurement[]
  ) => Promise<void>;
  recordCompletion: (stats: CompletionStats) => Promise<void>;
  loadFull: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

/* ------------------------------------------------------------------ */
/*  Провайдер                                                          */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AppState>({ profile: null, ch1: null });

  // защищает от гонки: во время OAuth-редиректа сессия на миг null
  const settledRef = useRef(false);

  /* --- загрузить данные пользователя ----------------------------- */
  const loadForUser = useCallback(async (uid: string) => {
    try {
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
          ? {
              answers: ans.answers as Record<string, unknown>,
              date: ans.created_at,
            }
          : null,
      });
    } catch (e) {
      console.error("loadForUser failed", e);
    } finally {
      setReady(true);
    }
  }, []);

  /* --- слушаем сессию -------------------------------------------- */
  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const u = data.session?.user ?? null;
      setUser(u);
      settledRef.current = true;
      if (u) loadForUser(u.id);
      else setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        loadForUser(u.id);
      } else if (event === "SIGNED_OUT") {
        // чистим состояние ТОЛЬКО при явном выходе,
        // а не на промежуточных null во время редиректа
        setState({ profile: null, ch1: null });
        setReady(true);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [loadForUser]);

  const loadFull = useCallback(async () => {
    if (user) await loadForUser(user.id);
  }, [user, loadForUser]);

  /* --- вход / регистрация ----------------------------------------- */
  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ profile: null, ch1: null });
  }, []);

  /* --- сохранить профиль ------------------------------------------ */
  const saveProfile = useCallback(
    async (p: Profile) => {
      if (!user) return;
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error("saveProfile", error);
      else setState((s) => ({ ...s, profile: p }));
    },
    [user]
  );

  /* --- сохранить главу -------------------------------------------- */
  const saveChapter = useCallback(
    async (
      chapter: string,
      answers: Record<string, unknown>,
      measurements: Measurement[]
    ) => {
      if (!user) return;

      const { error: ansErr } = await supabase.from("answers").insert({
        user_id: user.id,
        chapter,
        answers,
      });
      if (ansErr) console.error("saveChapter/answers", ansErr);

      if (measurements.length > 0) {
        const { error: mErr } = await supabase.from("measurements").insert(
          measurements.map((m) => ({
            user_id: user.id,
            chapter,
            pole: m.pole,
            kind: m.kind,
            value: m.value,
            weight: m.weight,
          }))
        );
        if (mErr) console.error("saveChapter/measurements", mErr);
      }

      const sectionMap: Record<string, string> = {
        ch1: "pole",
        ch2: "foundation",
        ch3: "action",
      };
      const section = sectionMap[chapter];
      if (section) {
        await supabase
          .from("unlocks")
          .upsert(
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
    },
    [user]
  );

  /* --- статистика: пишем всех, включая анонимов -------------------- */
  const recordCompletion = useCallback(
    async (stats: CompletionStats) => {
      try {
        await supabase.from("completions").insert({
          user_id: user?.id ?? null,
          name: state.profile?.name ?? null,
          age: state.profile?.age ?? null,
          gender: state.profile?.gender ?? null,
          chapter: stats.chapter,
          lead_pole: stats.leadPole,
          scores: stats.scores,
          is_flat: stats.isFlat,
          has_gap: stats.hasGap,
          seconds_spent: stats.secondsSpent,
          saved_account: stats.savedAccount,
          user_agent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 300)
              : null,
        });
      } catch (e) {
        // статистика не должна ломать продукт
        console.error("recordCompletion failed", e);
      }
    },
    [user, state.profile]
  );

  return (
    <Ctx.Provider
      value={{
        ready,
        user,
        state,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        saveProfile,
        saveChapter,
        recordCompletion,
        loadFull,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
