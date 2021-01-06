import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Article from "../../components/Article";
import Layout from "../../components/layout";
import { getPostData, getPostsIds } from "../../lib/posts";

type IPostFile = {
  id: string;
};

export type IPostProps = {
  id: string;
  date: Date;
  title: string;
  tags: string[];
  content?: string;
  html?: string;
  draft?: boolean | undefined;
};

const Post = (props: IPostProps) => {
  return (
    <Layout showBack>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Article {...props} />
    </Layout>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths<IPostFile> = async () => {
  const ids = getPostsIds();
  return {
    paths: ids,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<IPostProps, IPostFile> = async ({
  params,
}) => {
  // TODO is ! needed?
  const post = await getPostData(params!.id);
  return {
    props: {
      ...post,
    },
  };
};
