"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ContentSettings, GalleryImageDTO, LayoutSettings } from "@/lib/types";
import Reveal from "./Reveal";

const PAGE_SIZE = 9;

/**
 * Masonry gallery (grid on mobile) with blur-up loading, hover zoom,
 * a keyboard-accessible lightbox and infinite loading.
 */
export default function Gallery({
  content,
  layout,
  initialImages,
  total,
}: {
  content: ContentSettings;
  layout: LayoutSettings;
  initialImages: GalleryImageDTO[];
  total: number;
}) {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = images.length < total;

  /* Infinite loading */
  const loadMore = useCallback(async () => {
    if (loading || images.length >= total) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/gallery?offset=${images.length}&limit=${PAGE_SIZE}`
      );
      if (res.ok) {
        const data: { images: GalleryImageDTO[] } = await res.json();
        setImages((prev) => {
          const known = new Set(prev.map((p) => p.id));
          return [...prev, ...data.images.filter((i) => !known.has(i.id))];
        });
      }
    } finally {
      setLoading(false);
    }
  }, [images.length, loading, total]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  /* Lightbox keyboard navigation */
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft")
        setLightbox((i) =>
          i === null ? null : (i - 1 + images.length) % images.length
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  const isMasonry = layout.galleryLayout === "masonry";

  /* Admin-controlled layout variables */
  const gapRem = { tight: "0.5rem", normal: "1.25rem", airy: "2rem" }[
    layout.galleryGap ?? "normal"
  ];
  const aspect = {
    square: "1 / 1",
    portrait: "3 / 4",
    landscape: "4 / 3",
  }[layout.galleryAspect ?? "square"];
  const galleryVars = {
    "--gallery-cols": layout.galleryColumns ?? 3,
    "--gallery-gap": gapRem,
  } as React.CSSProperties;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-14 text-center">
          <p className="kicker">{content.galleryKicker}</p>
          <h2
            id="gallery-heading"
            className="mt-5 text-4xl tracking-tight text-fg sm:text-5xl"
          >
            {content.galleryHeading}
          </h2>
          {content.galleryDescription && (
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted">
              {content.galleryDescription}
            </p>
          )}
        </Reveal>

        <ul
          className={
            isMasonry ? "masonry grid grid-cols-2 gap-3" : "gallery-grid"
          }
          style={galleryVars}
          aria-label="Photo gallery"
        >
          {images.map((image, index) => (
            <li key={image.id}>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setLightbox(index)}
                  aria-label={`Open image: ${image.caption || image.alt || "photo"}`}
                  className="img-zoom group relative block w-full overflow-hidden text-left"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || image.caption || "Gallery photograph"}
                    width={900}
                    height={isMasonry ? 1200 : 900}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    loading="lazy"
                    className={`w-full ${isMasonry ? "h-auto" : "object-cover"}`}
                    style={
                      isMasonry
                        ? { height: "auto" }
                        : { aspectRatio: aspect, height: "auto" }
                    }
                  />
                  {/* Caption veil */}
                  <span
                    className="pointer-events-none absolute inset-0 flex items-end opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--bg) 85%, transparent), transparent 55%)",
                    }}
                  >
                    {image.caption && (
                      <span className="block w-full px-4 pb-4 text-xs uppercase tracking-[0.2em] text-fg">
                        {image.caption}
                      </span>
                    )}
                  </span>
                </motion.button>
            </li>
          ))}
        </ul>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="mt-10 flex justify-center" aria-hidden={!hasMore}>
          {loading && (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-[var(--accent)]" />
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
            style={{ backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close viewer"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border text-fg transition-colors hover:text-accent"
              style={{ borderColor: "var(--border)" }}
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox - 1 + images.length) % images.length);
              }}
              aria-label="Previous image"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border text-fg transition-colors hover:text-accent sm:left-6"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((lightbox + 1) % images.length);
              }}
              aria-label="Next image"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border text-fg transition-colors hover:text-accent sm:right-6"
              style={{ borderColor: "var(--border)" }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <motion.figure
              key={images[lightbox].id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mx-4 max-h-[88vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightbox].url}
                alt={images[lightbox].alt || images[lightbox].caption || "Photograph"}
                className="max-h-[80vh] w-auto max-w-full object-contain"
                style={{ borderRadius: "var(--radius)" }}
              />
              {images[lightbox].caption && (
                <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-muted">
                  {images[lightbox].caption}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
