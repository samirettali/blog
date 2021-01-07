import path from "path";
import matter from "gray-matter";
import glob from "glob";

import markdownToHtml from "./markdown";
import { ArticleType } from "../components/Article";
import { CONTENT_PATH, IS_PROD } from '../constants'

type ContentType = "posts" | "writeups";

export const getArticlesIds = (type: ContentType) => {
  const directory = path.join(process.cwd(), CONTENT_PATH, type);
  const filenames = glob.sync(path.join(directory, "**/*.md")) as string[];
  return filenames.map((filename) => {
    const id = filename.replace(directory, "").replace(/\.md$/, "").slice(1).split('/');
    return {
      params: {
        id,
      },
    };
  });
};

export const getSortedContent = (type: ContentType): ArticleType[] => {
  const directory = path.join(process.cwd(), CONTENT_PATH, type);

  const filenames = glob.sync(path.join(directory, "**/*.md")) as string[];
  const posts = filenames.map((filename) => {
    const id = filename.replace(directory, "").replace(/\.md$/, "").slice(1);

    // Read markdown file as string
    const fullPath = filename;

    // Use gray-matter to parse the post metadata section
    const { data } = matter.read(fullPath);

    // Combine the data with the id
    const { title, date, tags, draft } = data;

    return {
      id,
      type,
      date,
      draft: !!draft,
      title: draft ? title + " (Draft)" : title,
      tags: tags || [],
    };
  }).filter(post => IS_PROD ? !post.draft : true);

  return posts.sort((a: ArticleType, b: ArticleType) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  }) as ArticleType[];
};

export const getFeedContent = () => {
  return getSortedContent("" as ContentType);
}

const getContentData = async (id: string[], filename: string) => {
  const contentPath = path.join(process.cwd(), CONTENT_PATH, filename);

  // Use gray-matter to parse the post metadata section
  const { content, data } = matter.read(contentPath);

  const { title, date, tags, draft } = data;

  // Use remark to convert markdown into HTML string
  const html = await markdownToHtml(content);

  // Combine the data with the id and contentHtml
  return {
    id,
    date,
    title,
    draft: !!draft,
    tags: tags || [],
    content,
    html,
  };
};

export const getArticleData = async (type: ContentType, id: string[]) => {
  const filename = path.join(type, ...id) + '.md';
  const data = await getContentData(id, filename);
  return {
    id,
    type,
    ...data
  } as unknown as ArticleType;
};
