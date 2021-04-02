import Layout from "../components/layout";
import { getSortedContent } from "../lib/posts";
import ArticlesList from "../components/ArticlesList";
import { ArticleType } from "../components/Article";

type PostProps = {
  posts: ArticleType[];
};

const Posts = ({ posts }: PostProps) => {
  return (
    <Layout>
      <section className="text-xl">
        <h2 className="text-4xl mb-8">Posts</h2>
        <ArticlesList articles={posts} />
      </section>
    </Layout>
  );
};

export default Posts;

export const getStaticProps = async () => {
  const posts = getSortedContent("posts");
  return {
    props: {
      posts,
    },
  };
};
