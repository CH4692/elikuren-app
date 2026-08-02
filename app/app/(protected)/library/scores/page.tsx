import { MemberShell } from "@/components/app/member-shell";
import { LibraryScores } from "@/components/library/library-scores";
import { Badge } from "@/components/ui/badge";

export default function LibraryScoresPage() {
  return (
    <MemberShell>
      <header className="mb-6 space-y-2 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#1f1f23] sm:text-3xl">
            Noten
          </h1>
          <Badge
            variant="secondary"
            className="rounded-md border border-[#d9d2c4] bg-white px-2 py-0.5 text-xs font-medium text-[#5c574e]"
          >
            Mitgliederbereich
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-[#5c574e] sm:text-base">
          Noten des aktuellen Konzertprogramms und Gesamtkatalog durchsuchen.
        </p>
      </header>
      <LibraryScores />
    </MemberShell>
  );
}
