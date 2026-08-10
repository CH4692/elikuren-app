"use client";

import { CmsField } from "@/components/admin/cms/cms-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { coerceCmsString } from "@/lib/site-content/cms-scalar";

export function CmsTextInput({
  id,
  label,
  value,
  onChange,
  hint,
  multiline = false,
  rows = 4,
  type = "text",
}: {
  id: string;
  label: string;
  /** Primitive only — objects/arrays are rejected (empty + dev warning). */
  value: string | null | undefined;
  onChange: (next: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
}) {
  const safe = coerceCmsString(value, id);

  return (
    <CmsField id={id} label={label} hint={hint}>
      {multiline ? (
        <Textarea
          id={id}
          rows={rows}
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-2xl"
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-xl"
        />
      )}
    </CmsField>
  );
}
