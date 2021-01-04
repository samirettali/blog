import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";

import Layout from "../../components/layout";
import { getPostData, getPostsIds } from "../../lib/posts";
import Date from "../../components/date";
import styles from "./post.module.css";
import { useContext, useEffect, useState } from "react";
import 'prism-themes/themes/prism-material-oceanic.css'

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
  // console.log('DarkModeContext: ', DarkModeContext)
// const darkMode = false;
  // const { darkMode } = useContext(DarkModeContext);
  // const [theme, setTheme] = useState<string>("")
  // const theme = darkMode ? 'tomorrow' : 'solarizedlight';

  // useEffect(() => {
  // setTheme(darkMode ? "tomorrow" : "solarizedlight")
  // }, [])
  //
  // useEffect(() => {
  //   setTheme(darkMode ? "tomorrow" : "solarizedlight")
  //   console.log("Post detected dark Mode change", theme)
  // }, [darkMode])

  return (
    <Layout showBack>
      <Head>
        <title>{props.title}</title>
      </Head>
      <article className={styles.post + " post leading-relaxed"}>
        <h1 className="text-4xl font-bold mb-1">{props.title}</h1>
        <div className="text-gray-500 mb-8">
          <Date dateString={props.date.toLocaleString()} />
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: props.html as string }}
        />
      </article>
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
