"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Profile } from "@/lib/auth";

const C = {
  bg: "#191714",
  bgDeep: "#131110",
  surface: "#221F1B",
  surfaceUp: "#2A2621",
  line: "rgba(255,255,255,0.09)",
  text: "#EDE8DF",
  dim: "#A79F94",
  faint: "#6E675E",
};

const SERIF = "'Charter', 'Iowan Old Style', Georgia, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, monospace";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: C.faint }}>
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "solid" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
  const solid = variant === "solid";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", minHeight: 54, borderRadius: 14,
        border: solid ? "none" : `1px solid ${C.line}`,
        background: disabled ? "rgba(255,255,255,0.06)" : solid ? C.text : "transparent",
        color: disabled ? C.faint : solid ? C.bgDeep : C.text,
        fontFamily: SANS, fontSize: 16, fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

const fieldStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box" as const,
  background: C.bgDeep, border: `1px solid ${C.line}`,
  borderRadius: 12, padding: "15px 16px",
  color: C.text, fontFamily: SANS, fontSize: 16,
};

function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const fn = mode === "login" ? signIn : signUp;
    const err = await fn(email.trim(), password);
    setLoading(false);
    if (err) {
      if (err.includes("Invalid login")) setError("Неверная почта или пароль");
      else if (err.includes("already registered")) setError("Эта почта уже зарегистрирована. Попробуй войти.");
      else if (err.includes("Password should be")) setError("Пароль должен быть не короче 6 символов");
      else setError(err);
    }
  };

  const ok = email.includes("@") && password.length >= 6;

  return (
    <div style={{ paddingTop: 64 }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, fontWeight: 400, margin: "0 0 10px" }}>
        Твоё поле
      </h1>
      <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.55, color: C.dim, margin: "0 0 36px" }}>
        {mode === "login" ? "Войди, чтобы вернуться к своим результатам." : "Создай аккаунт, чтобы сохранить прогресс на любом устройстве."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ marginBottom: 8 }}><Eyebrow>Почта</Eyebrow></div>
          <input style={fieldStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" />
        </div>
        <div>
          <div style={{ marginBottom: 8 }}><Eyebrow>Пароль</Eyebrow></div>
          <input style={fieldStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Не короче 6 символов" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </div>
      </div>
      {error && <p style={{ fontFamily: SANS, fontSize: 14, color: "#DC8A6B", marginTop: 14 }}>{error}</p>}
      <div style={{ marginTop: 24 }}><Button onClick={submit} disabled={!ok || loading}>{loading ? "Секунду…" : mode === "login" ? "Войти" : "Создать аккаунт"}</Button></div>
      <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
        style={{ marginTop: 18, background: "transparent", border: "none", color: C.dim, fontFamily: SANS, fontSize: 14, cursor: "pointer", width: "100%", textAlign: "center" as const }}>
        {mode === "login" ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
}

function AppShell() {
  const { user, state, signOut, saveProfile } = useAuth();
  const [editing, setEditing] = useState(!state.profile);
  const [name, setName] = useState(state.profile?.name || "");
  const [age, setAge] = useState(state.profile?.age?.toString() || "");
  const [gender, setGender] = useState(state.profile?.gender || "");

  const save = async () => {
    await saveProfile({ name: name.trim(), age: age ? parseInt(age) : null, gender: (gender || null) as Profile["gender"] });
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px 64px" }}>
      <Eyebrow>вход выполнен · {user?.email}</Eyebrow>
      <h1 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, margin: "14px 0 8px" }}>
        {state.profile ? `Привет, ${state.profile.name}` : "Заполни профиль"}
      </h1>
      {editing ? (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ marginBottom: 8 }}><Eyebrow>Имя</Eyebrow></div>
            <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут" />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}><Eyebrow>Возраст</Eyebrow></div>
            <input style={fieldStyle} value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="Необязательно" inputMode="numeric" />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}><Eyebrow>Пол</Eyebrow></div>
            <div style={{ display: "flex", gap: 8 }}>
              {([{ id: "m", label: "Мужской" }, { id: "f", label: "Женский" }, { id: "x", label: "Не указывать" }] as const).map((g) => (
                <button key={g.id} onClick={() => setGender(g.id)}
                  style={{ flex: 1, minHeight: 50, borderRadius: 12, border: `1px solid ${gender === g.id ? "rgba(255,255,255,0.3)" : C.line}`, background: gender === g.id ? C.text : C.surface, color: gender === g.id ? C.bgDeep : C.dim, fontFamily: SANS, fontSize: 14, cursor: "pointer" }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 10 }}><Button onClick={save} disabled={!name.trim()}>Сохранить</Button></div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontFamily: SANS, fontSize: 16, color: C.dim, lineHeight: 1.6 }}>
            Профиль сохранён. Вход и база работают. Скоро здесь появятся главы.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Button variant="ghost" onClick={() => setEditing(true)}>Редактировать</Button></div>
            <div style={{ flex: 1 }}><Button variant="ghost" onClick={signOut}>Выйти</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: C.bg }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.faint, letterSpacing: "0.18em" }}>загрузка…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 20px 64px" }}>
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <AppShell />
    </div>
  );
}