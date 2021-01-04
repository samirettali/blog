import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Layout from "../../components/layout";
import { getContentIds, getWriteupData, getWriteupsIds } from "../../lib/posts";
import Date from "../../components/date";
import styles from "./post.module.css";
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
    <Layout>
      <Head>
        <title>{props.title}</title>
      </Head>
      <article className={styles.post + " post"}>
        <h1 className="text-4xl font-bold mb-1">{props.title}</h1>
        <div className="text-gray-500 mb-8">
          <Date dateString={props.date.toLocaleString()} />
        </div>
        <div
          className="text-base"
          dangerouslySetInnerHTML={{ __html: props.html as string }}
        />
      </article>
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
