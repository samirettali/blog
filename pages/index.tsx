import Layout from "../components/layout";
import Navbar from "../components/Navbar";
import About from '../content/about.mdx'

const Home = () => {
  return (
    <Layout
      showNavbar={false}
      containerClassname='px-8'
      contentClassname='flex flex-col max-w-lg mx-auto md:mt-0 mt-8 md:justify-center h-screen'
    >
      <div className='text-4xl mb-8 font-medium'>
        Samir Ettali
      </div>
      <div className='text-2xl tracking-wide leading-relaxed'>
        <About />
      </div>
      <Navbar className='mb-0' showHome={false} showToggler={false}/>
    </Layout>
  );
};

export default Home;
