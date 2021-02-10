import Link from "next/link";
import { Moon, Sun } from "heroicons-react";

import { useEffect, useState } from "react";

type NavbarProps = {
  name: string;
  shortname: string;
};

const Navbar = ({ name, shortname }: NavbarProps) => {
  const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);

  const handleToggle = () => {
    setDarkMode((darkMode) => !darkMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    const initialColorValue = root.style.getPropertyValue(
      "--initial-color-mode"
    );
    setDarkMode(initialColorValue === "dark");
  }, []);

  useEffect(() => {
    if (darkMode !== undefined) {
      const root = document.documentElement;
      if (darkMode) {
        root.setAttribute("data-theme", "dark");
        root.style.setProperty("--initial-color-mode", "dark");
        document.querySelector("html").classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.removeAttribute("data-theme");
        root.style.setProperty("--initial-color-mode", "light");
        document.querySelector("html").classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, [darkMode]);

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
            onClick={handleToggle}
          >
            <a>{darkMode ? <Moon /> : <Sun />}</a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
