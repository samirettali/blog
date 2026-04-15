import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { cache } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import rehypeStringify from "rehype-stringify";
import { CONTENT_PATH, IS_PROD } from "../constants";

export type ContentType = "posts" | "writeups";

type Frontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  draft?: boolean;
};

export type ArticleSummary = {
  type: ContentType;
  slug: string[];
  path: string;
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
};

export type ArticlePage = ArticleSummary & {
  content: string;
  html: string;
};

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeHighlight)
  .use(rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] })
  .use(rehypeStringify, { allowDangerousHtml: true });

const normalizeLegacyMarkdown = (content: string) => {
  return content
    .replace(/^\{\{<\s*highlight\s+([^\s>]+)[^>]*>\}\}$/gm, (_match, language: string) => {
      return `\n\n\`\`\`${language.toLowerCase()}\n`;
    })
    .replace(/^\{\{<\s*\/\s*highlight\s*>\}\}$/gm, "```")
    .replace(/^\{\{<\/\s*highlight\s*>\}\}$/gm, "```")
    .replace(/^\{\{<\s*\/highlight\s*>\}\}$/gm, "```")
    .replace(/^\{\{<\s*youtube\s+([^\s>]+)\s*>\}\}$/gm, (_match, videoId: string) => {
      return `\n<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>\n`;
    });
};

const sortArticles = <T extends ArticleSummary>(articles: T[]) => {
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getTypeDirectory = (type: ContentType) => path.join(process.cwd(), CONTENT_PATH, type);

export const getArticleSlugs = cache(async (type: ContentType) => {
  const directory = getTypeDirectory(type);
  const filenames = await fg("**/*.md", { cwd: directory });
  return filenames.map((filename) => filename.replace(/\.md$/, "").split("/"));
});

export const getSortedContent = cache(async (type: ContentType): Promise<ArticleSummary[]> => {
  const directory = getTypeDirectory(type);
  const filenames = await fg("**/*.md", { cwd: directory });

  const articles = await Promise.all(
    filenames.map(async (filename) => {
      const fullPath = path.join(directory, filename);
      const { data } = matter(await fs.readFile(fullPath, "utf8"));
      const frontmatter = data as Frontmatter;
      const slug = filename.replace(/\.md$/, "").split("/");
      const draft = Boolean(frontmatter.draft);

      return {
        type,
        slug,
        path: `/${type}/${slug.join("/")}`,
        title: draft && frontmatter.title ? `${frontmatter.title} (Draft)` : frontmatter.title ?? slug.at(-1) ?? "Untitled",
        date: frontmatter.date ?? "1970-01-01",
        tags: frontmatter.tags ?? [],
        draft,
      } satisfies ArticleSummary;
    }),
  );

  return sortArticles(articles.filter((article) => (IS_PROD ? !article.draft : true)));
});

export const getArticle = cache(async (type: ContentType, slug: string[]): Promise<ArticlePage | null> => {
  const filename = path.join(getTypeDirectory(type), `${slug.join("/")}.md`);

  try {
    const source = await fs.readFile(filename, "utf8");
    const { content, data } = matter(source);
    const frontmatter = data as Frontmatter;
    const draft = Boolean(frontmatter.draft);

    if (IS_PROD && draft) {
      return null;
    }

    const normalizedContent = normalizeLegacyMarkdown(content);
    const html = String(await markdownProcessor.process(normalizedContent));

    return {
      type,
      slug,
      path: `/${type}/${slug.join("/")}`,
      title: draft && frontmatter.title ? `${frontmatter.title} (Draft)` : frontmatter.title ?? slug.at(-1) ?? "Untitled",
      date: frontmatter.date ?? "1970-01-01",
      tags: frontmatter.tags ?? [],
      draft,
      content: normalizedContent,
      html,
    };
  } catch {
    return null;
  }
});

export const renderPageContent = cache(async (filename: string) => {
  const fullPath = path.join(process.cwd(), CONTENT_PATH, filename);
  const source = await fs.readFile(fullPath, "utf8");
  return String(await markdownProcessor.process(normalizeLegacyMarkdown(source)));
});

export const getFeedContent = cache(async () => {
  const [posts, writeups] = await Promise.all([getSortedContent("posts"), getSortedContent("writeups")]);
  return sortArticles([...posts, ...writeups]);
});
