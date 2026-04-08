export const flags = {
  authDisbled: process.env.NEXT_PUBLIC_FLAG_AUTH_DISABLED === "true",
  aboutDisbled: process.env.NEXT_PUBLIC_FLAG_ABOUT_DISABLED === "true",
  historyDisbled: process.env.NEXT_PUBLIC_FLAG_HISTORY_DISABLED === "true",
  elikurenDisbled: process.env.NEXT_PUBLIC_FLAG_ELIKUREN_DISABLED === "true",
  eightToTheBarDisbled:
    process.env.NEXT_PUBLIC_FLAG_EIGHT_TO_THE_BAR_DISABLED === "true",
  musicalTeamDisbled:
    process.env.NEXT_PUBLIC_FLAG_MUSICAL_TEAM_DISABLED === "true",
} as const;
