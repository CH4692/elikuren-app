import { Button } from "@/components/ui/button";

export function CmsSaveBar({
  dirty,
  saving,
  onSave,
  onPreview,
  previewLabel = "Vorschau",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onPreview?: () => void;
  previewLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#ebe4d8] bg-[#f7f4ee]/95 px-1 py-3 backdrop-blur">
      <p className="text-sm text-[#5c574e]">
        {saving
          ? "Wird gespeichert…"
          : dirty
            ? "Ungespeicherte Änderungen"
            : "Alle Änderungen gespeichert"}
      </p>
      <div className="flex flex-wrap gap-2">
        {onPreview ? (
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            disabled={saving}
            onClick={onPreview}
          >
            {previewLabel}
          </Button>
        ) : null}
        <Button type="button" disabled={!dirty || saving} onClick={onSave}>
          {saving ? "Speichern…" : "Speichern"}
        </Button>
      </div>
    </div>
  );
}
