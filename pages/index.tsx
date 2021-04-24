import Layout from "../components/layout";
import Navbar from "../components/Navbar";
import Links from '../components/Links'
import About from '../content/about.mdx'
import { Config, getConfig } from "../lib/config";
import Contacts from "../components/Contacts";

interface Props {
  config: Config;
}

const Home = ({ config }: Props) => {
  const { links } = config
  return (
    <Layout
      containerClassname='px-8'
      contentClassname='flex flex-col mx-auto mt-16'
    >
      <div className='text-lg text-center tracking-wide leading-relaxed'>
        <About />
      </div>
      <Contacts links={links} className='mt-8' />
    </Layout>
  );
};

export default Home;



export const getStaticProps = async () => {
  const config = await getConfig();
  return {
    props: {
      config,
    },
  };
};
