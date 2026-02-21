import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/ui/FloatingActions';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Home from '@/pages/public/Home';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import Calculators from '@/pages/public/Calculators';
import Gallery from '@/pages/public/Gallery';
import CertificatesPage from '@/pages/public/CertificatesPage';
import TestimonialsPage from '@/pages/public/TestimonialsPage';
import ServicesDetails from '@/pages/public/ServicesDetails';
import AboutDetails from '@/pages/public/AboutDetails';
import Blogs from '@/pages/public/Blogs';
import BlogDetail from '@/pages/public/BlogDetail';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import BookingsManager from '@/pages/admin/BookingsManager';
import LeadsManager from '@/pages/admin/LeadsManager';
import Certificates from '@/pages/admin/Certificates';
import ContentEditor from '@/pages/admin/ContentEditor';
import TestimonialsManager from '@/pages/admin/TestimonialsManager';
import GalleryManager from '@/pages/admin/GalleryManager';
import BlogsManager from '@/pages/admin/BlogsManager';
import AwardsManager from '@/pages/admin/AwardsManager';
import ClaimsManager from '@/pages/admin/ClaimsManager';
import ChatManager from '@/pages/admin/ChatManager';
import Profile from '@/pages/admin/Profile';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

import { useLanguage } from '@/context/useLanguage';

const SITE_NAME = 'Raunak Consultancy';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { t } = useLanguage();

  const SECTION_TITLES = {
    'home': 'Home',
    'about': t.nav.about,
    'services': t.nav.services,
    'claims': t.nav.claims,
    'contact': t.nav.contact,
    'certificates': t.certificates.title,
    'gallery': t.gallery.title,
    'testimonials': t.testimonials.title,
  };

  // Update browser tab title
  useEffect(() => {
    if (isAdmin && location.pathname !== '/admin/login') return;

    if (location.pathname !== '/') {
      const PAGE_TITLES = {
        '/admin/login': 'Admin Login',
      };
      const pageTitle = PAGE_TITLES[location.pathname];
      document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
      return;
    }

    // Default title for Home
    document.title = `Home | ${SITE_NAME}`;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper part of the screen
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionTitle = SECTION_TITLES[sectionId];
          if (sectionTitle) {
            document.title = `${sectionTitle} | ${SITE_NAME}`;
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = Object.keys(SECTION_TITLES).map(id => document.getElementById(id)).filter(Boolean);

    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [location.pathname, isAdmin, t]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdmin && <Navbar />}
      <main className="relative flex-grow">
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingActions />}
    </div>
  );
};


function App() {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Redirect to home on reload/initial load if not an admin route
    // Also clear hash to ensure we start at the top (Hero section)
    const isAdmin = location.pathname.startsWith('/admin');
    if (!isAdmin) {
      if (location.pathname !== '/' || location.hash !== '') {
        navigate('/', { replace: true });
        window.scrollTo(0, 0);
      } else {
        // Even if on / with no hash, force scroll to top on fresh load/reload
        window.scrollTo(0, 0);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen key="loader" />}
        </AnimatePresence>
        <ScrollToTop />
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/services" element={<ServicesDetails />} />
            <Route path="/about-details" element={<AboutDetails />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <BookingsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <LeadsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/certificates"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Certificates />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ContentEditor />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/testimonials"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <TestimonialsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <GalleryManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <BlogsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/awards"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AwardsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ClaimsManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ChatManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Profile />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
