import { listEntries } from "@/lib/entries";
import { GuestbookForm } from "./guestbook-form";
import { EntryList } from "./entry-list";
import { ThemeToggle } from "./theme-toggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const entries = await listEntries();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">미니 방명록</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            이름, 메시지, 비밀번호를 남겨보세요. 본인 글은 비밀번호로 수정·삭제할 수 있어요.
          </p>
        </div>
        <ThemeToggle />
      </div>
      <GuestbookForm />
      <EntryList entries={entries} />
    </main>
  );
}
