"use client";

import { CmsField } from "@/components/admin/cms/cms-field";
import { Input } from "@/components/ui/input";
import { coerceCmsString } from "@/lib/site-content/cms-scalar";
import {
  INTERNAL_SITE_ANCHORS,
  INTERNAL_SITE_ROUTES,
  validateSiteLink,
} from "@/lib/site-content/links";

const PRESETS = [
  ...INTERNAL_SITE_ROUTES.map((href) => ({ href, label: href })),
  ...INTERNAL_SITE_ANCHORS.map((href) => ({ href, label: href })),
];

export function CmsLinkField({
  id,
  label,
  value,
  onChange,
  hint,
  allowCustom = true,
  httpsOnly = false,
  optional = false,
}: {
  id: string;
  label: string;
  /** Href string only — never a link/CTA object. */
  value: string | null | undefined;
  onChange: (next: string) => void;
  hint?: string;
  allowCustom?: boolean;
  /** Social / external-only links. */
  httpsOnly?: boolean;
  /** Empty value allowed. */
  optional?: boolean;
}) {
  const safe = coerceCmsString(value, id);
  const validation =
    optional && !safe.trim()
      ? ({ ok: true as const, value: "" } as const)
      : safe.trim()
        ? validateSiteLink(safe, { httpsOnly })
        : ({ ok: true as const, value: "" } as const);
  const presetMatch = !httpsOnly && PRESETS.some((p) => p.href === safe);

  if (httpsOnly) {
    return (
      <CmsField
        id={id}
        label={label}
        hint={hint ?? "Nur https://-Links"}
        error={validation.ok ? null : validation.error}
      >
        <Input
          id={id}
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </CmsField>
    );
  }

  return (
    <div className="space-y-2">
      <CmsField
        id={`${id}-preset`}
        label={label}
        hint={hint}
        error={validation.ok ? null : validation.error}
      >
        <select
          id={`${id}-preset`}
          className="flex h-10 w-full rounded-xl border border-[#d9d2c4] bg-white px-3 py-2 text-sm text-[#1f1f23]"
          value={presetMatch ? safe : "__custom__"}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              if (!allowCustom) return;
              onChange("");
              return;
            }
            onChange(e.target.value);
          }}
        >
          <option value="__custom__">
            {allowCustom ? "Eigene URL…" : "Bitte wählen…"}
          </option>
          {PRESETS.map((preset) => (
            <option key={preset.href} value={preset.href}>
              {preset.label}
            </option>
          ))}
        </select>
      </CmsField>
      {allowCustom && (!presetMatch || safe === "") ? (
        <CmsField id={id} label="URL" hint="Interne Route, Anker oder https://…">
          <Input
            id={id}
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/about oder https://…"
          />
        </CmsField>
      ) : null}
    </div>
  );
}
