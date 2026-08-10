import { CmsField } from "@/components/admin/cms/cms-field";

export function CmsVisibilitySwitch({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <CmsField
      id={id}
      label="Auf der Website anzeigen"
      hint="Ausgeblendete Abschnitte erscheinen nicht öffentlich."
    >
      <label className="inline-flex items-center gap-2 text-sm text-[#1f1f23]">
        <input
          id={id}
          type="checkbox"
          className="size-4 rounded border-[#d9d2c4]"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{checked ? "Sichtbar" : "Ausgeblendet"}</span>
      </label>
    </CmsField>
  );
}
