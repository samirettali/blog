import Head from "next/head";
import Link from "next/link"

import Layout, { siteTitle } from "../components/layout";
import { getConfig } from "../lib/config";
import Contacts from "../components/Contacts";
import styles from '../styles/home.module.css';
import About from '../content/about.mdx'
import { generateRss } from "../lib/rss";
import { getFeedContent } from "../lib/posts";

type ConfigType = {
  name: string;
  socials: { [key: string]: string }[];
};

type HomeProps = {
  config: ConfigType;
};

const Home = ({ config }: HomeProps) => {
  const { socials } = config;
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section
        className={styles.bio + " mb-16"}
      >
        <About />
      </section>
      {socials && (
        <div className="">
          <Contacts socials={socials} />
        </div>
      )}
    </Layout>
  );
};

export default Home;

export const getStaticProps = async () => {
  const config = await getConfig();
  const posts = getFeedContent();
  await generateRss(posts);
  return {
    props: {
      config,
    },
  };
};
