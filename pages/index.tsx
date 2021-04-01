import Head from "next/head";
import Link from "next/link"

import Layout, { siteTitle } from "../components/layout";
import { getConfig } from "../lib/config";
import Contacts from "../components/Contacts";
import styles from '../styles/home.module.css';
import About from '../content/about.mdx'
import { generateRss } from "../lib/rss";
import { getFeedContent } from "../lib/posts";
import Navbar from "../components/Navbar";

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
    <>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className='flex justify-center min-w-screen min-h-screen items-center'>
        <main className='max-w-2xl px-8 text-2xl leading-relaxed tracking-wide'>
          <div className='text-4xl mb-8 font-medium'>
            Samir Ettali
          </div>
          <div>
            <p>Hi! I'm a Web Developer from Turin, Italy.</p>
            <p>I'm deeply passionate about software development, blockchain technology and I love Neovim.</p>
          </div>
          <Navbar name="SE" shortname='SE' showHome={false} className='mb-0'/>
        </main>
      </div>
    </>
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
