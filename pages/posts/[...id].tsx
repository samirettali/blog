import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Article, { ArticleType } from "../../components/Article";
import Layout from "../../components/layout";
import { getArticleData, getArticlesIds } from "../../lib/posts";

type IPostFile = {
  id: string[];
};

export type PostProps = {
  post: ArticleType;
};

const Post = ({ post }: PostProps) => {
  return (
    <Layout showBack>
      <Head>
        <title>{post.title}</title>
      </Head>
      <Article article={post} />
    </Layout>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths<IPostFile> = async () => {
  const ids = getArticlesIds('posts');
  return {
    paths: ids,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PostProps, IPostFile> = async ({
  params,
}) => {
  // TODO is ! needed?
  const post = await getArticleData('posts', params!.id);
  return {
    props: {
      post,
    },
  };
};
