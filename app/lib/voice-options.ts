/**
 * Unified casting (Besetzung) for scores, audio, and concert program items.
 * Stored as VoiceGroup on sheet_files.voice_group, audio_files.voice_group,
 * and concert_items.ensemble.
 */
export const BESETZUNG_OPTIONS = [
  { value: "ELIKUREN", label: "Elikuren" },
  { value: "MUSICAL_TEAM", label: "Musical-Team" },
  { value: "EIGHT_TO_THE_BAR", label: "Eight-to-the-Bar" },
  { value: "SOLO", label: "Solo" },
] as const;

export type BesetzungValue = (typeof BESETZUNG_OPTIONS)[number]["value"];

export const BESETZUNG_LABELS: Record<string, string> = Object.fromEntries(
  BESETZUNG_OPTIONS.map((o) => [o.value, o.label]),
);

export function besetzungLabel(value: string | null | undefined): string {
  if (!value) return BESETZUNG_LABELS.ELIKUREN ?? "Elikuren";
  return BESETZUNG_LABELS[value] ?? value;
}

/** @deprecated Use BESETZUNG_OPTIONS */
export const LIBRARY_VOICE_OPTIONS = BESETZUNG_OPTIONS;

/** @deprecated Use BESETZUNG_LABELS */
export const LIBRARY_VOICE_LABELS = BESETZUNG_LABELS;

/** Filter dropdown: empty = all castings. */
export const ENSEMBLE_OPTIONS = [
  { value: "", label: "Alle Besetzungen" },
  ...BESETZUNG_OPTIONS,
] as const;

/** @deprecated Use BESETZUNG_LABELS / besetzungLabel */
export const ENSEMBLE_LABELS = BESETZUNG_LABELS;

/** Member profile / Freigabe voice labels (stored as free-text on User.voice). */
export const MEMBER_VOICE_OPTIONS = [
  "Sopran",
  "Alt",
  "Tenor",
  "Bass",
  "Musical-Team",
  "Eight-to-the-Bar",
] as const;

export const AUDIO_TYPE_OPTIONS = [
  { value: "FULL_RECORDING", label: "Gesamtaufnahme" },
  { value: "SOPRANO", label: "Sopran" },
  { value: "ALTO", label: "Alt" },
  { value: "MEZZO", label: "Mezzo" },
  { value: "TENOR", label: "Tenor" },
  { value: "BASS", label: "Bass" },
  { value: "PIANO", label: "Klavier" },
  { value: "REHEARSAL", label: "Probe" },
  { value: "CONCERT_RECORDING", label: "Konzert" },
  { value: "OTHER", label: "Sonstige" },
] as const;
