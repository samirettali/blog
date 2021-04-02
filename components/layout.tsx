import Router from "next/router";
import Head from 'next/head'

import Navbar from "./Navbar";
import { title } from '../lib/utils'

interface LayoutProps {
  title?: string;
  showBack?: boolean;
  showNavbar?: boolean;
  containerClassname?: string;
  contentClassname?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title: pageTitle,
  showBack = false,
  showNavbar = true,
  containerClassname,
  contentClassname
 }) => {
  return (
    <>
      <Head>
        <title>{title(pageTitle)}</title>
      </Head>
      <div className={`container mx-auto max-w-3xl px-4 lg:px-6 text-base ${containerClassname}`}>
        {showNavbar && <Navbar />}
        <main className={contentClassname}>
          {children}
          {showBack && (
            <div className="my-12">
              <a className="cursor-pointer" onClick={() => Router.back()}>
                ← Back
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Layout;
