import Head from "next/head";

import Layout, { siteTitle } from "../components/layout";
import { getSortedContent } from "../lib/posts";
import Date from "../components/Date";
import ArticlesList from '../components/ArticlesList';
import { ArticleType } from "../components/Article";

type PostProps = {
  writeups: ArticleType[];
};

const Writeups = ({ writeups }: PostProps) => {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className="text-xl">
        <h2 className="text-4xl">Writeups</h2>
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
