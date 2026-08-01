/** Voice / ensemble labels used in admin library forms (enum VoiceGroup). */
export const LIBRARY_VOICE_OPTIONS = [
  { value: "SOPRANO", label: "Sopran" },
  { value: "ALTO", label: "Alt" },
  { value: "TENOR", label: "Tenor" },
  { value: "BASS", label: "Bass" },
  { value: "MUSICAL_TEAM", label: "musical team" },
  { value: "EIGHT_TO_THE_BAR", label: "eight-to-the-bar" },
  { value: "OTHER", label: "Sonstige" },
] as const;

/** Member profile / Freigabe voice labels (stored as free-text on User.voice). */
export const MEMBER_VOICE_OPTIONS = [
  "Sopran",
  "Alt",
  "Tenor",
  "Bass",
  "musical team",
  "eight-to-the-bar",
] as const;

export const LIBRARY_VOICE_LABELS: Record<string, string> = Object.fromEntries(
  LIBRARY_VOICE_OPTIONS.map((o) => [o.value, o.label]),
);

/** Performing group on a concert program item (null = Elikuren / alle). */
export const ENSEMBLE_OPTIONS = [
  { value: "", label: "Elikuren / alle" },
  { value: "MUSICAL_TEAM", label: "musical team" },
  { value: "EIGHT_TO_THE_BAR", label: "eight-to-the-bar" },
  { value: "OTHER", label: "Sonstige" },
] as const;

export const ENSEMBLE_LABELS: Record<string, string> = Object.fromEntries(
  ENSEMBLE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
);

export const AUDIO_TYPE_OPTIONS = [
  { value: "FULL_RECORDING", label: "Gesamtaufnahme" },
  { value: "SOPRANO", label: "Sopran" },
  { value: "ALTO", label: "Alt" },
  { value: "TENOR", label: "Tenor" },
  { value: "BASS", label: "Bass" },
  { value: "PIANO", label: "Klavier" },
  { value: "REHEARSAL", label: "Probe" },
  { value: "CONCERT_RECORDING", label: "Konzert" },
  { value: "OTHER", label: "Sonstige" },
] as const;
