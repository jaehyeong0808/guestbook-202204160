import type { Entry } from "@/lib/entry-rules";
import { EntryItem } from "./entry-item";

export function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-black/50 dark:text-white/50">아직 남겨진 글이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
