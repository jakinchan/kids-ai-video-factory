"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, Loader2, Play, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { type UiLanguage, ui } from "../../i18n";

type Session = {
  id: string;
  title: string;
  user_goal: string;
  mode: string;
  status: string;
  approved_at?: string;
  plan?: {
    safety_notes: string[];
    blocked_actions: string[];
    content_ideas: Array<{ title: string; visual_style: string; voice_style: string }>;
  };
  actions: Array<{
    id: string;
    tool_name: string;
    status: string;
    risk_level: string;
    output_json: unknown;
  }>;
  result_bundle?: {
    job_ids: string[];
    output_dirs: string[];
    generated_files: string[];
  };
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4010";

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

async function mutate<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();
  const [language, setLanguage] = useState<UiLanguage>("ja");
  const copy = ui[language];
  const [session, setSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function refresh() {
    const nextSession = await api<Session>(`/api/agent/sessions/${params.id}`);
    const nextLogs = await api<{ lines: string[] }>(`/api/agent/sessions/${params.id}/logs`);
    setSession(nextSession);
    setLogs(nextLogs.lines);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : copy.errors.load));
  }, [params.id]);

  async function approve() {
    setBusy("approve");
    setError("");
    try {
      setSession(await mutate<Session>(`/api/agent/sessions/${params.id}/approve`));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.approve);
    } finally {
      setBusy("");
    }
  }

  async function execute() {
    setBusy("execute");
    setError("");
    try {
      if (!session?.approved_at) {
        await mutate<Session>(`/api/agent/sessions/${params.id}/approve`);
      }
      setSession(await mutate<Session>(`/api/agent/sessions/${params.id}/execute`, { pipeline_mode: "mock" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.execute);
    } finally {
      setBusy("");
    }
  }

  async function cancel() {
    setBusy("cancel");
    setError("");
    try {
      setSession(await mutate<Session>(`/api/agent/sessions/${params.id}/cancel`));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.cancel);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Bot size={20} /></div>
          <div>
            <h1>{session?.title ?? "Session"}</h1>
            <p>{session?.status ?? copy.loading}</p>
          </div>
        </div>
        <div className="row">
          <select className="select" value={language} onChange={(event) => setLanguage(event.target.value as UiLanguage)} aria-label="Language">
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
          <Link href="/claw-director"><button><ArrowLeft size={16} /> {copy.back}</button></Link>
          <button onClick={approve} disabled={Boolean(busy) || Boolean(session?.approved_at) || session?.status === "cancelled"}>
            {busy === "approve" ? <Loader2 size={16} /> : <CheckCircle2 size={16} />} {copy.approve}
          </button>
          <button className="primary" onClick={execute} disabled={Boolean(busy) || session?.status === "cancelled"}>
            {busy === "execute" ? <Loader2 size={16} /> : <Play size={16} />} {copy.runMock}
          </button>
          <button onClick={cancel} disabled={Boolean(busy) || session?.status === "completed" || session?.status === "cancelled"}>
            {busy === "cancel" ? <Loader2 size={16} /> : <XCircle size={16} />} {copy.cancel}
          </button>
          <button onClick={() => refresh().catch((err) => setError(err instanceof Error ? err.message : copy.errors.refresh))}>
            <RefreshCw size={16} /> {copy.refresh}
          </button>
        </div>
      </header>

      <div className="layout">
        <section className="stack">
          {error ? <p className="danger">{error}</p> : null}
          <section className="panel">
            <div className="panel-header"><h2>{copy.goal}</h2><span className="badge">{session?.mode ?? "-"}</span></div>
            <div className="panel-body"><p>{session?.user_goal}</p></div>
          </section>
          <section className="panel">
            <div className="panel-header"><h2>{copy.actions}</h2></div>
            <div className="panel-body idea-list">
              {session?.actions.length ? session.actions.map((action) => (
                <div className="idea" key={action.id}>
                  <strong>{action.tool_name}</strong>
                  <span className="muted">{action.status} · {copy.risk} {action.risk_level}</span>
                </div>
              )) : <div className="empty">{copy.noActions}</div>}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header"><h2>{copy.executionLog}</h2></div>
            <div className="panel-body"><div className="log">{logs.join("\n") || copy.noLog}</div></div>
          </section>
        </section>

        <aside className="stack">
          <section className="panel">
            <div className="panel-header"><h2>{copy.safety}</h2><ShieldCheck size={18} /></div>
            <div className="panel-body stack">
              {session?.plan?.safety_notes.map((note) => <p className="muted" key={note}>{note}</p>)}
              {session?.plan?.blocked_actions.map((item) => <span className="badge" key={item}>{item}</span>)}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header"><h2>{copy.files}</h2></div>
            <div className="panel-body stack">
              {session?.result_bundle?.generated_files.map((file) => <code className="muted" key={file}>{file}</code>) ?? <div className="empty">{copy.noFiles}</div>}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
