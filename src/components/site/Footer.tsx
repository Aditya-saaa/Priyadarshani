import type { ContentSettings, SocialLinkDTO } from "@/lib/types";
import { SocialIcon } from "./social-icons";

export default function Footer({
  content,
  socials,
}: {
  content: ContentSettings;
  socials: SocialLinkDTO[];
}) {
  const visible = socials.filter((s) => s.visible);
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--border)" }}
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <p className="font-display text-2xl text-fg">{content.name}</p>
        {visible.length > 0 && (
          <ul className="flex gap-5" aria-label="Social media">
            {visible.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label || s.platform}
                  className="text-muted transition-colors duration-300 hover:text-accent"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs tracking-wide text-muted">
          © {new Date().getFullYear()} {content.name}. {content.footerText}
        </p>
      </div>
    </footer>
  );
}
