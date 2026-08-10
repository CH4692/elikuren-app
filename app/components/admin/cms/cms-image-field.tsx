"use client";

import { useEffect, useState } from "react";

import { CmsEmptyState } from "@/components/admin/cms/cms-empty-state";
import { CmsField } from "@/components/admin/cms/cms-field";
import {
  CmsMediaPicker,
  type CmsMediaPick,
} from "@/components/admin/cms/cms-media-picker";
import { PictureThumb } from "@/components/admin/picture-thumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CmsMediaRef = {
  mediaAssetId: string;
  isDecorative: boolean;
  altText: string;
} | null;

export function CmsImageField({
  id,
  label,
  value,
  onChange,
  hint,
  allowRemove = true,
  usageAlt = true,
}: {
  id: string;
  label: string;
  value: CmsMediaRef;
  onChange: (next: CmsMediaRef) => void;
  hint?: string;
  allowRemove?: boolean;
  /** When false (e.g. OG image), hide usage alt / decorative controls. */
  usageAlt?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [resolvedFileId, setResolvedFileId] = useState<string | null>(null);
  const [resolvedForAssetId, setResolvedForAssetId] = useState<string | null>(
    null,
  );

  const mediaAssetId = value?.mediaAssetId ?? null;
  const fileId =
    mediaAssetId && resolvedForAssetId === mediaAssetId
      ? resolvedFileId
      : null;

  useEffect(() => {
    if (!mediaAssetId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/pictures");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items: Array<{ id: string; stored_file: { id: string } }>;
        };
        const match = data.items.find((item) => item.id === mediaAssetId);
        if (!cancelled) {
          setResolvedFileId(match?.stored_file.id ?? null);
          setResolvedForAssetId(mediaAssetId);
        }
      } catch {
        if (!cancelled) {
          setResolvedFileId(null);
          setResolvedForAssetId(mediaAssetId);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaAssetId]);

  function applyPick(asset: CmsMediaPick) {
    setResolvedFileId(asset.stored_file.id);
    setResolvedForAssetId(asset.id);
    onChange({
      mediaAssetId: asset.id,
      isDecorative: usageAlt ? asset.is_decorative : true,
      altText:
        usageAlt && !asset.is_decorative ? asset.alt_text || "" : "",
    });
  }

  return (
    <div className="space-y-3">
      <CmsField id={id} label={label} hint={hint}>
        {mediaAssetId ? (
          <div className="flex flex-wrap items-start gap-4">
            <div className="size-28 overflow-hidden rounded-xl border border-[#d9d2c4] bg-[#f7f4ee]">
              {fileId ? (
                <PictureThumb fileId={fileId} title={label} />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-[#8a8478]">
                  Bild gewählt
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-[#d9d2c4]"
                onClick={() => setPickerOpen(true)}
              >
                Ersetzen
              </Button>
              {allowRemove ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setResolvedFileId(null);
                    setResolvedForAssetId(null);
                    onChange(null);
                  }}
                >
                  Entfernen
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <CmsEmptyState
            title="Noch kein Bild ausgewählt."
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                Bild auswählen
              </Button>
            }
          />
        )}
      </CmsField>

      {usageAlt && value?.mediaAssetId ? (
        <>
          <label className="inline-flex items-center gap-2 text-sm text-[#1f1f23]">
            <input
              type="checkbox"
              className="size-4 rounded border-[#d9d2c4]"
              checked={value.isDecorative}
              onChange={(e) =>
                onChange({
                  ...value,
                  isDecorative: e.target.checked,
                  altText: e.target.checked ? "" : value.altText,
                })
              }
            />
            <span>Dekorativ (kein Alt-Text nötig)</span>
          </label>
          {!value.isDecorative ? (
            <CmsField
              id={`${id}-alt`}
              label="Alt-Text"
              hint="Beschreibt das Bild für Screenreader und SEO (bezogen auf diese Verwendung)."
            >
              <Input
                id={`${id}-alt`}
                value={value.altText}
                onChange={(e) =>
                  onChange({ ...value, altText: e.target.value })
                }
              />
            </CmsField>
          ) : null}
        </>
      ) : null}

      <CmsMediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={applyPick}
      />
    </div>
  );
}
