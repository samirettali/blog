import type { Metadata } from "next";
import ArticlesList from "../../components/ArticlesList";
import { getSortedContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Writeups",
};

export default async function WriteupsPage() {
  const writeups = await getSortedContent("writeups");

  return (
    <section className="mt-12 text-xl">
      <h1 className="mb-8 text-center text-4xl">Writeups</h1>
      <ArticlesList articles={writeups} />
    </section>
  );
}
