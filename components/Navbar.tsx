import Link from "next/link";
import { Moon, Sun } from 'react-feather'

import { useTheme } from "next-themes";
import { useRouter } from "next/router";

type NavbarProps = {
  className?: string;
  showHome?: boolean;
  showToggler?: boolean;
};

const Navbar = ({ className, showHome = true, showToggler = true }: NavbarProps) => {
  const { theme, setTheme } = useTheme();

  const router = useRouter();
  console.log(router.asPath);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className={`my-8 ${className ?? ''}`}>
      <nav className="flex items-center flex-wrap">
        <div className="flex-grow">
          {showHome && (
            <Link href="/">
              <a className="inline-flex mr-4 nav-brand">
                SE
              </a>
            </Link>
          )}
        </div>
        <div className="flex items-center">
          <div className="px-3">
            <Link href="/writeups">
              <a className={`${router.asPath === '/writeups' ? 'nav-link-active' : 'nav-link'}`}>
                Writeups
              </a>
            </Link>
          </div>
          <div className={showToggler ? "px-3" : null}>
            <Link href="/posts">
              <a className={`${router.asPath === '/posts' ? 'nav-link-active' : 'nav-link'}`}>
                Posts
              </a>
            </Link>
          </div>
          {showToggler && (
            <div
              className="block cursor-pointer pl-3"
              onClick={toggleTheme}
            >
              <a className='nav-link'>{theme === "dark" ? <Moon /> : <Sun />}</a>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
