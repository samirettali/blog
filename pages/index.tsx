import Head from "next/head";
import Link from "next/link"

import Layout, { siteTitle } from "../components/layout";
import { getBio } from "../lib/bio";
import { getConfig } from "../lib/config";
import Contacts from "../components/Contacts";
import { IPostProps } from "./posts/[id]";
import { getSortedContent } from "../lib/posts";

type ConfigType = {
  name: string;
  socials: { [key: string]: string }[];
};

type HomeProps = {
  config: ConfigType;
  shortBio: string;
};

const Home = ({ config, shortBio }: HomeProps) => {
  const { socials } = config;
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section
        className="bio text-lg leading-relaxed font-normal mb-16"
        dangerouslySetInnerHTML={{ __html: shortBio }}
      >

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
  const shortBio = await getBio("normal");
  const config = await getConfig();
  const posts = getSortedContent("posts");
  return {
    props: {
      config,
      shortBio,
      posts,
    },
  };
};
