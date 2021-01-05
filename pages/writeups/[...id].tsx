import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Article from '../../components/Article'
import Layout from "../../components/layout";
import { getWriteupData, getWriteupsIds } from "../../lib/posts";

import 'prism-themes/themes/prism-material-oceanic.css'

type IWriteupFile = {
  id: string[];
};

export type IWriteupProps = {
  id: string[];
  date: Date;
  title: string;
  tags: string[];
  content?: string;
  html?: string;
  draft: boolean;
};

const Writeup = (props: IWriteupProps) => {
  return (
    <Layout showBack>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Article {...props} />
    </Layout>
  );
};

export default Writeup;

export const getStaticPaths: GetStaticPaths<IWriteupFile> = async () => {
  const ids = getWriteupsIds();
  return {
    paths: ids,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<IWriteupProps, IWriteupFile> = async ({
  params,
}) => {
  // TODO is ! needed?
  const post = await getWriteupData(params!.id);
  return {
    props: {
      ...post,
    },
  };
};
