import type { ArticlePage } from "../lib/content";
import Date from "./Date";

interface ArticleProps {
  article: ArticlePage;
}

export default function Article({ article }: ArticleProps) {
  return (
    <article>
      <header className="mb-8 mt-6 text-center">
        <h1 className="mb-3 text-4xl font-bold">{article.title}</h1>
        <div className="text-slate-500 dark:text-slate-400">
          <Date dateString={article.date} />
        </div>
      </header>
      <div
        className="prose prose-slate prose-lg max-w-none dark:prose-invert dark:prose-headings:text-slate-100 dark:prose-p:text-slate-100 dark:prose-li:text-slate-100 dark:prose-strong:text-white dark:prose-blockquote:text-slate-200 dark:prose-code:text-slate-100"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
    </article>
  );
}
