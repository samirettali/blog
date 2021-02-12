import Link from "next/link";
import { Moon, Sun } from "heroicons-react";

import { useTheme } from "next-themes";

type NavbarProps = {
  name: string;
  shortname: string;
};

const Navbar = ({ name, shortname }: NavbarProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="my-8">
      <nav className="flex items-center flex-wrap font-semibold">
        <div className="flex-grow">
          <Link href="/">
            <a className="inline-flex mr-4 text-3xl">
              <span className="visible md:invisible">{shortname}</span>
              <span className="invisible md:visible md:order-first">
                {name}
              </span>
            </a>
          </Link>
        </div>
        <div className="flex text-lg items-center">
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
