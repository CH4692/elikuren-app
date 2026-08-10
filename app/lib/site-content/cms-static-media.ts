/**
 * Editorial images formerly served from /public.
 * Stable sourceKey → R2 object key `public/cms-static/{sourceKey}.{ext}`.
 * Never hardcode MediaAsset database IDs.
 */

export type CmsStaticMediaSlot =
  | {
      kind: "sectionField";
      pageKey: string;
      sectionKey: string;
      /** Dot path under section.data, e.g. "heroImage" or "portrait" */
      field: string;
      altText: string;
      isDecorative?: boolean;
    }
  | {
      kind: "listItemField";
      pageKey: string;
      sectionKey: string;
      /** Array field under section.data, e.g. "sponsors" or "cards" */
      listField: string;
      itemId: string;
      /** Field on the list item, e.g. "image" */
      field: string;
      altText: string;
      isDecorative?: boolean;
    }
  | {
      kind: "nestedListItemField";
      pageKey: string;
      sectionKey: string;
      outerListField: string;
      outerItemId: string;
      innerListField: string;
      innerItemId: string;
      field: string;
      altText: string;
      isDecorative?: boolean;
    };

export type CmsStaticMediaDef = {
  /** Stable external key (not a DB id). */
  sourceKey: string;
  /** Filename under app/public/ */
  publicFile: string;
  title: string;
  slots: CmsStaticMediaSlot[];
};

function objectKeyForSource(sourceKey: string, publicFile: string) {
  const ext = publicFile.includes(".")
    ? publicFile.split(".").pop()!.toLowerCase()
    : "bin";
  return `public/cms-static/${sourceKey}.${ext}`;
}

export function cmsStaticObjectKey(def: CmsStaticMediaDef) {
  return objectKeyForSource(def.sourceKey, def.publicFile);
}

/** All editorial /public images to import into MediaAsset. */
export const CMS_STATIC_MEDIA: CmsStaticMediaDef[] = [
  {
    sourceKey: "home-landing-hero",
    publicFile: "kammerchor.jpg",
    title: "CMS · Startseite Hero",
    slots: [
      {
        kind: "sectionField",
        pageKey: "home",
        sectionKey: "landing",
        field: "heroImage",
        altText: "Kammerchor Elikuren",
      },
      {
        kind: "sectionField",
        pageKey: "history",
        sectionKey: "hero",
        field: "backgroundImage",
        altText: "",
        isDecorative: true,
      },
    ],
  },
  {
    sourceKey: "chorleitung-portrait",
    publicFile: "chorleitung.jpg",
    title: "CMS · Chorleitung Portrait",
    slots: [
      {
        kind: "sectionField",
        pageKey: "home",
        sectionKey: "chorleitung",
        field: "portrait",
        altText: "Christiane Kampe",
      },
      {
        kind: "sectionField",
        pageKey: "chorleitung",
        sectionKey: "hero",
        field: "portrait",
        altText: "Christiane Kampe",
      },
    ],
  },
  {
    sourceKey: "home-ensemble-eight",
    publicFile: "eight-to-the-bar.jpg",
    title: "CMS · Home Ensemble Eight to the Bar",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "ensembles",
        listField: "cards",
        itemId: "seed_home_ens_eight",
        field: "image",
        altText: "Eight to the Bar",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_3",
        innerListField: "images",
        innerItemId: "seed_hist_trip_3_img_1",
        field: "image",
        altText: "Eight to the Bar",
      },
    ],
  },
  {
    sourceKey: "home-ensemble-elikuren",
    publicFile: "elikuren-ensemble.jpg",
    title: "CMS · Home Ensemble Elikuren",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "ensembles",
        listField: "cards",
        itemId: "seed_home_ens_elikuren",
        field: "image",
        altText: "Ensemble Elikuren",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_2",
        innerListField: "images",
        innerItemId: "seed_hist_trip_2_img_2",
        field: "image",
        altText: "Ensemble Elikuren",
      },
    ],
  },
  {
    sourceKey: "home-ensemble-musical",
    publicFile: "musical-team.jpg",
    title: "CMS · Home Musical Team",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "ensembles",
        listField: "cards",
        itemId: "seed_home_ens_musical",
        field: "image",
        altText: "Musical Team",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_3",
        innerListField: "images",
        innerItemId: "seed_hist_trip_3_img_2",
        field: "image",
        altText: "Musical Team",
      },
    ],
  },
  {
    sourceKey: "sponsor-goethe",
    publicFile: "goethe-institut.svg",
    title: "CMS · Sponsor Goethe-Institut",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "support",
        listField: "sponsors",
        itemId: "seed_sponsor_goethe",
        field: "image",
        altText: "Goethe-Institut",
      },
    ],
  },
  {
    sourceKey: "sponsor-sparkasse",
    publicFile: "sparkasse-wunstorf.png",
    title: "CMS · Sponsor Sparkasse Wunstorf",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "support",
        listField: "sponsors",
        itemId: "seed_sponsor_sparkasse",
        field: "image",
        altText: "Sparkasse Wunstorf",
      },
    ],
  },
  {
    sourceKey: "sponsor-musikschule",
    publicFile: "musik-schule-logo.png",
    title: "CMS · Sponsor Musikschule Wunstorf",
    slots: [
      {
        kind: "listItemField",
        pageKey: "home",
        sectionKey: "support",
        listField: "sponsors",
        itemId: "seed_sponsor_musikschule",
        field: "image",
        altText: "Musikschule Wunstorf",
      },
    ],
  },
  {
    sourceKey: "ensemble-elikuren-hero",
    publicFile: "elikuren_hero.jpg",
    title: "CMS · Ensemble Elikuren Hero",
    slots: [
      {
        kind: "sectionField",
        pageKey: "ensemble_elikuren",
        sectionKey: "hero",
        field: "heroImage",
        altText: "Ensemble Elikuren",
      },
      {
        kind: "sectionField",
        pageKey: "history",
        sectionKey: "intro",
        field: "image",
        altText: "Kammerchor Elikuren",
      },
    ],
  },
  {
    sourceKey: "ensemble-elikuren-gallery-1",
    publicFile: "elikuren_gallery_1.jpg",
    title: "CMS · Ensemble Elikuren Galerie 1",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_elikuren",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_elikuren_gallery_1",
        field: "image",
        altText: "Ensemble Elikuren",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_1",
        innerListField: "images",
        innerItemId: "seed_hist_ev_1_img_1",
        field: "image",
        altText: "Ensemble Elikuren",
      },
    ],
  },
  {
    sourceKey: "ensemble-elikuren-gallery-2",
    publicFile: "elikuren_gallery_2.jpg",
    title: "CMS · Ensemble Elikuren Galerie 2",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_elikuren",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_elikuren_gallery_2",
        field: "image",
        altText: "Ensemble Elikuren",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_1",
        innerListField: "images",
        innerItemId: "seed_hist_ev_1_img_2",
        field: "image",
        altText: "Ensemble Elikuren",
      },
    ],
  },
  {
    sourceKey: "ensemble-elikuren-gallery-3",
    publicFile: "elikuren_gallery_3.jpg",
    title: "CMS · Ensemble Elikuren Galerie 3",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_elikuren",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_elikuren_gallery_3",
        field: "image",
        altText: "Ensemble Elikuren",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_2",
        innerListField: "images",
        innerItemId: "seed_hist_ev_2_img_1",
        field: "image",
        altText: "Ensemble Elikuren",
      },
    ],
  },
  {
    sourceKey: "ensemble-eight-hero",
    publicFile: "eight-hero.jpg",
    title: "CMS · Eight to the Bar Hero",
    slots: [
      {
        kind: "sectionField",
        pageKey: "ensemble_eight",
        sectionKey: "hero",
        field: "heroImage",
        altText: "Eight to the Bar",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_2",
        innerListField: "images",
        innerItemId: "seed_hist_ev_2_img_2",
        field: "image",
        altText: "Eight to the Bar",
      },
    ],
  },
  {
    sourceKey: "ensemble-eight-gallery-1",
    publicFile: "eight_gallery_1.jpg",
    title: "CMS · Eight to the Bar Galerie 1",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_eight",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_eight_gallery_1",
        field: "image",
        altText: "Eight to the Bar",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_3",
        innerListField: "images",
        innerItemId: "seed_hist_ev_3_img_1",
        field: "image",
        altText: "Eight to the Bar",
      },
    ],
  },
  {
    sourceKey: "ensemble-eight-gallery-2",
    publicFile: "eight_gallery_2.jpg",
    title: "CMS · Eight to the Bar Galerie 2",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_eight",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_eight_gallery_2",
        field: "image",
        altText: "Eight to the Bar",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_3",
        innerListField: "images",
        innerItemId: "seed_hist_ev_3_img_2",
        field: "image",
        altText: "Eight to the Bar",
      },
    ],
  },
  {
    sourceKey: "ensemble-eight-gallery-3",
    publicFile: "eight_gallery_3.jpg",
    title: "CMS · Eight to the Bar Galerie 3",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_eight",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_eight_gallery_3",
        field: "image",
        altText: "Eight to the Bar",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_1",
        innerListField: "images",
        innerItemId: "seed_hist_trip_1_img_1",
        field: "image",
        altText: "Eight to the Bar",
      },
    ],
  },
  {
    sourceKey: "ensemble-musical-hero",
    publicFile: "musical_hero.jpeg",
    title: "CMS · Musical Team Hero",
    slots: [
      {
        kind: "sectionField",
        pageKey: "ensemble_musical",
        sectionKey: "hero",
        field: "heroImage",
        altText: "Musical Team",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_4",
        innerListField: "images",
        innerItemId: "seed_hist_ev_4_img_1",
        field: "image",
        altText: "Musical Team",
      },
    ],
  },
  {
    sourceKey: "ensemble-musical-gallery-1",
    publicFile: "musical_gallery_1.jpg",
    title: "CMS · Musical Team Galerie 1",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_musical",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_musical_gallery_1",
        field: "image",
        altText: "Musical Team",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "timeline",
        outerListField: "events",
        outerItemId: "seed_hist_ev_4",
        innerListField: "images",
        innerItemId: "seed_hist_ev_4_img_2",
        field: "image",
        altText: "Musical Team",
      },
    ],
  },
  {
    sourceKey: "ensemble-musical-gallery-2",
    publicFile: "musical_gallery_2.jpg",
    title: "CMS · Musical Team Galerie 2",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_musical",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_musical_gallery_2",
        field: "image",
        altText: "Musical Team",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_1",
        innerListField: "images",
        innerItemId: "seed_hist_trip_1_img_2",
        field: "image",
        altText: "Musical Team",
      },
    ],
  },
  {
    sourceKey: "ensemble-musical-gallery-3",
    publicFile: "musical_gallery_3.jpg",
    title: "CMS · Musical Team Galerie 3",
    slots: [
      {
        kind: "listItemField",
        pageKey: "ensemble_musical",
        sectionKey: "gallery",
        listField: "items",
        itemId: "seed_musical_gallery_3",
        field: "image",
        altText: "Musical Team",
      },
      {
        kind: "nestedListItemField",
        pageKey: "history",
        sectionKey: "trips",
        outerListField: "items",
        outerItemId: "seed_hist_trip_2",
        innerListField: "images",
        innerItemId: "seed_hist_trip_2_img_1",
        field: "image",
        altText: "Musical Team",
      },
    ],
  },
];

export function mimeForPublicFile(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}
