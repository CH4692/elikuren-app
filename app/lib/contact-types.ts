export const CONTACT_TYPES = [
  "CHOIR_MEMBER",
  "FORMER_MEMBER",
  "MUSICIAN",
  "SOLOIST",
  "ORGANIZER",
  "PARISH",
  "VENDOR",
  "OTHER",
] as const;

export type ContactTypeValue = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactTypeValue, string> = {
  CHOIR_MEMBER: "Chormitglied",
  FORMER_MEMBER: "Ehemaliges Mitglied",
  MUSICIAN: "Musiker:in",
  SOLOIST: "Solist:in",
  ORGANIZER: "Veranstalter",
  PARISH: "Gemeinde",
  VENDOR: "Dienstleister",
  OTHER: "Sonstiges",
};
