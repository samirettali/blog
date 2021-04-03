import Layout from "../components/layout";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <Layout
      showNavbar={false}
      containerClassname='px-8'
      contentClassname='flex flex-col md:justify-center mt-40 md:mt-0 md:h-screen'
    >
      <div className='text-4xl mb-8 font-medium'>
        Samir Ettali
      </div>
      <div className='leading-relaxed tracking-wide text-2xl'>
        <p>Hi! I'm a Web Developer from Turin, Italy.</p>
        <p>I'm deeply passionate about software development, blockchain technology and I love Neovim.</p>
      </div>
      <Navbar className='mb-0' showHome={false} />
    </Layout>
  );
};

export default Home;
