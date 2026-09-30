"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuestbookForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, password }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("이름, 메시지, 비밀번호를 모두 입력해주세요.");
      return;
    }

    setName("");
    setMessage("");
    setPassword("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
    >
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-36 rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
        />
      </div>
      <textarea
        placeholder="메시지를 남겨주세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="rounded border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-end rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitting ? "등록 중..." : "남기기"}
      </button>
    </form>
  );
}
