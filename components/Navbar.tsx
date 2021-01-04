import Link from "next/link";
import { Moon, Sun } from 'heroicons-react'

import { useEffect, useState } from "react";
// import { DarkModeContext } from '../context/theme'

type NavbarProps = {
  name: string;
};

const Navbar = ({ name }: NavbarProps) => {
  const [darkMode, setDarkMode] = useState<boolean | undefined>(undefined);
  // const { darkMode, setDarkMode } = useContext(DarkModeContext)

  const handleToggle = () => {
    setDarkMode((darkMode) => !darkMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    const initialColorValue = root.style.getPropertyValue(
      "--initial-color-mode"
    );
    // console.log("initialColorValue", initialColorValue);
    setDarkMode(initialColorValue === "dark");
  }, []);

  useEffect(() => {
    if (darkMode !== undefined) {
      const root = document.documentElement;
      if (darkMode) {
        root.setAttribute("data-theme", "dark");
        root.style.setProperty("--initial-color-mode", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.removeAttribute("data-theme");
        root.style.setProperty("--initial-color-mode", "light");
        localStorage.setItem("theme", "light");
      }
    }
    // console.log("Dark mode changed: ", darkMode);
  }, [darkMode]);

  return (
    <header className="mt-8 mb-12">
      <nav className="flex items-center flex-wrap font-semibold">
        <div className="flex-grow">
          <Link href="/">
            <a className="mr-4 inline-flex text-3xl">
              {name}
            </a>
          </Link>
        </div>
        <div className='text-lg flex items-center'>
        <div className="px-3">
          <Link href="/posts">
            <a>Posts</a>
          </Link>
        </div>
        <div className="px-3">
          <Link href="/writeups">
            <a>Writeups</a>
          </Link>
        </div>
        <div className="block cursor-pointer transition pl-3" onClick={handleToggle}>
          <a>{darkMode ? <Moon /> : <Sun />}</a>
        </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
