import Date from './Date';
import styles from "../styles/article.module.css";

// TODO use it in light mode
// import 'base16-prism/themes/base16-default-light.css'
import 'base16-prism/themes/base16-tomorrow-night.css'

export type ArticleType = {
  id: string[];
  date: Date;
  title: string;
  tags: string[];
  content?: string;
  html: string;
  draft?: boolean | undefined;
};

interface ArticleProps {
  article: ArticleType
}

const Article = ({ article }: ArticleProps) => {
  const { title, date, html } = article;
  return (
    <article>
      <div className='post-header mb-8'>
        <h1 className="mb-1 text-4xl font-bold">{title}</h1>
        <div className="text-gray-500">
          <Date dateString={date.toLocaleString()} />
        </div>
      </div>
      <div
        className={styles.article}
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
    </article>
  );
};

export default Article;
