"use client";

import {
  CmsImageField,
  type CmsMediaRef,
} from "@/components/admin/cms/cms-image-field";
import { CmsLinkField } from "@/components/admin/cms/cms-link-field";
import { CmsListEditor } from "@/components/admin/cms/cms-list-editor";
import { CmsStringList } from "@/components/admin/cms/cms-string-list";
import { CmsTextInput } from "@/components/admin/cms/cms-text-input";
import {
  coerceCmsString,
  coerceCmsStringList,
} from "@/lib/site-content/cms-scalar";
import { newStableId } from "@/lib/site-content/normalize";

type Data = Record<string, unknown>;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown): string {
  return coerceCmsString(value);
}

function asMedia(value: unknown): CmsMediaRef {
  if (!value || typeof value !== "object") return null;
  const v = value as {
    mediaAssetId?: unknown;
    isDecorative?: unknown;
    altText?: unknown;
  };
  if (typeof v.mediaAssetId !== "string" || !v.mediaAssetId) return null;
  return {
    mediaAssetId: v.mediaAssetId,
    isDecorative: Boolean(v.isDecorative),
    altText: typeof v.altText === "string" ? v.altText : "",
  };
}

function patch(data: Data, key: string, value: unknown): Data {
  return { ...data, [key]: value };
}

type FormProps = {
  data: Data;
  onChange: (next: Data) => void;
};

function TitleTextCtaList({
  data,
  onChange,
  listKey,
  mode = "titleText",
}: FormProps & {
  listKey: string;
  mode?: "titleText" | "faq" | "cta";
}) {
  type Item = {
    id: string;
    title?: string;
    text?: string;
    question?: string;
    answer?: string;
    label?: string;
    href?: string;
    sortOrder: number;
  };
  const items = asArray<Item>(data[listKey]);
  return (
    <CmsListEditor
      items={items}
      onChange={(next) => onChange(patch(data, listKey, next))}
      createItem={() => {
        if (mode === "faq") {
          return {
            id: newStableId("faq"),
            question: "Neue Frage",
            answer: "",
            sortOrder: items.length,
          };
        }
        if (mode === "cta") {
          return {
            id: newStableId("cta"),
            label: "Neuer Link",
            href: "/home",
            sortOrder: items.length,
          };
        }
        return {
          id: newStableId("item"),
          title: "Neuer Eintrag",
          text: "",
          sortOrder: items.length,
        };
      }}
      addLabel="Eintrag hinzufügen"
      emptyTitle="Noch keine Einträge."
      itemLabel={(item, i) =>
        asString(item.title || item.question || item.label) || `Eintrag ${i + 1}`
      }
      renderItem={(item, index) => (
        <div className="space-y-3">
          {mode === "faq" ? (
            <>
              <CmsTextInput
                id={`${item.id}-q`}
                label="Frage"
                value={asString(item.question)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, question: v };
                  onChange(patch(data, listKey, next));
                }}
              />
              <CmsTextInput
                id={`${item.id}-a`}
                label="Antwort"
                multiline
                value={asString(item.answer)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, answer: v };
                  onChange(patch(data, listKey, next));
                }}
              />
            </>
          ) : mode === "cta" ? (
            <>
              <CmsTextInput
                id={`${item.id}-label`}
                label="Label"
                value={asString(item.label)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, label: v };
                  onChange(patch(data, listKey, next));
                }}
              />
              <CmsLinkField
                id={`${item.id}-href`}
                label="Link"
                value={asString(item.href)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, href: v };
                  onChange(patch(data, listKey, next));
                }}
              />
            </>
          ) : (
            <>
              <CmsTextInput
                id={`${item.id}-title`}
                label="Titel"
                value={asString(item.title)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, title: v };
                  onChange(patch(data, listKey, next));
                }}
              />
              <CmsTextInput
                id={`${item.id}-text`}
                label="Text"
                multiline
                value={asString(item.text)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, text: v };
                  onChange(patch(data, listKey, next));
                }}
              />
            </>
          )}
        </div>
      )}
    />
  );
}

function OrganizationForm({ data, onChange }: FormProps) {
  type Board = { id: string; text: string; sortOrder: number };
  const boardLines = asArray<Board>(data.boardLines);
  return (
    <div className="space-y-4">
      <CmsTextInput
        id="choirName"
        label="Chorname"
        value={asString(data.choirName)}
        onChange={(v) => onChange(patch(data, "choirName", v))}
      />
      <CmsTextInput
        id="legalName"
        label="Rechtlicher Name"
        value={asString(data.legalName)}
        onChange={(v) => onChange(patch(data, "legalName", v))}
      />
      <CmsTextInput
        id="email"
        label="E-Mail"
        type="email"
        value={asString(data.email)}
        onChange={(v) => onChange(patch(data, "email", v))}
      />
      <CmsTextInput
        id="phone"
        label="Telefon"
        value={asString(data.phone)}
        onChange={(v) => onChange(patch(data, "phone", v))}
        hint="Optional"
      />
      <CmsTextInput
        id="street"
        label="Straße"
        value={asString(data.street)}
        onChange={(v) => onChange(patch(data, "street", v))}
      />
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <CmsTextInput
          id="postalCode"
          label="PLZ"
          value={asString(data.postalCode)}
          onChange={(v) => onChange(patch(data, "postalCode", v))}
        />
        <CmsTextInput
          id="city"
          label="Ort"
          value={asString(data.city)}
          onChange={(v) => onChange(patch(data, "city", v))}
        />
      </div>
      <CmsTextInput
        id="country"
        label="Land"
        value={asString(data.country)}
        onChange={(v) => onChange(patch(data, "country", v))}
      />
      <CmsTextInput
        id="registerNumber"
        label="Vereinsregisternummer"
        value={asString(data.registerNumber)}
        onChange={(v) => onChange(patch(data, "registerNumber", v))}
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#1f1f23]">Vorstand</p>
        <CmsListEditor
          items={boardLines}
          onChange={(next) => onChange(patch(data, "boardLines", next))}
          createItem={() => ({
            id: newStableId("board"),
            text: "",
            sortOrder: boardLines.length,
          })}
          addLabel="Zeile hinzufügen"
          emptyTitle="Noch keine Vorstandszeilen."
          itemLabel={(item, i) => asString(item.text) || `Zeile ${i + 1}`}
          renderItem={(item, index) => (
            <CmsTextInput
              id={`${item.id}-text`}
              label="Text"
              value={asString(item.text)}
              onChange={(v) => {
                const next = [...boardLines];
                next[index] = { ...item, text: v };
                onChange(patch(data, "boardLines", next));
              }}
            />
          )}
        />
      </div>
      <CmsTextInput
        id="contentResponsible"
        label="Inhaltlich verantwortlich"
        multiline
        value={asString(data.contentResponsible)}
        onChange={(v) => onChange(patch(data, "contentResponsible", v))}
        hint="Optional; z. B. für Impressum."
      />
    </div>
  );
}

function NavigationForm({ data, onChange }: FormProps) {
  type Child = {
    id: string;
    label: string;
    href: string;
    visible: boolean;
    sortOrder: number;
  };
  type Item = {
    id: string;
    label: string;
    href?: string;
    visible: boolean;
    sortOrder: number;
    children?: Child[];
  };
  const items = asArray<Item>(data.items);

  return (
    <CmsListEditor
      items={items}
      onChange={(next) => onChange(patch(data, "items", next))}
      createItem={() => ({
        id: newStableId("nav"),
        label: "Neuer Menüpunkt",
        href: "/home",
        visible: true,
        sortOrder: items.length,
      })}
      addLabel="Menüpunkt hinzufügen"
      emptyTitle="Noch keine Navigationspunkte."
      itemLabel={(item) => asString(item.label) || "Menüpunkt"}
      confirmRemove
      renderItem={(item, index) => {
        const children = item.children ?? [];
        return (
          <div className="space-y-3">
            <CmsTextInput
              id={`${item.id}-label`}
              label="Label"
              value={asString(item.label)}
              onChange={(v) => {
                const next = [...items];
                next[index] = { ...item, label: v };
                onChange(patch(data, "items", next));
              }}
            />
            {children.length === 0 ? (
              <CmsLinkField
                id={`${item.id}-href`}
                label="Link"
                value={asString(item.href)}
                onChange={(v) => {
                  const next = [...items];
                  next[index] = { ...item, href: v };
                  onChange(patch(data, "items", next));
                }}
              />
            ) : (
              <p className="text-xs text-[#8a8478]">
                Übergeordnete Einträge mit Unterpunkten haben keinen eigenen Link.
              </p>
            )}
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-[#d9d2c4]"
                checked={item.visible}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = { ...item, visible: e.target.checked };
                  onChange(patch(data, "items", next));
                }}
              />
              Sichtbar
            </label>
            <div className="space-y-2 border-t border-[#ebe4d8] pt-3">
              <p className="text-sm font-medium text-[#1f1f23]">Unterpunkte</p>
              <CmsListEditor
                items={children}
                onChange={(nextChildren) => {
                  const next = [...items];
                  next[index] = {
                    ...item,
                    children: nextChildren,
                    href: nextChildren.length ? undefined : item.href || "/home",
                  };
                  onChange(patch(data, "items", next));
                }}
                createItem={() => ({
                  id: newStableId("navchild"),
                  label: "Unterpunkt",
                  href: "/about",
                  visible: true,
                  sortOrder: children.length,
                })}
                addLabel="Unterpunkt hinzufügen"
                emptyTitle="Keine Unterpunkte."
                itemLabel={(child) => asString(child.label) || "Unterpunkt"}
                renderItem={(child, childIndex) => (
                  <div className="space-y-3">
                    <CmsTextInput
                      id={`${child.id}-label`}
                      label="Label"
                      value={asString(child.label)}
                      onChange={(v) => {
                        const nextChildren = [...children];
                        nextChildren[childIndex] = { ...child, label: v };
                        const next = [...items];
                        next[index] = { ...item, children: nextChildren };
                        onChange(patch(data, "items", next));
                      }}
                    />
                    <CmsLinkField
                      id={`${child.id}-href`}
                      label="Link"
                      value={asString(child.href)}
                      onChange={(v) => {
                        const nextChildren = [...children];
                        nextChildren[childIndex] = { ...child, href: v };
                        const next = [...items];
                        next[index] = { ...item, children: nextChildren };
                        onChange(patch(data, "items", next));
                      }}
                    />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-[#d9d2c4]"
                        checked={child.visible}
                        onChange={(e) => {
                          const nextChildren = [...children];
                          nextChildren[childIndex] = {
                            ...child,
                            visible: e.target.checked,
                          };
                          const next = [...items];
                          next[index] = { ...item, children: nextChildren };
                          onChange(patch(data, "items", next));
                        }}
                      />
                      Sichtbar
                    </label>
                  </div>
                )}
              />
            </div>
          </div>
        );
      }}
    />
  );
}

function SocialForm({ data, onChange }: FormProps) {
  type Item = {
    id: string;
    label: string;
    url: string;
    visible: boolean;
    sortOrder: number;
  };
  const items = asArray<Item>(data.items);
  return (
    <CmsListEditor
      items={items}
      onChange={(next) => onChange(patch(data, "items", next))}
      createItem={() => ({
        id: newStableId("social"),
        label: "Neues Netzwerk",
        url: "https://",
        visible: true,
        sortOrder: items.length,
      })}
      addLabel="Link hinzufügen"
      emptyTitle="Noch keine Social-Media-Links."
      emptyDescription="Fügen Sie YouTube, Facebook, Instagram o. Ä. hinzu."
      itemLabel={(item) => asString(item.label) || "Social Link"}
      renderItem={(item, index) => (
        <div className="space-y-3">
          <CmsTextInput
            id={`${item.id}-label`}
            label="Plattform / Label"
            value={asString(item.label)}
            onChange={(v) => {
              const next = [...items];
              next[index] = { ...item, label: v };
              onChange(patch(data, "items", next));
            }}
          />
          <CmsLinkField
            id={`${item.id}-url`}
            label="URL"
            httpsOnly
            value={asString(item.url)}
            onChange={(v) => {
              const next = [...items];
              next[index] = { ...item, url: v };
              onChange(patch(data, "items", next));
            }}
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-[#d9d2c4]"
              checked={item.visible}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...item, visible: e.target.checked };
                onChange(patch(data, "items", next));
              }}
            />
            Sichtbar
          </label>
        </div>
      )}
    />
  );
}

function FooterForm({ data, onChange }: FormProps) {
  return (
    <div className="space-y-4">
      <CmsTextInput
        id="tagline"
        label="Tagline"
        value={asString(data.tagline)}
        onChange={(v) => onChange(patch(data, "tagline", v))}
      />
      <CmsTextInput
        id="copyrightLine"
        label="Copyright-Zeile"
        value={asString(data.copyrightLine)}
        onChange={(v) => onChange(patch(data, "copyrightLine", v))}
      />
      <CmsTextInput
        id="imprintLabel"
        label="Label Impressum"
        value={asString(data.imprintLabel)}
        onChange={(v) => onChange(patch(data, "imprintLabel", v))}
        hint="Der Link zu /impressum ist fest hinterlegt."
      />
      <CmsTextInput
        id="privacyLabel"
        label="Label Datenschutz"
        value={asString(data.privacyLabel)}
        onChange={(v) => onChange(patch(data, "privacyLabel", v))}
        hint="Der Link zu /datenschutz ist fest hinterlegt."
      />
    </div>
  );
}

function MediaListForm({
  data,
  onChange,
  listKey,
}: FormProps & { listKey: string }) {
  type Item = { id: string; image: CmsMediaRef; sortOrder: number };
  const items = asArray<Item>(data[listKey]).map((item) => ({
    ...item,
    image: asMedia(item.image),
  }));
  return (
    <CmsListEditor
      items={items}
      onChange={(next) => onChange(patch(data, listKey, next))}
      createItem={() => ({
        id: newStableId("img"),
        image: null,
        sortOrder: items.length,
      })}
      addLabel="Bild hinzufügen"
      emptyTitle="Noch keine Bilder."
      itemLabel={(_, i) => `Bild ${i + 1}`}
      renderItem={(item, index) => (
        <CmsImageField
          id={`${item.id}-image`}
          label="Bild"
          value={asMedia(item.image)}
          onChange={(v) => {
            const next = [...items];
            next[index] = { ...item, image: v };
            onChange(patch(data, listKey, next));
          }}
        />
      )}
    />
  );
}

function TimelineForm({ data, onChange }: FormProps) {
  type Img = { id: string; image: CmsMediaRef; sortOrder: number };
  type Event = {
    id: string;
    year: string;
    title: string;
    text: string;
    images: Img[];
    sortOrder: number;
  };
  const events = asArray<Event>(data.events);
  return (
    <div className="space-y-4">
      <CmsTextInput
        id="timeline-eyebrow"
        label="Eyebrow"
        value={asString(data.eyebrow)}
        onChange={(v) => onChange(patch(data, "eyebrow", v))}
      />
      <CmsTextInput
        id="timeline-title"
        label="Titel"
        value={asString(data.title)}
        onChange={(v) => onChange(patch(data, "title", v))}
      />
      <CmsListEditor
        items={events}
        onChange={(next) => onChange(patch(data, "events", next))}
        createItem={() => ({
          id: newStableId("event"),
          year: "",
          title: "",
          text: "",
          images: [],
          sortOrder: events.length,
        })}
        addLabel="Ereignis hinzufügen"
        emptyTitle="Noch keine Ereignisse."
        itemLabel={(item) =>
          [asString(item.year), asString(item.title)].filter(Boolean).join(" · ") ||
          "Ereignis"
        }
        renderItem={(item, index) => (
          <div className="space-y-3">
            <CmsTextInput
              id={`${item.id}-year`}
              label="Jahr"
              value={asString(item.year)}
              onChange={(v) => {
                const next = [...events];
                next[index] = { ...item, year: v };
                onChange(patch(data, "events", next));
              }}
            />
            <CmsTextInput
              id={`${item.id}-title`}
              label="Titel"
              value={asString(item.title)}
              onChange={(v) => {
                const next = [...events];
                next[index] = { ...item, title: v };
                onChange(patch(data, "events", next));
              }}
            />
            <CmsTextInput
              id={`${item.id}-text`}
              label="Text"
              multiline
              value={asString(item.text)}
              onChange={(v) => {
                const next = [...events];
                next[index] = { ...item, text: v };
                onChange(patch(data, "events", next));
              }}
            />
            <MediaListForm
              data={{ items: item.images }}
              listKey="items"
              onChange={(inner) => {
                const next = [...events];
                next[index] = {
                  ...item,
                  images: asArray<Img>(inner.items),
                };
                onChange(patch(data, "events", next));
              }}
            />
          </div>
        )}
      />
    </div>
  );
}

function TripsForm({ data, onChange }: FormProps) {
  type Img = { id: string; image: CmsMediaRef; sortOrder: number };
  type Trip = {
    id: string;
    year: string;
    location: string;
    text: string;
    images: Img[];
    sortOrder: number;
  };
  const items = asArray<Trip>(data.items);
  return (
    <div className="space-y-4">
      <CmsTextInput
        id="trips-eyebrow"
        label="Eyebrow"
        value={asString(data.eyebrow)}
        onChange={(v) => onChange(patch(data, "eyebrow", v))}
      />
      <CmsTextInput
        id="trips-title"
        label="Titel"
        value={asString(data.title)}
        onChange={(v) => onChange(patch(data, "title", v))}
      />
      <CmsTextInput
        id="trips-intro"
        label="Einleitung"
        multiline
        value={asString(data.intro)}
        onChange={(v) => onChange(patch(data, "intro", v))}
      />
      <CmsListEditor
        items={items}
        onChange={(next) => onChange(patch(data, "items", next))}
        createItem={() => ({
          id: newStableId("trip"),
          year: "",
          location: "",
          text: "",
          images: [],
          sortOrder: items.length,
        })}
        addLabel="Reise hinzufügen"
        emptyTitle="Noch keine Reisen."
        itemLabel={(item) =>
          [asString(item.year), asString(item.location)].filter(Boolean).join(" · ") ||
          "Reise"
        }
        renderItem={(item, index) => (
          <div className="space-y-3">
            <CmsTextInput
              id={`${item.id}-year`}
              label="Jahr"
              value={asString(item.year)}
              onChange={(v) => {
                const next = [...items];
                next[index] = { ...item, year: v };
                onChange(patch(data, "items", next));
              }}
            />
            <CmsTextInput
              id={`${item.id}-location`}
              label="Ort"
              value={asString(item.location)}
              onChange={(v) => {
                const next = [...items];
                next[index] = { ...item, location: v };
                onChange(patch(data, "items", next));
              }}
            />
            <CmsTextInput
              id={`${item.id}-text`}
              label="Text"
              multiline
              value={asString(item.text)}
              onChange={(v) => {
                const next = [...items];
                next[index] = { ...item, text: v };
                onChange(patch(data, "items", next));
              }}
            />
            <MediaListForm
              data={{ items: item.images }}
              listKey="items"
              onChange={(inner) => {
                const next = [...items];
                next[index] = {
                  ...item,
                  images: asArray<Img>(inner.items),
                };
                onChange(patch(data, "items", next));
              }}
            />
          </div>
        )}
      />
    </div>
  );
}

function ScalarFields({
  data,
  onChange,
  fields,
}: FormProps & {
  fields: Array<{
    key: string;
    label: string;
    multiline?: boolean;
    hint?: string;
    type?: string;
  }>;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <CmsTextInput
          key={field.key}
          id={field.key}
          label={field.label}
          hint={field.hint}
          multiline={field.multiline}
          type={field.type}
          value={asString(data[field.key])}
          onChange={(v) => onChange(patch(data, field.key, v))}
        />
      ))}
    </div>
  );
}

export function CmsSectionForm({
  pageKey,
  sectionKey,
  data,
  onChange,
}: {
  pageKey: string;
  sectionKey: string;
  data: Data;
  onChange: (next: Data) => void;
}) {
  const path = `${pageKey}/${sectionKey}`;
  const props = { data, onChange };

  switch (path) {
    case "global/organization":
      return <OrganizationForm {...props} />;
    case "global/navigation":
      return <NavigationForm {...props} />;
    case "global/social":
      return <SocialForm {...props} />;
    case "global/footer":
      return <FooterForm {...props} />;

    case "home/landing":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "title", label: "Titel" },
              { key: "tagline", label: "Tagline", multiline: true },
              { key: "ctaLabel", label: "CTA-Label" },
            ]}
          />
          <CmsLinkField
            id="ctaHref"
            label="CTA-Link"
            value={asString(data.ctaHref)}
            onChange={(v) => onChange(patch(data, "ctaHref", v))}
          />
          <CmsImageField
            id="heroImage"
            label="Hero-Bild"
            value={asMedia(data.heroImage)}
            onChange={(v) => onChange(patch(data, "heroImage", v))}
          />
        </div>
      );
    case "home/concerts_intro":
      return (
        <ScalarFields
          {...props}
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            {
              key: "emptyMessage",
              label: "Leer-Hinweis",
              multiline: true,
              hint: "Wird angezeigt, wenn keine öffentlichen Konzerte vorhanden sind.",
            },
          ]}
        />
      );
    case "home/ensembles": {
      type Card = {
        id: string;
        title: string;
        ctaLabel: string;
        href: string;
        image: CmsMediaRef;
        sortOrder: number;
      };
      const cards = asArray<Card>(data.cards);
      return (
        <div className="space-y-4">
          <CmsTextInput
            id="ensembles-headline"
            label="Überschrift"
            value={asString(data.headline)}
            onChange={(v) => onChange(patch(data, "headline", v))}
          />
          <CmsListEditor
            items={cards}
            onChange={(next) => onChange(patch(data, "cards", next))}
            createItem={() => ({
              id: newStableId("ensemble"),
              title: "Ensemble",
              ctaLabel: "Mehr erfahren",
              href: "/ensembles/elikuren",
              image: null,
              sortOrder: cards.length,
            })}
            addLabel="Karte hinzufügen"
            emptyTitle="Noch keine Ensemble-Karten."
            itemLabel={(item) => asString(item.title) || "Ensemble"}
            renderItem={(item, index) => (
              <div className="space-y-3">
                <CmsTextInput
                  id={`${item.id}-title`}
                  label="Titel"
                  value={asString(item.title)}
                  onChange={(v) => {
                    const next = [...cards];
                    next[index] = { ...item, title: v };
                    onChange(patch(data, "cards", next));
                  }}
                />
                <CmsTextInput
                  id={`${item.id}-cta`}
                  label="CTA-Label"
                  value={asString(item.ctaLabel)}
                  onChange={(v) => {
                    const next = [...cards];
                    next[index] = { ...item, ctaLabel: v };
                    onChange(patch(data, "cards", next));
                  }}
                />
                <CmsLinkField
                  id={`${item.id}-href`}
                  label="Link"
                  value={asString(item.href)}
                  onChange={(v) => {
                    const next = [...cards];
                    next[index] = { ...item, href: v };
                    onChange(patch(data, "cards", next));
                  }}
                />
                <CmsImageField
                  id={`${item.id}-image`}
                  label="Bild"
                  value={asMedia(item.image)}
                  onChange={(v) => {
                    const next = [...cards];
                    next[index] = { ...item, image: v };
                    onChange(patch(data, "cards", next));
                  }}
                />
              </div>
            )}
          />
        </div>
      );
    }
    case "home/chorleitung":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "eyebrow", label: "Eyebrow" },
              { key: "name", label: "Name" },
              { key: "body", label: "Text", multiline: true },
              { key: "ctaLabel", label: "CTA-Label" },
            ]}
          />
          <CmsLinkField
            id="home-chor-cta"
            label="CTA-Link"
            value={asString(data.ctaHref)}
            onChange={(v) => onChange(patch(data, "ctaHref", v))}
          />
          <CmsImageField
            id="home-chor-portrait"
            label="Porträt"
            value={asMedia(data.portrait)}
            onChange={(v) => onChange(patch(data, "portrait", v))}
          />
        </div>
      );
    case "home/support": {
      type Sponsor = {
        id: string;
        label: string;
        href: string;
        image: CmsMediaRef;
        sortOrder: number;
      };
      const sponsors = asArray<Sponsor>(data.sponsors);
      return (
        <div className="space-y-4">
          <CmsTextInput
            id="support-headline"
            label="Überschrift"
            value={asString(data.headline)}
            onChange={(v) => onChange(patch(data, "headline", v))}
            hint="Optional"
          />
          <CmsListEditor
            items={sponsors}
            onChange={(next) => onChange(patch(data, "sponsors", next))}
            createItem={() => ({
              id: newStableId("sponsor"),
              label: "Sponsor",
              href: "",
              image: null,
              sortOrder: sponsors.length,
            })}
            addLabel="Sponsor hinzufügen"
            emptyTitle="Noch keine Sponsoren."
            itemLabel={(item) => asString(item.label) || "Sponsor"}
            renderItem={(item, index) => (
              <div className="space-y-3">
                <CmsTextInput
                  id={`${item.id}-label`}
                  label="Name"
                  value={asString(item.label)}
                  onChange={(v) => {
                    const next = [...sponsors];
                    next[index] = { ...item, label: v };
                    onChange(patch(data, "sponsors", next));
                  }}
                />
                <CmsLinkField
                  id={`${item.id}-href`}
                  label="Link"
                  optional
                  httpsOnly={false}
                  value={asString(item.href)}
                  onChange={(v) => {
                    const next = [...sponsors];
                    next[index] = { ...item, href: v };
                    onChange(patch(data, "sponsors", next));
                  }}
                  hint="Optional"
                />
                <CmsImageField
                  id={`${item.id}-image`}
                  label="Logo"
                  value={asMedia(item.image)}
                  onChange={(v) => {
                    const next = [...sponsors];
                    next[index] = { ...item, image: v };
                    onChange(patch(data, "sponsors", next));
                  }}
                />
              </div>
            )}
          />
        </div>
      );
    }

    case "about/hero":
    case "proben/hero":
    case "contact/hero":
      return (
        <ScalarFields
          {...props}
          fields={[
            { key: "eyebrow", label: "Eyebrow" },
            { key: "title", label: "Titel" },
            { key: "intro", label: "Einleitung", multiline: true },
          ]}
        />
      );
    case "about/highlights":
    case "chorleitung/cards":
    case "proben/cards":
      return <TitleTextCtaList {...props} listKey="items" />;
    case "about/verein":
    case "chorleitung/handschrift":
    case "proben/cta":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "title", label: "Titel" },
              { key: "text", label: "Text", multiline: true },
            ]}
          />
          <TitleTextCtaList {...props} listKey="ctas" mode="cta" />
        </div>
      );

    case "chorleitung/hero":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "eyebrow", label: "Eyebrow" },
              { key: "name", label: "Name" },
              { key: "intro", label: "Einleitung", multiline: true },
            ]}
          />
          <CmsImageField
            id="chor-portrait"
            label="Porträt"
            value={asMedia(data.portrait)}
            onChange={(v) => onChange(patch(data, "portrait", v))}
          />
        </div>
      );

    case "history/hero":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "eyebrow", label: "Eyebrow" },
              { key: "title", label: "Titel" },
              { key: "text", label: "Text", multiline: true },
            ]}
          />
          <CmsImageField
            id="history-bg"
            label="Hintergrundbild"
            value={asMedia(data.backgroundImage)}
            onChange={(v) => onChange(patch(data, "backgroundImage", v))}
          />
          <TitleTextCtaList {...props} listKey="ctas" mode="cta" />
        </div>
      );
    case "history/intro":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "eyebrow", label: "Eyebrow" },
              { key: "title", label: "Titel" },
            ]}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#1f1f23]">Absätze</p>
            <CmsStringList
              items={coerceCmsStringList(data.paragraphs, "history/intro.paragraphs")}
              onChange={(next) => onChange(patch(data, "paragraphs", next))}
              addLabel="Absatz hinzufügen"
              emptyTitle="Noch keine Absätze."
              itemLabel={(i) => `Absatz ${i + 1}`}
            />
          </div>
          <CmsImageField
            id="history-intro-image"
            label="Bild"
            value={asMedia(data.image)}
            onChange={(v) => onChange(patch(data, "image", v))}
          />
        </div>
      );
    case "history/timeline":
      return <TimelineForm {...props} />;
    case "history/trips":
      return <TripsForm {...props} />;
    case "history/closing":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "eyebrow", label: "Eyebrow" },
              { key: "title", label: "Titel" },
              { key: "text", label: "Text", multiline: true },
              { key: "ctaLabel", label: "CTA-Label" },
            ]}
          />
          <CmsLinkField
            id="history-closing-cta"
            label="CTA-Link"
            value={asString(data.ctaHref)}
            onChange={(v) => onChange(patch(data, "ctaHref", v))}
          />
        </div>
      );

    case "proben/faq":
      return (
        <div className="space-y-4">
          <CmsTextInput
            id="faq-title"
            label="Titel"
            value={asString(data.title)}
            onChange={(v) => onChange(patch(data, "title", v))}
          />
          <TitleTextCtaList {...props} listKey="items" mode="faq" />
        </div>
      );

    case "contact/info":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "emailTitle", label: "E-Mail-Titel" },
              { key: "emailText", label: "E-Mail-Text", multiline: true },
              {
                key: "emailAddress",
                label: "Anzeige-E-Mail",
                type: "email",
                hint: "Leer lassen, um die Organisations-E-Mail zu verwenden.",
              },
              { key: "locationTitle", label: "Standort-Titel" },
              { key: "mitsingenTitle", label: "Mitsingen-Titel" },
              {
                key: "mitsingenText",
                label: "Mitsingen-Text",
                multiline: true,
              },
              { key: "mitsingenCtaLabel", label: "Mitsingen-CTA" },
              { key: "formEyebrow", label: "Formular-Eyebrow" },
              { key: "formTitle", label: "Formular-Titel" },
            ]}
          />
          <CmsLinkField
            id="mitsingenCtaHref"
            label="Mitsingen-Link"
            value={asString(data.mitsingenCtaHref)}
            onChange={(v) => onChange(patch(data, "mitsingenCtaHref", v))}
          />
        </div>
      );

    case "ensemble_elikuren/hero":
    case "ensemble_eight/hero":
    case "ensemble_musical/hero":
      return (
        <div className="space-y-4">
          <ScalarFields
            {...props}
            fields={[
              { key: "name", label: "Name" },
              { key: "eyebrow", label: "Eyebrow" },
              { key: "claim", label: "Claim" },
              { key: "intro", label: "Einleitung", multiline: true },
            ]}
          />
          <CmsImageField
            id="ensemble-hero"
            label="Hero-Bild"
            value={asMedia(data.heroImage)}
            onChange={(v) => onChange(patch(data, "heroImage", v))}
          />
        </div>
      );
    case "ensemble_elikuren/story":
    case "ensemble_eight/story":
    case "ensemble_musical/story": {
      type Para = { id: string; text: string; sortOrder: number };
      const paragraphs = asArray<Para>(data.paragraphs);
      return (
        <div className="space-y-4">
          <CmsTextInput
            id="story-subtitle"
            label="Untertitel"
            value={asString(data.subtitle)}
            onChange={(v) => onChange(patch(data, "subtitle", v))}
          />
          <CmsListEditor
            items={paragraphs}
            onChange={(next) => onChange(patch(data, "paragraphs", next))}
            createItem={() => ({
              id: newStableId("para"),
              text: "",
              sortOrder: paragraphs.length,
            })}
            addLabel="Absatz hinzufügen"
            emptyTitle="Noch keine Absätze."
            itemLabel={(_, i) => `Absatz ${i + 1}`}
            renderItem={(item, index) => (
              <CmsTextInput
                id={`${item.id}-text`}
                label="Text"
                multiline
                value={asString(item.text)}
                onChange={(v) => {
                  const next = [...paragraphs];
                  next[index] = { ...item, text: v };
                  onChange(patch(data, "paragraphs", next));
                }}
              />
            )}
          />
        </div>
      );
    }
    case "ensemble_elikuren/profile":
    case "ensemble_eight/profile":
    case "ensemble_musical/profile": {
      type Item = {
        id: string;
        title?: string;
        text: string;
        sortOrder: number;
      };
      const items = asArray<Item>(data.items);
      const highlights = asArray<Item>(data.highlights);
      return (
        <div className="space-y-6">
          <CmsTextInput
            id="profile-subtitle"
            label="Untertitel"
            value={asString(data.subtitle)}
            onChange={(v) => onChange(patch(data, "subtitle", v))}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#1f1f23]">Profilpunkte</p>
            <CmsListEditor
              items={items}
              onChange={(next) => onChange(patch(data, "items", next))}
              createItem={() => ({
                id: newStableId("profile"),
                title: "",
                text: "",
                sortOrder: items.length,
              })}
              addLabel="Punkt hinzufügen"
              emptyTitle="Noch keine Profilpunkte."
              itemLabel={(item, i) => asString(item.title) || `Punkt ${i + 1}`}
              renderItem={(item, index) => (
                <div className="space-y-3">
                  <CmsTextInput
                    id={`${item.id}-title`}
                    label="Titel"
                    value={asString(item.title)}
                    onChange={(v) => {
                      const next = [...items];
                      next[index] = { ...item, title: v };
                      onChange(patch(data, "items", next));
                    }}
                  />
                  <CmsTextInput
                    id={`${item.id}-text`}
                    label="Text"
                    multiline
                    value={asString(item.text)}
                    onChange={(v) => {
                      const next = [...items];
                      next[index] = { ...item, text: v };
                      onChange(patch(data, "items", next));
                    }}
                  />
                </div>
              )}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#1f1f23]">Highlights</p>
            <CmsListEditor
              items={highlights}
              onChange={(next) => onChange(patch(data, "highlights", next))}
              createItem={() => ({
                id: newStableId("hl"),
                text: "",
                sortOrder: highlights.length,
              })}
              addLabel="Highlight hinzufügen"
              emptyTitle="Noch keine Highlights."
              itemLabel={(item, i) => asString(item.text) || `Highlight ${i + 1}`}
              renderItem={(item, index) => (
                <CmsTextInput
                  id={`${item.id}-text`}
                  label="Text"
                  value={asString(item.text)}
                  onChange={(v) => {
                    const next = [...highlights];
                    next[index] = { ...item, text: v };
                    onChange(patch(data, "highlights", next));
                  }}
                />
              )}
            />
          </div>
        </div>
      );
    }
    case "ensemble_elikuren/gallery":
    case "ensemble_eight/gallery":
    case "ensemble_musical/gallery":
      return <MediaListForm {...props} listKey="items" />;
    case "ensemble_elikuren/cta":
    case "ensemble_eight/cta":
    case "ensemble_musical/cta":
      return (
        <ScalarFields
          {...props}
          fields={[
            { key: "title", label: "Titel" },
            { key: "text", label: "Text", multiline: true },
          ]}
        />
      );

    default:
      return (
        <p className="text-sm text-[#a94442]" role="alert">
          Für diesen Abschnitt ist noch kein Editor hinterlegt ({path}).
        </p>
      );
  }
}
