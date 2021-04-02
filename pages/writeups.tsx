import Layout from "../components/layout";
import { getSortedContent } from "../lib/posts";
import ArticlesList from "../components/ArticlesList";
import { ArticleType } from "../components/Article";

type PostProps = {
  writeups: ArticleType[];
};

const Writeups = ({ writeups }: PostProps) => {
  return (
    <Layout title="Writeups">
      <section className="text-xl">
        <h2 className="text-4xl mb-8">Writeups</h2>
        <ArticlesList articles={writeups} />
      </section>
    </Layout>
  );
};

export default Writeups;

export const getStaticProps = async () => {
  const writeups = getSortedContent("writeups");
  return {
    props: {
      writeups,
    },
  };
};
