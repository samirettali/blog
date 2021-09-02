import Link from "next/link";

import Date from "./Date";
import { ArticleType } from "./Article";

type ArticlesListProps = {
  articles: ArticleType[];
};

const ArticlesList = ({ articles }: ArticlesListProps) => {
  return (
    <ul className="list-none">
      {articles.map(({ id, type, date, title }) => {
        return (
          <li
            className="text-coolGray-700 hover:text-coolGray-500 mb-4"
            key={typeof id === 'string' ? id : id[0]}
          >
            <Link href={`/${type}/${id}`}>
              <a>{title}</a>
            </Link>
            <br />
            <small className="text-gray-500 dark:text-gray-400">
              <Date dateString={date.toLocaleString()} />
            </small>
          </li>
        );
      })}
    </ul>
  );
};

export default ArticlesList;
