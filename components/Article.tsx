import Date from './Date';
import styles from "../styles/article.module.css";

export type ArticleProps = {
  id: string | string[];
  date: Date;
  title: string;
  tags: string[];
  content?: string;
  html?: string;
  draft?: boolean | undefined;
};

const Article = ({title, date, html}: ArticleProps) => {
  return (
      <article>
        <div className='post-header mb-8'>
          <h1 className="mb-1 text-4xl font-bold">{title}</h1>
          <div className="text-gray-500">
            <Date dateString={date.toLocaleString()} />
          </div>
        </div>
        <div
          className={styles['post-body']}
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      </article>
  );
};

export default Article;
