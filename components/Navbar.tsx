import Link from "next/link";
import { Moon, Sun } from 'react-feather'

import { useTheme } from "next-themes";

type NavbarProps = {
  className?: string;
  name: string;
  shortname: string;
  showHome?: boolean;
};

const Navbar = ({ className, name, shortname, showHome = true }: NavbarProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className={`my-8 ${className}`}>
      <nav className="flex items-center flex-wrap font-semibold text-lg">
        <div className="flex-grow">
          {showHome && (
            <Link href="/">
              <a className="inline-flex mr-4">
                Home
              </a>
            </Link>
          )}
        </div>
        <div className="flex items-center">
          <div className="px-3">
            <Link href="/writeups">
              <a>Writeups</a>
            </Link>
          </div>
          <div className="px-3">
            <Link href="/posts">
              <a>Posts</a>
            </Link>
          </div>
          <div
            className="block cursor-pointer transition pl-3"
            onClick={toggleTheme}
          >
            <a>{theme === "dark" ? <Moon /> : <Sun />}</a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
