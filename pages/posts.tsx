import Head from "next/head";

import Layout, { siteTitle } from "../components/layout";
import { getSortedContent } from "../lib/posts";
import Date from "../components/Date";
import ArticlesList from '../components/ArticlesList';
import { ArticleType } from "../components/Article";
import { generateRss } from "../lib/rss";

type PostProps = {
  posts: ArticleType[];
};

const Posts = ({ posts }: PostProps) => {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className="text-xl">
        <h2 className="text-4xl">Posts</h2>
        <ArticlesList articles={posts} />
      </section>
    </Layout>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const posts = getSortedContent("posts");
  return {
    props: {
      posts,
    },
  };
};
