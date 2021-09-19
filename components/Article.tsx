import { useTheme } from "next-themes";

import Date from "./Date";
import styles from "../styles/article.module.css";
import syntaxTheme from "../styles/syntax";

export type ArticleType = {
  type: "posts" | "writeups";
  id: string | string[];
  date: Date;
  title: string;
  tags: string[];
  content?: string;
  html?: string;
  draft?: boolean | undefined;
};

interface ArticleProps {
  article: ArticleType;
}

const Article = ({ article }: ArticleProps) => {
  const { theme } = useTheme();
  const { title, date, html } = article;

  return (
    <article>
      <div className="post-header mb-8 mt-6 text-center">
        <h1 className="font-bold text-4xl mb-3">{title}</h1>
        <div className="text-gray-500 dark:text-gray-400">
          <Date dateString={date.toLocaleString()} />
        </div>
      </div>
      <article
        className={styles.article}
        // className="prose-blue prose lg:prose-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{syntaxTheme}</style>
    </article>
  );
};

export default Article;
