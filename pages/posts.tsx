import Head from "next/head";
import Link from "next/link";
import fs from 'fs';

import Layout, { siteTitle } from "../components/layout";
import { getSortedContent } from "../lib/posts";
import Date from "../components/Date";
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
        <ul className="list-none">
          {posts.map(({ id, date, title }, index) => (
              <li className="mb-4" key={index}>
              <Link href={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className="text-gray-500">
                <Date dateString={date.toLocaleString()} />
              </small>
            </li>
          ))}
        </ul>
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
