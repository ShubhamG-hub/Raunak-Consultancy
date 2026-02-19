import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import BookingModal from '@/components/ui/BookingModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: t.nav.home, path: '#home' },
        { name: t.nav.about, path: '#about' },
        { name: t.nav.services, path: '#services' },
        { name: t.nav.claims, path: '#claims' },
        { name: t.nav.contact, path: '#contact' },
    ];

    const scrollToSection = (id) => {
        const targetId = id.replace('#', '');
        const element = document.getElementById(targetId);

        // Close menu immediately to avoid layout shift issues during scroll
        setIsOpen(false);

        if (element) {
            // Small delay to allow the menu closing animation to start/layout to stabilize
            setTimeout(() => {
                const navHeight = 80; // Height of the fixed absolute navbar
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 50);
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm shadow-slate-900/5'
            : 'bg-transparent border-b border-transparent'
            }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex-shrink-0 flex items-center gap-2 group">
                        <img
                            src="/Logo.png"
                            alt={t.footer.companyName}
                            className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">{t.footer.companyName}</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/50 rounded-full px-1 py-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.path}
                                    href={link.path}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.path);
                                    }}
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 ml-2">
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

                        {user ? (
                            <div className="flex items-center gap-3 ml-2">
                                <span className="text-sm text-muted-foreground hidden lg:inline">{t.about.hello}, {user.email?.split('@')[0]}</span>
                                <Link to="/admin/dashboard">
                                    <Button variant="outline" size="sm" className="rounded-full dark:text-white dark:border-slate-700 dark:hover:bg-slate-800">{t.nav.dashboard}</Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="rounded-full dark:text-white dark:hover:bg-slate-800" onClick={logout}>{t.nav.logout}</Button>
                            </div>
                        ) : (
                            <Button onClick={() => setIsBookingOpen(true)} className="ml-2 rounded-full h-10 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
                                {t.nav.bookConsultation}
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-1">
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
                        style={{ top: '80px' }} // Start below the navbar
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
                                <motion.a
                                    key={link.path}
                                    href={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white block px-4 py-3 rounded-2xl text-base font-medium cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.path);
                                    }}
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            {user ? (
                                <>
                                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        {t.nav.dashboard}
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        {t.nav.logout}
                                    </button>
                                </>
                            ) : (
                                <div className="pt-2">
                                    <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg" onClick={() => { setIsBookingOpen(true); setIsOpen(false); }}>
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
