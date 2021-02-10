import Date from "./Date";
import styles from "../styles/article.module.css";

import "base16-prism/themes/base16-tomorrow-night.css";

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
  const { title, date, html } = article;
  return (
    <article>
      <div className="post-header mb-8 text-center">
        <h1 className="font-bold text-4xl mb-1">{title}</h1>
        <div className="text-gray-500 dark:text-gray-400">
          <Date dateString={date.toLocaleString()} />
        </div>
      </div>
      <div
        className={styles.article}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
};

export default Article;
