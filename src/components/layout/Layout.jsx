import { Outlet } from 'react-router-dom';
import GovernmentHeader from './GovernmentHeader';
import Footer from './Footer';
import AnnouncementsBanner from '../AnnouncementsBanner';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <GovernmentHeader />
      <AnnouncementsBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
