import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Article, { ArticleType } from '../../components/Article'
import Layout from "../../components/layout";
import { getArticlesIds, getArticleData,  } from "../../lib/posts";

type IWriteupFile = {
  id: string[];
};

export type WriteupProps = {
  writeup: ArticleType
};

const Writeup = ({ writeup }: WriteupProps) => {
  return (
    <Layout showBack>
      <Head>
        <title>{writeup.title}</title>
      </Head>
      <Article article={writeup} />
    </Layout>
  );
};

export default Writeup;

export const getStaticPaths: GetStaticPaths<IWriteupFile> = async () => {
  const ids = getArticlesIds('writeups');
  return {
    paths: ids,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<WriteupProps, IWriteupFile> = async ({
  params,
}) => {
  // TODO is ! needed?
  const writeup = await getArticleData('writeups', params!.id);
  return {
    props: {
      writeup
    },
  };
};
