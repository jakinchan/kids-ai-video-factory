"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, ClipboardList, Loader2, Play, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { defaultGoals, type UiLanguage, ui } from "./i18n";

type Session = {
  id: string;
  title: string;
  user_goal: string;
  mode: string;
  status: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  plan?: {
    content_count: number;
    language: string;
    target_age: string;
    theme: string;
    platform: string;
    plan_steps: string[];
    content_ideas: Array<{
      title: string;
      theme: string;
      lesson: string;
      visual_style: string;
      voice_style: string;
      duration_seconds: number;
    }>;
    safety_notes: string[];
    blocked_actions: string[];
  };
  result_bundle?: {
    job_ids: string[];
    output_dirs: string[];
    generated_files: string[];
  };
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4010";

async function api<T>(path: string, errorText: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? errorText);
  }
  return response.json() as Promise<T>;
}

export default function ClawDirectorPage() {
  const [language, setLanguage] = useState<UiLanguage>("ja");
  const copy = ui[language];
  const [goal, setGoal] = useState(defaultGoals.ja);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const metrics = useMemo(() => {
    const plan = selected?.plan;
    return [
      [copy.metrics.status, selected?.status ?? copy.idle],
      [copy.metrics.jobs, String(selected?.result_bundle?.job_ids.length ?? plan?.content_count ?? 0)],
      [copy.metrics.age, plan?.target_age ?? "-"],
      [copy.metrics.platform, plan?.platform ?? "-"]
    ];
  }, [copy, selected]);

  function changeLanguage(nextLanguage: UiLanguage) {
    setLanguage(nextLanguage);
    setGoal(defaultGoals[nextLanguage]);
  }

  async function refresh() {
    const nextSessions = await api<Session[]>("/api/agent/sessions", copy.errors.request);
    setSessions(nextSessions);
    if (selected) {
      const nextSelected = await api<Session>(`/api/agent/sessions/${selected.id}`, copy.errors.request);
      setSelected(nextSelected);
      const nextLogs = await api<{ lines: string[] }>(`/api/agent/sessions/${selected.id}/logs`, copy.errors.request);
      setLogs(nextLogs.lines);
    }
  }

  async function createSession() {
    setBusy(true);
    setError("");
    try {
      const session = await api<Session>("/api/agent/sessions", copy.errors.create, {
        method: "POST",
        body: JSON.stringify({ user_goal: goal })
      });
      setSelected(session);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.create);
    } finally {
      setBusy(false);
    }
  }

  async function approveAndExecute(onlyApprove = false) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const approved = await api<Session>(`/api/agent/sessions/${selected.id}/approve`, copy.errors.action, { method: "POST" });
      setSelected(approved);
      if (!onlyApprove) {
        const completed = await api<Session>(`/api/agent/sessions/${selected.id}/execute`, copy.errors.action, {
          method: "POST",
          body: JSON.stringify({ pipeline_mode: "mock" })
        });
        setSelected(completed);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.action);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : copy.errors.request));
  }, []);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Bot size={20} /></div>
          <div>
            <h1>Claw Director</h1>
            <p>Kids AI Video Factory</p>
          </div>
        </div>
        <div className="row">
          <select className="select" value={language} onChange={(event) => changeLanguage(event.target.value as UiLanguage)} aria-label="Language">
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <div className="status-chip"><ShieldCheck size={16} /> {copy.statusChip}</div>
        </div>
      </header>

      <div className="layout">
        <aside className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>{copy.agentChat}</h2>
              <button onClick={refresh} title={copy.refresh}><RefreshCw size={16} /></button>
            </div>
            <div className="panel-body stack">
              <textarea className="textarea" value={goal} onChange={(event) => setGoal(event.target.value)} />
              <button className="primary" onClick={createSession} disabled={busy}>
                {busy ? <Loader2 size={16} /> : <Send size={16} />} {copy.createSession}
              </button>
              {error ? <p className="danger">{error}</p> : null}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header"><h2>{copy.sessions}</h2></div>
            <div className="panel-body session-list">
              {sessions.length ? sessions.map((session) => (
                <button key={session.id} className="session-item" onClick={() => setSelected(session)}>
                  <span className="session-title">{session.title}</span>
                  <span className="muted">{session.status} · {session.mode}</span>
                </button>
              )) : <div className="empty">{copy.noSessions}</div>}
            </div>
          </section>
        </aside>

        <section className="stack">
          <div className="metric-grid">
            {metrics.map(([label, value]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="grid-two">
              <section className="panel">
                <div className="panel-header">
                  <h2>{copy.planPreview}</h2>
                  <span className="badge">{selected.plan?.language ?? "-"} · {selected.plan?.theme ?? "-"}</span>
                </div>
                <div className="panel-body stack">
                  <ol className="steps">
                    {selected.plan?.plan_steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                  <div className="row">
                    <button className="warning" onClick={() => approveAndExecute(true)} disabled={busy || Boolean(selected.approved_at)}>
                      <CheckCircle2 size={16} /> {copy.approve}
                    </button>
                    <button className="primary" onClick={() => approveAndExecute(false)} disabled={busy}>
                      <Play size={16} /> {copy.approveRun}
                    </button>
                    <Link href={`/claw-director/sessions/${selected.id}`}>{copy.openDetail}</Link>
                  </div>
                </div>
              </section>

              <aside className="stack">
                <section className="panel">
                  <div className="panel-header"><h3>{copy.contentIdeas}</h3></div>
                  <div className="panel-body idea-list">
                    {selected.plan?.content_ideas.map((idea) => (
                      <div className="idea" key={idea.title}>
                        <strong>{idea.title}</strong>
                        <span className="muted">{idea.lesson}</span>
                        <span className="badge">{idea.duration_seconds}s</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-header"><h3>{copy.resultBundle}</h3></div>
                  <div className="panel-body stack">
                    {selected.result_bundle ? (
                      <>
                        <div className="row"><ClipboardList size={16} /> {selected.result_bundle.generated_files.length} {copy.filesGenerated}</div>
                        {selected.result_bundle.output_dirs.map((dir) => <code className="muted" key={dir}>{dir}</code>)}
                      </>
                    ) : <div className="empty">{copy.waitingExecution}</div>}
                  </div>
                </section>
              </aside>
            </div>
          ) : (
            <section className="panel"><div className="empty">{copy.createOrSelect}</div></section>
          )}

          <section className="panel">
            <div className="panel-header"><h2>{copy.executionLog}</h2></div>
            <div className="panel-body">
              <div className="log">{logs.length ? logs.join("\n") : copy.noLog}</div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
