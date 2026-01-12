import { Outlet } from 'react-router-dom';
import HeaderV2 from './HeaderV2';
import NavBar from './NavBar';
import Footer from './Footer';
import AnnouncementsBanner from '../AnnouncementsBanner';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderV2 />
      <NavBar />
      <AnnouncementsBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
