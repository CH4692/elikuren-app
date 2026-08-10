"use client";

import { ImageIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type PictureThumbProps = {
  fileId: string;
  title: string;
  /** When omitted, renders a non-interactive thumbnail. */
  onOpen?: () => void;
};

/**
 * Lazy-loads a signed preview URL when the card enters the viewport.
 * Uses a square crop (object-fit: cover) for a consistent admin grid.
 */
export function PictureThumb({ fileId, title, onOpen }: PictureThumbProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || url || failed) return;
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const res = await fetch(
          `/api/files/${fileId}/url?disposition=inline`,
        );
        if (!res.ok) throw new Error("url failed");
        const data = (await res.json()) as { url: string };
        if (!cancelled) setUrl(data.url);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, fileId, url, failed]);

  const className =
    "group relative block aspect-square w-full overflow-hidden bg-[#ebe4d8] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A24D] focus-visible:ring-offset-2";

  const content: ReactNode = (
    <>
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          style={{ imageOrientation: "from-image" } as CSSProperties}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#8a8478]">
          <ImageIcon className="size-7 opacity-60" />
          <span className="text-xs">
            {failed
              ? "Vorschau fehlgeschlagen"
              : loading || visible
                ? "Lädt…"
                : "—"}
          </span>
        </div>
      )}
      {onOpen ? (
        <>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
            Vergrößern
          </span>
        </>
      ) : null}
    </>
  );

  if (onOpen) {
    return (
      <button
        ref={(node) => {
          rootRef.current = node;
        }}
        type="button"
        onClick={onOpen}
        className={className}
        aria-label={`Vorschau: ${title}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
      }}
      className={className}
      aria-label={`Vorschau: ${title}`}
    >
      {content}
    </div>
  );
}
