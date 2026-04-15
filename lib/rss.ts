import { getArticle, getFeedContent } from "./content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../constants";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function generateRssXml() {
  const summaries = await getFeedContent();
  const articles = await Promise.all(summaries.map((summary) => getArticle(summary.type, summary.slug)));
  const publishedArticles = articles.filter((article): article is NonNullable<typeof article> => Boolean(article));

  const items = publishedArticles
    .map((article) => {
      return `
        <item>
          <guid>${SITE_URL}${article.path}</guid>
          <title>${escapeXml(article.title)}</title>
          <link>${SITE_URL}${article.path}</link>
          <pubDate>${new Date(article.date).toUTCString()}</pubDate>
          <content:encoded><![CDATA[${article.html}]]></content:encoded>
        </item>
      `;
    })
    .join("");

  const lastBuildDate = publishedArticles[0]?.date ?? new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
    <channel>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
      <description>${escapeXml(SITE_DESCRIPTION)}</description>
      <language>en</language>
      <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
      <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
      ${items}
    </channel>
  </rss>`;
}
