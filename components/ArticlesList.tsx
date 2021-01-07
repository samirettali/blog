import Link from 'next/link'

import Date from './Date'
import { ArticleType } from "./Article";

type ArticlesListProps = {
  articles: ArticleType[];
};

const ArticlesList = ({ articles }: ArticlesListProps) => {
  return (
    <ul className="list-none">
      {articles.map(({ id, type, date, title }, index) => {
        return (
          <li className="mb-4" key={index}>
            <Link href={`/${type}/${id}`}>
              <a>{title}</a>
            </Link>
            <br />
            <small className="text-gray-500">
              <Date dateString={date.toLocaleString()} />
            </small>
          </li>
        );
      })}
    </ul>
  );
};

export default ArticlesList;
