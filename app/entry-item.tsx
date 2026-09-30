"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MAX_MESSAGE_LENGTH, type Entry } from "@/lib/entry-rules";
import { colorForName } from "@/lib/avatar-color";
import { formatRelativeTime } from "@/lib/time";
import { emitToast } from "@/lib/toast-bus";

type Mode = "view" | "edit" | "delete";

const ERROR_MESSAGES: Record<string, string> = {
  wrong_password: "비밀번호가 일치하지 않습니다.",
  not_found: "이미 삭제된 글입니다.",
  invalid_body: "입력값을 확인해주세요.",
  message_too_long: `메시지는 ${MAX_MESSAGE_LENGTH}자 이내로 입력해주세요.`,
};

export function EntryItem({ entry }: { entry: Entry }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("view");
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLabel, setTimeLabel] = useState(() =>
    new Date(entry.created_at).toLocaleString("ko-KR"),
  );
  const [likeCount, setLikeCount] = useState(entry.like_count);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const update = () => setTimeLabel(formatRelativeTime(entry.created_at));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [entry.created_at]);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`liked:${entry.id}`) === "1");
    } catch {
      // ignore
    }
  }, [entry.id]);

  async function handleLike() {
    if (liked) return;
    const res = await fetch(`/api/entries/${entry.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as { like_count: number };
    setLikeCount(data.like_count);
    setLiked(true);
    try {
      localStorage.setItem(`liked:${entry.id}`, "1");
    } catch {
      // ignore
    }
  }

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
    emitToast("수정되었습니다 ✓");
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

    emitToast("삭제되었습니다 ✓");
    router.refresh();
  }

  return (
    <li className="rounded-lg border border-black/10 p-4 transition-shadow hover:shadow-md hover:shadow-black/5 dark:border-white/10 dark:hover:shadow-white/5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: colorForName(entry.name) }}
          >
            {entry.name.trim().charAt(0).toUpperCase()}
          </span>
          <span className="font-medium">{entry.name}</span>
        </div>
        <time
          dateTime={entry.created_at}
          title={new Date(entry.created_at).toLocaleString("ko-KR")}
          className="text-xs text-black/50 dark:text-white/50"
        >
          {timeLabel}
        </time>
      </div>

      {mode === "view" && (
        <>
          <p className="mt-2 whitespace-pre-wrap text-sm">{entry.message}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-black/50 dark:text-white/50">
            <button
              onClick={handleLike}
              disabled={liked}
              aria-pressed={liked}
              className="flex items-center gap-1 disabled:opacity-100"
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setMode("edit")}
              className="text-indigo-600 underline dark:text-indigo-400"
            >
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
            maxLength={MAX_MESSAGE_LENGTH}
            className="rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
          />
          <p className="-mt-1 self-end text-xs text-black/40 dark:text-white/40">
            {message.length}/{MAX_MESSAGE_LENGTH}
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
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
