import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdmin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import TenantIndicator from './components/TenantIndicator';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Panchayat from './pages/Panchayat';
import Services from './pages/Services';
import Schemes from './pages/Schemes';
import Downloads from './pages/Downloads';
import Education from './pages/Education';
import Gallery from './pages/Gallery';
import Financials from './pages/Financials';
import Notices from './pages/Notices';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import MembersManagement from './pages/admin/MembersManagement';
import MemberForm from './pages/admin/MemberForm';
import ServicesManagement from './pages/admin/ServicesManagement';
import ServiceForm from './pages/admin/ServiceForm';
import SchemesManagement from './pages/admin/SchemesManagement';
import SchemeForm from './pages/admin/SchemeForm';
import NoticesManagement from './pages/admin/NoticesManagement';
import NoticeForm from './pages/admin/NoticeForm';
import GalleryManagement from './pages/admin/GalleryManagement';
import GalleryForm from './pages/admin/GalleryForm';
import FormsManagement from './pages/admin/FormsManagement';
import FormUpload from './pages/admin/FormUpload';
import SiteSettings from './pages/admin/SiteSettings';
import GrievancesManagement from './pages/admin/GrievancesManagement';
import GrievanceForm from './pages/admin/GrievanceForm';
import FinancialsManagement from './pages/admin/FinancialsManagement';
import FinancialForm from './pages/admin/FinancialForm';
import AboutPageManagement from './pages/admin/AboutPageManagement';
import EducationPageManagement from './pages/admin/EducationPageManagement';
import VillageStatistics from './pages/admin/VillageStatistics';
import VillageStatisticsPublic from './pages/VillageStatistics';
import AnnouncementsManagement from './pages/admin/AnnouncementsManagement';
import AnnouncementForm from './pages/admin/AnnouncementForm';
import SliderManagement from './pages/admin/SliderManagement';
import OfficialsManagement from './pages/admin/OfficialsManagement';
import FirebaseSetup from './pages/FirebaseSetup';

// Super Admin Pages
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import AddGP from './pages/SuperAdmin/AddGP';
import ManageGPs from './pages/SuperAdmin/ManageGPs';
import ViewGP from './pages/SuperAdmin/ViewGP';
import EditGP from './pages/SuperAdmin/EditGP';
import ManageUsers from './pages/SuperAdmin/ManageUsers';

function App() {
  // Check if we're on the Super Admin domain
  const isSuperAdminDomain = window.location.hostname.includes('superadmin-grampanchayat');

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <LanguageProvider>
              <SuperAdminProvider>
                <Routes>
                  {/* Redirect root to Super Admin login on Super Admin domain */}
                  {isSuperAdminDomain && (
                    <Route path="/" element={<Navigate to="/superadmin/login" replace />} />
                  )}
                  
                  {/* Super Admin Routes */}
                  <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                  <Route
                    path="/superadmin/dashboard"
                    element={
                      <SuperAdminProtectedRoute>
                        <SuperAdminDashboard />
                      </SuperAdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/gram-panchayats"
                    element={
                      <SuperAdminProtectedRoute>
                        <ManageGPs />
                      </SuperAdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/gram-panchayats/add"
                    element={
                      <SuperAdminProtectedRoute>
                        <AddGP />
                      </SuperAdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/gram-panchayats/edit/:id"
                    element={
                      <SuperAdminProtectedRoute>
                        <EditGP />
                      </SuperAdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/gram-panchayats/:id"
                    element={
                      <SuperAdminProtectedRoute>
                        <ViewGP />
                      </SuperAdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/users"
                    element={
                      <SuperAdminProtectedRoute>
                        <ManageUsers />
                      </SuperAdminProtectedRoute>
                    }
                  />

                  {/* Public Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="panchayat" element={<Panchayat />} />
                    <Route path="services" element={<Services />} />
                    <Route path="schemes" element={<Schemes />} />
                    <Route path="downloads" element={<Downloads />} />
                    <Route path="education" element={<Education />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="financials" element={<Financials />} />
                    <Route path="notices" element={<Notices />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="village-statistics" element={<VillageStatisticsPublic />} />
                  </Route>

                  {/* Firebase Setup (Temporary - remove after setup complete) */}
                  <Route path="/firebase-setup" element={<FirebaseSetup />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="members" element={<MembersManagement />} />
                    <Route path="members/new" element={<MemberForm />} />
                    <Route path="members/edit/:id" element={<MemberForm />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="services/new" element={<ServiceForm />} />
                    <Route path="services/edit/:id" element={<ServiceForm />} />
                    <Route path="schemes" element={<SchemesManagement />} />
                    <Route path="schemes/new" element={<SchemeForm />} />
                    <Route path="schemes/edit/:id" element={<SchemeForm />} />
                    <Route path="notices" element={<NoticesManagement />} />
                    <Route path="notices/new" element={<NoticeForm />} />
                    <Route path="notices/edit/:id" element={<NoticeForm />} />
                    <Route path="announcements" element={<AnnouncementsManagement />} />
                    <Route path="announcements/new" element={<AnnouncementForm />} />
                    <Route path="announcements/edit/:id" element={<AnnouncementForm />} />
                    <Route path="gallery" element={<GalleryManagement />} />
                    <Route path="gallery/new" element={<GalleryForm />} />
                    <Route path="gallery/edit/:id" element={<GalleryForm />} />
                    <Route path="forms" element={<FormsManagement />} />
                    <Route path="forms/new" element={<FormUpload />} />
                    <Route path="forms/edit/:id" element={<FormUpload />} />
                    <Route path="settings" element={<SiteSettings />} />
                    <Route path="grievances" element={<GrievancesManagement />} />
                    <Route path="grievances/new" element={<GrievanceForm />} />
                    <Route path="grievances/edit/:id" element={<GrievanceForm />} />
                    <Route path="financials" element={<FinancialsManagement />} />
                    <Route path="financials/new" element={<FinancialForm />} />
                    <Route path="financials/edit/:id" element={<FinancialForm />} />
                    <Route path="content/about" element={<AboutPageManagement />} />
                    <Route path="content/education" element={<EducationPageManagement />} />
                    <Route path="slider" element={<SliderManagement />} />
                    <Route path="officials" element={<OfficialsManagement />} />
                    <Route path="village-statistics" element={<VillageStatistics />} />
                  </Route>
                </Routes>
                {/* Tenant Indicator for development */}
                <TenantIndicator />
              </SuperAdminProvider>
            </LanguageProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
