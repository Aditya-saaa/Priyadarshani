"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
];

/**
 * Sticky transparent navbar with scroll-aware glass background,
 * active-section highlighting and a mobile menu.
 */
export default function Navbar({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const link of LINKS) {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl border-b"
          : "bg-transparent border-b border-transparent"
      }`}
      style={
        scrolled
          ? {
              backgroundColor: "color-mix(in srgb, var(--bg) 72%, transparent)",
              borderColor: "var(--border)",
            }
          : undefined
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <button
          onClick={() => go("home")}
          className="font-display text-lg tracking-wide text-fg"
          aria-label="Go to top"
        >
          {name.split(" ")[0]}
          <span className="text-accent">.</span>
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => go(link.id)}
                aria-current={active === link.id ? "page" : undefined}
                className={`relative text-[0.78rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                  active === link.id
                    ? "text-accent"
                    : "text-muted hover:text-fg"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-1/2 h-px -translate-x-1/2 bg-accent transition-all duration-500 ${
                    active === link.id ? "w-full" : "w-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="border-b backdrop-blur-xl md:hidden"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <ul className="space-y-1 px-6 py-4">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => go(link.id)}
                    className={`block w-full py-3 text-left text-sm uppercase tracking-[0.22em] ${
                      active === link.id ? "text-accent" : "text-muted"
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
