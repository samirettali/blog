import Link from "next/link";
import NavLink from "./NavLink";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="my-8">
      <nav className="flex flex-wrap items-center">
        <div className="flex-grow">
          <Link className="nav-brand inline-flex mr-4" href="/">
            SE
          </Link>
        </div>
        <div className="flex items-center">
          <div className="px-3">
            <NavLink href="/writeups">Writeups</NavLink>
          </div>
          <div className="px-3">
            <NavLink href="/posts">Posts</NavLink>
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
