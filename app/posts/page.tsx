import type { Metadata } from "next";
import ArticlesList from "../../components/ArticlesList";
import { getSortedContent } from "../../lib/content";

export const metadata: Metadata = {
  title: "Posts",
};

export default async function PostsPage() {
  const posts = await getSortedContent("posts");

  return (
    <section className="mt-12 text-xl">
      <h1 className="mb-8 text-center text-4xl">Posts</h1>
      <ArticlesList articles={posts} />
    </section>
  );
}
