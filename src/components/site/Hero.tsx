"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ContentSettings, LayoutSettings } from "@/lib/types";

/**
 * Full-screen cinematic hero with editable image, name, subtitle,
 * elegant fade-in and a scroll indicator. Intentionally CTA-free.
 */
export default function Hero({
  content,
  layout,
}: {
  content: ContentSettings;
  layout: LayoutSettings;
}) {
  const centered = layout.heroAlignment === "center";

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-screen items-end overflow-hidden md:items-center"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={content.heroImage}
          alt={content.heroImageAlt || content.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Cinematic veil */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 35%, color-mix(in srgb, var(--bg) 25%, transparent) 70%, color-mix(in srgb, var(--bg) 45%, transparent) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      <div
        className={`relative z-10 mx-auto w-full max-w-6xl px-6 pb-28 md:pb-0 ${
          centered ? "text-center" : "text-left"
        }`}
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="kicker mb-6"
        >
          Official Website
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl leading-[1.05] tracking-tight text-fg sm:text-7xl lg:text-8xl"
        >
          {content.name}
        </motion.h1>

        {content.heroSubtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-6 text-sm uppercase tracking-[0.34em] text-muted sm:text-base ${
              centered ? "" : "max-w-xl"
            }`}
          >
            {content.heroSubtitle}
          </motion.p>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div
          className="flex h-12 w-7 items-start justify-center rounded-full border pt-2"
          style={{ borderColor: "color-mix(in srgb, var(--text) 35%, transparent)" }}
        >
          <span className="scroll-dot block h-2 w-[3px] rounded-full bg-accent" />
        </div>
      </motion.div>
    </section>
  );
}
