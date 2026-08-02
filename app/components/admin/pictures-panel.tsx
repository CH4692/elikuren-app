"use client";

import { ImageIcon, Plus } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminEditButton } from "@/components/admin/admin-edit-button";
import {
  PictureLightbox,
  type LightboxPicture,
} from "@/components/admin/picture-lightbox";
import { PictureThumb } from "@/components/admin/picture-thumb";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { DataTableToolbar } from "@/components/app/data-table-toolbar";
import { EmptyState } from "@/components/app/empty-state";
import { FormDrawer } from "@/components/app/form-drawer";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileViaPresign } from "@/lib/upload-client";

type PictureItem = {
  id: string;
  title: string;
  alt_text: string;
  is_decorative: boolean;
  caption: string | null;
  taken_at: string | null;
  is_active: boolean;
  is_archived: boolean;
  sort_order: number;
  reference_count: number;
  public_url: string | null;
  stored_file: {
    id: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    upload_status: string;
    visibility: string;
  };
  updated_at: string;
};

type PictureForm = {
  title: string;
  altText: string;
  isDecorative: boolean;
  caption: string;
  takenAt: string;
};

const emptyForm = (): PictureForm => ({
  title: "",
  altText: "",
  isDecorative: false,
  caption: "",
  takenAt: "",
});

export function PicturesPanel() {
  const [items, setItems] = useState<PictureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PictureItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PictureItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [form, setForm] = useState<PictureForm>(emptyForm());
  const [file, setFile] = useState<File | null>(null);

  async function load(q?: string) {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/admin/pictures${params}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { items: PictureItem[] };
      setItems(data.items);
    } catch {
      toast.error("Bilder konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const lightboxItems: LightboxPicture[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption,
        taken_at: item.taken_at,
        stored_file_id: item.stored_file.id,
        original_name: item.stored_file.original_name,
      })),
    [items],
  );

  function openCreate() {
    setForm(emptyForm());
    setFile(null);
    setCreateOpen(true);
  }

  function openEdit(item: PictureItem) {
    setForm({
      title: item.title,
      altText: item.alt_text ?? "",
      isDecorative: item.is_decorative,
      caption: item.caption ?? "",
      takenAt: item.taken_at ?? "",
    });
    setEditTarget(item);
  }

  function createPicture() {
    if (!file) {
      toast.error("Bilddatei ist Pflicht");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    if (!form.isDecorative && !form.altText.trim()) {
      toast.error("altText ist Pflicht (oder als dekorativ markieren)");
      return;
    }

    startTransition(async () => {
      try {
        const uploaded = await uploadFileViaPresign({
          file,
          category: "IMAGE",
          publicWebsite: true,
        });
        const res = await fetch("/api/admin/pictures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storedFileId: uploaded.fileId,
            title: form.title.trim(),
            altText: form.altText.trim(),
            isDecorative: form.isDecorative,
            caption: form.caption.trim() || null,
            takenAt: form.takenAt || null,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            detail?: string;
          };
          toast.error(err.detail ?? "Bild konnte nicht angelegt werden");
          return;
        }
        toast.success("Bild angelegt");
        setCreateOpen(false);
        setFile(null);
        setForm(emptyForm());
        await load(search || undefined);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
      }
    });
  }

  function saveEdit() {
    if (!editTarget) return;
    if (!form.title.trim()) {
      toast.error("Titel ist Pflicht");
      return;
    }
    if (!form.isDecorative && !form.altText.trim()) {
      toast.error("altText ist Pflicht (oder als dekorativ markieren)");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/pictures/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          altText: form.altText.trim(),
          isDecorative: form.isDecorative,
          caption: form.caption.trim() || null,
          takenAt: form.takenAt || null,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        toast.error(err.detail ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success("Gespeichert");
      setEditTarget(null);
      await load(search || undefined);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medien"
        description="Öffentliche Website-Medien (R2-Prefix public/). Referenziert → Archiv statt Löschen."
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Bild hochladen
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Titel, Caption, Dateiname…"
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-[#d9d2c4]"
            onClick={() => void load(search || undefined)}
          >
            Suchen
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Keine Bilder"
          description="Lade Fotos hoch oder importiere den pictures-Ordner."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-[#d9d2c4] bg-white shadow-sm"
            >
              <PictureThumb
                fileId={item.stored_file.id}
                title={item.title}
                onOpen={() => setLightboxIndex(index)}
              />
              <div className="space-y-2 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1f1f23]">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-[#8a8478]">
                    {[item.taken_at, item.stored_file.original_name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <AdminEditButton onClick={() => openEdit(item)} />
                  <AdminDeleteButton
                    iconOnly
                    onClick={() => setDeleteTarget(item)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PictureLightbox
        open={lightboxIndex != null}
        items={lightboxItems}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
      />

      <FormDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Bild hochladen"
        description="JPEG/PNG/WebP hochladen und Metadaten setzen."
        loading={pending}
        onSubmit={createPicture}
        submitLabel="Hochladen"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pic-file">Bilddatei</Label>
            <Input
              id="pic-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <PictureFields form={form} onChange={setForm} />
        </div>
      </FormDrawer>

      <FormDrawer
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        title="Bild bearbeiten"
        loading={pending}
        onSubmit={saveEdit}
      >
        <PictureFields form={form} onChange={setForm} />
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Bild entfernen?"
        description={
          deleteTarget
            ? deleteTarget.reference_count > 0
              ? `„${deleteTarget.title}“ wird verwendet und nur archiviert.`
              : `„${deleteTarget.title}“ wird gelöscht.`
            : undefined
        }
        confirmLabel={
          deleteTarget && deleteTarget.reference_count > 0
            ? "Archivieren"
            : "Löschen"
        }
        destructive
        loading={pending}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const res = await fetch(`/api/admin/pictures/${deleteTarget.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              toast.error("Aktion fehlgeschlagen");
              return;
            }
            const data = (await res.json().catch(() => ({}))) as {
              archived?: boolean;
            };
            toast.success(
              data.archived ? "Archiviert (noch referenziert)" : "Gelöscht",
            );
            setDeleteTarget(null);
            await load(search || undefined);
          });
        }}
      />
    </div>
  );
}

function PictureFields({
  form,
  onChange,
}: {
  form: PictureForm;
  onChange: (next: PictureForm) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pic-title">Titel</Label>
        <Input
          id="pic-title"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="pic-decorative"
          type="checkbox"
          checked={form.isDecorative}
          onChange={(e) =>
            onChange({
              ...form,
              isDecorative: e.target.checked,
              altText: e.target.checked ? "" : form.altText,
            })
          }
          className="size-4 rounded border-[#d9d2c4]"
        />
        <Label htmlFor="pic-decorative">Dekorativ (alt leer)</Label>
      </div>
      {!form.isDecorative ? (
        <div className="space-y-2">
          <Label htmlFor="pic-alt">Alt-Text (Pflicht)</Label>
          <Input
            id="pic-alt"
            value={form.altText}
            onChange={(e) => onChange({ ...form, altText: e.target.value })}
            placeholder="Kurzbeschreibung für Screenreader"
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="pic-date">Aufnahmedatum</Label>
        <Input
          id="pic-date"
          type="date"
          value={form.takenAt}
          onChange={(e) => onChange({ ...form, takenAt: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pic-caption">Beschreibung</Label>
        <Textarea
          id="pic-caption"
          value={form.caption}
          onChange={(e) => onChange({ ...form, caption: e.target.value })}
        />
      </div>
    </div>
  );
}
