import Head from "next/head";
import Router from 'next/router'

import Navbar from "./Navbar";

export const siteTitle = "Samir Ettali";

interface LayoutProps {
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showBack = false }) => {
  return (
    <div className="container mx-auto max-w-prose px-4">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Samir's blog" />
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=200px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg&widths=0&heights=0`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Navbar name="SE" />
      <main>{children}</main>
      {showBack && (
       <div className="my-12">
          {/* TODO improve */}
          {/* <Link href="/"> */}
            <a onClick={() => Router.back()}>← Back</a>
          {/* </Link> */}
        </div>
      )}
    </div>
  );
};

export default Layout;
