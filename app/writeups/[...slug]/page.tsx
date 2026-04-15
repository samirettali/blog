import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Article from "../../../components/Article";
import { getArticle, getArticleSlugs } from "../../../lib/content";

interface WriteupPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs("writeups");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: WriteupPageProps): Promise<Metadata> {
  const { slug } = await params;
  const writeup = await getArticle("writeups", slug);

  if (!writeup) {
    return { title: "Writeup not found" };
  }

  return {
    title: writeup.title,
  };
}

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { slug } = await params;
  const writeup = await getArticle("writeups", slug);

  if (!writeup) {
    notFound();
  }

  return (
    <>
      <Article article={writeup} />
      <div className="my-12">
        <Link href="/writeups">← Back to writeups</Link>
      </div>
    </>
  );
}
