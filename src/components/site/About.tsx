import type { ContentSettings, SocialLinkDTO } from "@/lib/types";
import { SocialIcon } from "./social-icons";
import Reveal from "./Reveal";

/**
 * Editorial about section: biography, description, achievements,
 * optional pull-quote and managed social links.
 */
export default function About({
  content,
  socials,
}: {
  content: ContentSettings;
  socials: SocialLinkDTO[];
}) {
  const paragraphs = content.biography
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const visibleSocials = socials.filter((s) => s.visible);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="kicker">{content.aboutKicker}</p>
          <h2
            id="about-heading"
            className="mt-5 max-w-3xl text-4xl leading-[1.12] tracking-tight text-fg sm:text-5xl"
          >
            {content.aboutHeading}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* Biography */}
          <Reveal delay={0.1}>
            <div className="space-y-6 text-[1.02rem] leading-relaxed text-muted">
              {paragraphs.map((para, i) => (
                <p key={i} className={i === 0 ? "first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-accent" : undefined}>
                  {para}
                </p>
              ))}
              {content.description && (
                <p className="border-l-2 pl-5 italic text-fg/85" style={{ borderColor: "var(--accent)" }}>
                  {content.description}
                </p>
              )}
            </div>

            {/* Social links */}
            {visibleSocials.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-3" aria-label="Social media">
                {visibleSocials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label || social.platform}
                      className="group flex h-11 w-11 items-center justify-center border transition-all duration-500 hover:-translate-y-1"
                      style={{
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
                      }}
                    >
                      <SocialIcon
                        platform={social.platform}
                        className="h-[18px] w-[18px] text-muted transition-colors duration-300 group-hover:text-accent"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          {/* Achievements */}
          <Reveal delay={0.2}>
            <h3 className="text-xs uppercase tracking-[0.3em] text-muted">
              {content.achievementsHeading}
            </h3>
            <ul className="mt-6 space-y-4">
              {content.achievements.map((achievement, i) => (
                <li key={i} className="card p-5">
                  <p className="font-display text-lg text-fg">
                    {achievement.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {achievement.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Quote */}
        {content.quote && (
          <Reveal delay={0.1} className="mt-24">
            <figure className="mx-auto max-w-3xl text-center">
              <div className="hairline mx-auto mb-10 w-32" aria-hidden="true" />
              <blockquote className="font-display text-2xl leading-snug text-fg sm:text-3xl">
                &ldquo;{content.quote}&rdquo;
              </blockquote>
              {content.quoteAuthor && (
                <figcaption className="mt-6 text-xs uppercase tracking-[0.3em] text-accent">
                  — {content.quoteAuthor}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}
      </div>
    </section>
  );
}
