import { getSiteData } from "@/lib/data";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Gallery from "@/components/site/Gallery";
import Footer from "@/components/site/Footer";

export const dynamic = "force-dynamic";

const INITIAL_GALLERY_PAGE = 9;

export default async function HomePage() {
  const data = await getSiteData();
  const { content, layout, seo, socials } = data;
  const visibleGallery = data.gallery.filter((g) => g.visible);

  /** Schema.org Person JSON-LD for rich results. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.name,
    description: seo.description,
    jobTitle: seo.jobTitle,
    image: content.heroImage,
    ...(seo.canonicalUrl ? { url: seo.canonicalUrl } : {}),
    sameAs: socials.filter((s) => s.visible).map((s) => s.url),
  };

  const sections = layout.sections.filter((s) => s.visible);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar name={content.name} />
      <main id="main">
        {sections.map((section) => {
          switch (section.id) {
            case "hero":
              return <Hero key="hero" content={content} layout={layout} />;
            case "about":
              return <About key="about" content={content} socials={socials} />;
            case "gallery":
              return (
                <Gallery
                  key="gallery"
                  content={content}
                  layout={layout}
                  initialImages={visibleGallery.slice(0, INITIAL_GALLERY_PAGE)}
                  total={visibleGallery.length}
                />
              );
            default:
              return null;
          }
        })}
      </main>
      <Footer content={content} socials={socials} />
    </>
  );
}
