import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, Facebook, Instagram, Linkedin, Twitter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/useLanguage';
import BookingModal from '@/components/ui/BookingModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hash scrolling when navigating from other pages
    useEffect(() => {
        if (location.hash && location.pathname === '/') {
            const targetId = location.hash.replace('#', '');
            const element = document.getElementById(targetId);
            if (element) {
                setTimeout(() => {
                    const navHeight = 120;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navHeight;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }, [location]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const socialLinks = [
        { icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-500" },
        { icon: Facebook, href: "https://facebook.com", color: "hover:text-blue-600" },
        { icon: Instagram, href: "https://instagram.com", color: "hover:text-pink-500" },
        { icon: Twitter, href: "https://twitter.com", color: "hover:text-sky-400" },
    ];

    const navLinks = [
        { name: t.nav.home, path: '#home' },
        { name: t.nav.about, path: '#about' },
        { name: t.nav.calculators, path: '#calculators' },
        { name: t.nav.certificates, path: '#certificates' },
        { name: t.nav.gallery, path: '#gallery' },
        { name: t.nav.services, path: '#services' },
        { name: t.nav.claims, path: '#claims' },
        { name: t.nav.testimonials, path: '#testimonials' },
        { name: t.nav.contact, path: '#contact' },
    ];

    const handleNavClick = (link) => {
        setIsOpen(false);

        if (link.isRoute) {
            navigate(link.path);
            return;
        }

        if (link.path.startsWith('#')) {
            const targetId = link.path.replace('#', '');
            const element = document.getElementById(targetId);

            if (location.pathname === '/') {
                if (link.path === '#home') {
                    navigate('/', { replace: false });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    navigate('/' + link.path, { replace: false });
                    if (element) {
                        const navHeight = 120;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                }
            } else {
                navigate('/' + link.path);
            }
        }
    };

    // Right Action Area in Navbar
    const renderActions = () => {
        if (user) {
            return (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-2 hidden lg:flex">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{user.role}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.name}</span>
                    </div>
                    {isAdmin ? (
                        <Link to="/admin/dashboard">
                            <Button size="sm" variant="outline" className="rounded-full border-blue-600/20 text-blue-600 h-10 px-6 font-bold hover:bg-blue-600 hover:text-white transition-all">
                                {t.auth.dashboard}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" variant="ghost" className="rounded-full font-bold h-10 px-4">
                            {t.auth.profile}
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={logout}
                        className="rounded-full h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" className="rounded-full h-10 px-6 font-bold">
                        {t.auth.loginBtn}
                    </Button>
                </Link>
                <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="rounded-full h-10 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all font-bold"
                >
                    {t.nav.bookConsultation}
                </Button>
            </div>
        );
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm shadow-slate-900/5'
            : 'bg-transparent border-b border-transparent'
            }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop: Two-Line Layout */}
                <div className="hidden md:flex flex-col py-3">
                    {/* Line 1: Logo & Actions */}
                    <div className="flex items-center justify-between h-14 mb-2">
                        <div className="flex items-center gap-6">
                            {/* Logo */}
                            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex-shrink-0 flex items-center gap-2 group">
                                <img
                                    src="/Logo.png"
                                    alt={t.footer.companyName}
                                    className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                />
                                <span className="text-2xl font-bold text-slate-900 dark:text-white hidden sm:inline">{t.footer.companyName}</span>
                            </Link>

                            {/* Social Media Links */}
                            <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                                {socialLinks.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 ${social.color} transition-all duration-300 hover:scale-110`}
                                    >
                                        <social.icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <LanguageToggle />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="rounded-full w-9 h-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="h-4 w-4 text-slate-600" />
                                    ) : (
                                        <Sun className="h-4 w-4 text-yellow-400" />
                                    )}
                                </Button>
                            </div>
                            {renderActions()}
                        </div>
                    </div>

                    {/* Line 2: Navigation Links (Centered) */}
                    <div className="flex justify-center">
                        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/50 rounded-full px-1 py-1 shadow-inner shadow-slate-900/5">
                            {navLinks.map((link) => (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(link);
                                    }}
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Layout (Compact) */}
                <div className="md:hidden flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex-shrink-0 flex items-center gap-2 group">
                        <img
                            src="/Logo.png"
                            alt={t.footer.companyName}
                            className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-xl font-bold text-slate-900 dark:text-white sm:inline">{t.footer.companyName}</span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full w-9 h-9"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-4 w-4 text-slate-600" />
                            ) : (
                                <Sun className="h-4 w-4 text-yellow-400" />
                            )}
                        </Button>
                        <LanguageToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMenu}
                            className="rounded-full w-10 h-10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 md:hidden"
                        style={{ top: '120px' }} // Start below the taller navbar
                    />
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50 relative"
                    >
                        <div className="px-4 pt-3 pb-6 space-y-1 max-h-[calc(100vh-100px)] overflow-y-auto">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white block px-4 py-3 rounded-2xl text-base font-medium cursor-pointer transition-colors"
                                    onClick={() => handleNavClick(link)}
                                >
                                    {link.name}
                                </motion.div>
                            ))}
                            {user ? (
                                <>
                                    <Link to={isAdmin ? "/admin/dashboard" : "/profile"} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        {isAdmin ? t.auth.dashboard : t.auth.profile}
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        {t.nav.logout}
                                    </button>
                                </>
                            ) : (
                                <div className="pt-2 space-y-2">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                                        <Button variant="outline" className="w-full rounded-2xl h-12 border-2 font-bold">
                                            {t.auth.loginBtn}
                                        </Button>
                                    </Link>
                                    <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg font-bold" onClick={() => { setIsBookingOpen(true); setIsOpen(false); }}>
                                        {t.nav.bookConsultation}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </nav>
    );
};

export default Navbar;
