import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Article from "../../../components/Article";
import { getArticle, getArticleSlugs } from "../../../lib/content";

interface PostPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs("posts");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle("posts", slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getArticle("posts", slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Article article={post} />
      <div className="my-12">
        <Link href="/posts">← Back to posts</Link>
      </div>
    </>
  );
}
