import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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
import AboutDetails from '@/pages/public/AboutDetails';
import CategoryPage from '@/pages/public/CategoryPage';
import AllServices from '@/pages/public/AllServices';
import ServiceDetail from '@/pages/public/ServiceDetail';
import Blogs from '@/pages/public/Blogs';
import BlogDetail from '@/pages/public/BlogDetail';
import NotFound from '@/pages/public/NotFound';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import BookingsManager from '@/pages/admin/BookingsManager';
import LeadsManager from '@/pages/admin/LeadsManager';
import ServicesManager from '@/pages/admin/ServicesManager';
import Certificates from '@/pages/admin/Certificates';
import ContentEditor from '@/pages/admin/ContentEditor';
import TestimonialsManager from '@/pages/admin/TestimonialsManager';
import GalleryManager from '@/pages/admin/GalleryManager';
import BlogsManager from '@/pages/admin/BlogsManager';
import AwardsManager from '@/pages/admin/AwardsManager';
import ClaimsManager from '@/pages/admin/ClaimsManager';
import ChatManager from '@/pages/admin/ChatManager';
import Profile from '@/pages/admin/Profile';
import ThemeSettings from '@/pages/admin/ThemeSettings';
import AboutManager from '@/pages/admin/AboutManager';
import CategoryManager from '@/pages/admin/CategoryManager';
import AdminLayout from '@/components/layout/AdminLayout';

import ProtectedRoute from '@/components/layout/ProtectedRoute';

import { useLanguage } from '@/context/useLanguage';

const SITE_NAME = 'Raunak Consultancy';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { t } = useLanguage();

  const SECTION_TITLES = useMemo(() => ({
    'home': 'Home',
    'services': t.nav.services,
    'calculators': t.nav.calculators,
    'claims': t.nav.claims,
    'about': t.nav.about,
    'certificates': t.certificates.title,
    'awards': t.awards.title,
    'blogs': t.nav.blogs,
    'testimonials': t.testimonials.title,
    'gallery': t.gallery.title,
    'contact': t.nav.contact,
    'theme-settings': 'Theme Appearance',
  }), [t]);

  // Update browser tab title
  useEffect(() => {
    if (isAdmin && location.pathname !== '/admin/login') return;

    if (location.pathname !== '/') {
      const PAGE_TITLES = {
        '/admin/login': 'Admin Login',
        '/admin/settings/theme': 'Theme Settings',
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
  }, [location.pathname, isAdmin, t, SECTION_TITLES]);

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
      // Only scroll to top on initial load if we're not on a specific route that might have its own scroll logic
      window.scrollTo(0, 0);
    }

    return () => clearTimeout(timer);
  }, [location.hash, location.pathname, navigate]);

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

            {/* Services */}
            <Route path="/services" element={<AllServices />} />
            <Route path="/services/:categorySlug" element={<CategoryPage />} />
            <Route path="/services/:categorySlug/:serviceSlug" element={<ServiceDetail />} />

            {/* Calculators */}
            <Route path="/calculators" element={<Calculators />} />

            {/* About Dropdown Related Pages */}
            <Route path="/about-details" element={<AboutDetails />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />

            {/* Blogs */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />


            {/* Admin Routes */}
            {/* Redirect typo URL to correct admin login */}
            <Route path="/admin/loign" element={<Navigate to="/admin/login" replace />} />
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
              path="/admin/settings/theme"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ThemeSettings />
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
              path="/admin/services"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ServicesManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <CategoryManager />
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
            <Route
              path="/admin/about"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AboutManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
