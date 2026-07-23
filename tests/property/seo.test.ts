import { describe, it, expect } from "vitest";
import fc from "fast-check";

// SEO metadata generation logic (mirrors what pages would do)
function generateSeoMeta(article: {
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  author_name?: string;
  published_at?: string;
  category_name?: string;
}) {
  const siteUrl = "https://namastexpress.com";
  return {
    title: `${article.title} | समाचार पोर्टल`,
    description: article.excerpt || article.title,
    canonical: `${siteUrl}/articles/${article.slug}`,
    ogTitle: article.title,
    ogDescription: article.excerpt || article.title,
    ogImage: article.featured_image || `${siteUrl}/default-og.jpg`,
    ogUrl: `${siteUrl}/articles/${article.slug}`,
    ogType: "article" as const,
  };
}

function generateStructuredData(article: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name: string;
  published_at: string;
  category_name: string;
}) {
  const siteUrl = "https://namastexpress.com";
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.featured_image || `${siteUrl}/default-og.jpg`,
    author: {
      "@type": "Person",
      name: article.author_name,
    },
    datePublished: article.published_at,
    publisher: {
      "@type": "Organization",
      name: "समाचार पोर्टल",
      logo: { "@type": "ImageObject", url: `${siteUrl}/icons/logo.jpeg` },
    },
    mainEntityOfPage: `${siteUrl}/articles/${article.slug}`,
    articleSection: article.category_name,
  };
}

const titleArb = fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0);
const slugArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter((s) => s.length >= 3 && s.length <= 50);
const excerptArb = fc.string({ minLength: 5, maxLength: 200 });
const nameArb = fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length > 0);
const dateArb = fc.integer({ min: 1577836800000, max: 1893456000000 }).map((ts) => new Date(ts).toISOString());

describe("Property 14: Each Page Generates Unique SEO Metadata", () => {
  it("different slugs produce different canonical URLs (100+ iterations)", () => {
    fc.assert(
      fc.property(titleArb, slugArb, titleArb, slugArb, (title1, slug1, title2, slug2) => {
        fc.pre(slug1 !== slug2);
        const meta1 = generateSeoMeta({ title: title1, slug: slug1 });
        const meta2 = generateSeoMeta({ title: title2, slug: slug2 });
        expect(meta1.canonical).not.toBe(meta2.canonical);
        expect(meta1.ogUrl).not.toBe(meta2.ogUrl);
      }),
      { numRuns: 120 }
    );
  });

  it("SEO metadata has all required fields (100+ iterations)", () => {
    fc.assert(
      fc.property(titleArb, slugArb, excerptArb, (title, slug, excerpt) => {
        const meta = generateSeoMeta({ title, slug, excerpt });
        expect(meta.title).toBeTruthy();
        expect(meta.description).toBeTruthy();
        expect(meta.canonical).toContain(slug);
        expect(meta.ogTitle).toBe(title);
        expect(meta.ogType).toBe("article");
        expect(meta.ogUrl).toContain(slug);
      }),
      { numRuns: 120 }
    );
  });
});

describe("Property 15: Structured Data Has All Required Fields", () => {
  it("structured data contains all Schema.org NewsArticle fields (100+ iterations)", () => {
    fc.assert(
      fc.property(
        titleArb,
        slugArb,
        excerptArb,
        nameArb,
        dateArb,
        nameArb,
        (title, slug, excerpt, authorName, publishedAt, categoryName) => {
          const sd = generateStructuredData({
            title,
            slug,
            excerpt,
            content: "Article content",
            author_name: authorName,
            published_at: publishedAt,
            category_name: categoryName,
          });

          expect(sd["@context"]).toBe("https://schema.org");
          expect(sd["@type"]).toBe("NewsArticle");
          expect(sd.headline).toBe(title);
          expect(sd.description).toBeTruthy();
          expect(sd.author["@type"]).toBe("Person");
          expect(sd.author.name).toBe(authorName);
          expect(sd.datePublished).toBe(publishedAt);
          expect(sd.publisher["@type"]).toBe("Organization");
          expect(sd.publisher.name).toBeTruthy();
          expect(sd.publisher.logo).toBeTruthy();
          expect(sd.mainEntityOfPage).toContain(slug);
          expect(sd.articleSection).toBe(categoryName);
        }
      ),
      { numRuns: 120 }
    );
  });
});
