import Link from "next/link";
import type { ArticleSummary } from "../lib/content";
import Date from "./Date";

interface ArticlesListProps {
  articles: ArticleSummary[];
}

export default function ArticlesList({ articles }: ArticlesListProps) {
  return (
    <ul className="list-none space-y-4">
      {articles.map(({ path, date, title }) => (
        <li className="text-slate-700 transition-colors hover:text-slate-500 dark:text-slate-300 dark:hover:text-slate-100" key={path}>
          <Link href={path}>{title}</Link>
          <br />
          <small className="text-slate-500 dark:text-slate-400">
            <Date dateString={date} />
          </small>
        </li>
      ))}
    </ul>
  );
}
