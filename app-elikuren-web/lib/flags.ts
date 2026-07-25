function envFlag(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const flags = {
  authDisabled: envFlag("NEXT_PUBLIC_FLAG_AUTH_DISABLED", true),
  aboutDisabled: envFlag("NEXT_PUBLIC_FLAG_ABOUT_DISABLED", true),
  historyDisabled: envFlag("NEXT_PUBLIC_FLAG_HISTORY_DISABLED", true),
  elikurenDisabled: envFlag("NEXT_PUBLIC_FLAG_ELIKUREN_DISABLED", false),
  eightToTheBarDisabled: envFlag(
    "NEXT_PUBLIC_FLAG_EIGHT_TO_THE_BAR_DISABLED",
    true,
  ),
  musicalTeamDisabled: envFlag(
    "NEXT_PUBLIC_FLAG_MUSICAL_TEAM_DISABLED",
    true,
  ),
} as const;
