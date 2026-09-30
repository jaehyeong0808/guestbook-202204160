"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Entry } from "@/lib/entries";

type Mode = "view" | "edit" | "delete";

const ERROR_MESSAGES: Record<string, string> = {
  wrong_password: "비밀번호가 일치하지 않습니다.",
  not_found: "이미 삭제된 글입니다.",
  invalid_body: "입력값을 확인해주세요.",
};

export function EntryItem({ entry }: { entry: Entry }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function cancel() {
    setMode("view");
    setMessage(entry.message);
    setPassword("");
    setError(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(ERROR_MESSAGES[body.error] ?? "수정에 실패했습니다.");
      return;
    }

    setMode("view");
    setPassword("");
    router.refresh();
  }

  async function submitDelete(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/entries/${entry.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(ERROR_MESSAGES[body.error] ?? "삭제에 실패했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <li className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium">{entry.name}</span>
        <time className="text-xs text-black/50 dark:text-white/50">
          {new Date(entry.created_at).toLocaleString("ko-KR")}
        </time>
      </div>

      {mode === "view" && (
        <>
          <p className="mt-2 whitespace-pre-wrap text-sm">{entry.message}</p>
          <div className="mt-3 flex gap-3 text-xs text-black/50 dark:text-white/50">
            <button onClick={() => setMode("edit")} className="underline">
              수정
            </button>
            <button onClick={() => setMode("delete")} className="underline">
              삭제
            </button>
          </div>
        </>
      )}

      {mode === "edit" && (
        <form onSubmit={submitEdit} className="mt-3 flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 self-end">
            <button type="button" onClick={cancel} className="rounded px-3 py-1.5 text-sm">
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              저장
            </button>
          </div>
        </form>
      )}

      {mode === "delete" && (
        <form onSubmit={submitDelete} className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-black/70 dark:text-white/70">
            삭제하려면 비밀번호를 입력하세요.
          </p>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 self-end">
            <button type="button" onClick={cancel} className="rounded px-3 py-1.5 text-sm">
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
