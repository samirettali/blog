import Head from "next/head";
import Link from "next/link";

import Layout, { siteTitle } from "../components/layout";
import { getSortedContent } from "../lib/posts";
import Date from "../components/Date";
import { IPostProps } from "./posts/[id]";

type PostProps = {
  writeups: IPostProps[];
};

const Writeups = ({ writeups }: PostProps) => {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className="text-xl">
        <h2 className="text-4xl">Writeups</h2>
        <ul className="list-none">
          {writeups.map(({ id, date, title }) => (
            <li className="mb-4" key={id}>
              <Link href={`/writeups/${id}`}>
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

export default Writeups;

export const getStaticProps = async () => {
  const writeups = getSortedContent("writeups");
  return {
    props: {
      writeups,
    },
  };
};
