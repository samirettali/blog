import Router from "next/router";
import Navbar from "./Navbar";

interface LayoutProps {
  showBack?: boolean;
  showNavbar?: boolean;
  navbarPositon?: "top" | "bottom";
  containerClassname?: string;
  contentClassname?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showBack = false,
  showNavbar = true,
  containerClassname,
  contentClassname
 }) => {
  return (
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
  );
};

export default Layout;
