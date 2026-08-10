export type PublicNavChild = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
};

export type PublicNavItem = {
  id: string;
  label: string;
  href?: string;
  visible: boolean;
  sortOrder: number;
  children?: PublicNavChild[];
};

export type PublicSocialItem = {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  sortOrder: number;
};

/** Visible nav items in sort order (children filtered too). */
export function filterPublicNavigation(
  data: { items: PublicNavItem[] } | null | undefined,
): PublicNavItem[] {
  if (!data?.items?.length) return [];
  return [...data.items]
    .filter((item) => item.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      ...item,
      children: item.children
        ? [...item.children]
            .filter((child) => child.visible)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : undefined,
    }));
}

export function filterPublicSocial(
  data: { items: PublicSocialItem[] } | null | undefined,
): PublicSocialItem[] {
  if (!data?.items?.length) return [];
  return [...data.items]
    .filter((item) => item.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
