import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, Facebook, Instagram, Linkedin, MessageCircle, ChevronDown, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/useLanguage';
import BookingModal from '@/components/ui/BookingModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();
    const { isDark, toggleDarkMode } = useTheme();
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
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const socialLinks = [
        { icon: Linkedin, href: "https://linkedin.com", color: "hover:text-primary-theme" },
        { icon: Facebook, href: "https://facebook.com", color: "hover:text-primary-theme" },
        { icon: Instagram, href: "https://instagram.com", color: "hover:text-primary-theme" },
        { icon: MessageCircle, href: "https://whatsapp.com/channel/0029VaVlXym42DcomEobtW3O", color: "hover:text-[#25D366]" },
    ];

    const navLinks = [
        { name: t.nav.home, path: '#home' },
        { name: t.nav.services, path: '#services' },
        { name: t.nav.calculators, path: '#calculators' },
        { name: t.nav.claims, path: '#claims' },
        {
            name: t.nav.about,
            path: '#about',
            isDropdown: true,
            children: [
                { name: t.nav.aboutOverview, path: '#about' },
                { name: t.nav.certificates, path: '#certificates' },
                { name: t.nav.awards, path: '#awards' },
                { name: t.nav.gallery, path: '#gallery' },
                { name: t.nav.testimonials, path: '#testimonials' },
            ]
        },
        { name: t.nav.blogs, path: '#blogs' },
        { name: t.nav.contact, path: '#contact' },
    ];

    const handleNavClick = (link) => {
        if (link.isDropdown) return; // Dropdown handled by hover/click events

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
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            } else {
                if (link.path === '#blogs') {
                    navigate('/blogs');
                } else {
                    navigate('/' + link.path);
                }
            }
        }
    };

    // Right Action Area in Navbar
    const renderActions = () => {
        if (user) {
            return (
                <div className="flex items-center gap-1">
                    <div className="hidden xl:flex flex-col items-end mr-1">
                        <span className="text-[10px] font-black tracking-widest text-primary-theme uppercase block leading-tight">Administrator</span>
                        <span className="text-xs xl:text-sm font-bold text-slate-800 dark:text-white block leading-tight">{user.name || 'Admin'}</span>
                    </div>
                    {isAdmin ? (
                        <Link to="/admin/dashboard">
                            <Button size="sm" variant="outline" className="rounded-2xl border-primary-theme/30 text-primary-theme h-9 xl:h-10 px-2 xl:px-3 font-black uppercase tracking-widest text-[9px] xl:text-[10px] hover:bg-primary-theme hover:text-white transition-all duration-300 shadow-xl shadow-primary-theme/5 whitespace-nowrap">
                                {t.auth.dashboard}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-5 hover:bg-primary-theme/5 text-slate-600 dark:text-slate-400 hover:text-primary-theme">
                            {t.auth.profile}
                        </Button>
                    )}
                    <button
                        onClick={logout}
                        className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-black/5 group/logout"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover/logout:-translate-x-1" />
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center">
                <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="relative px-3 xl:px-6 h-10 xl:h-11 rounded-[24px] bg-gradient-to-br from-primary-theme via-primary-theme to-accent-theme text-white font-black uppercase tracking-widest text-[9px] xl:text-[10px] shadow-xl shadow-primary-theme/20 hover:shadow-primary-theme/40 transition-all duration-500 overflow-hidden group/book ring-2 ring-white/10 whitespace-nowrap"
                >
                    {/* Animated Shine Effect */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/book:animate-[shimmer_1.5s_infinite]" />

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/book:opacity-10 transition-opacity duration-500" />

                    <span className="relative z-10 flex items-center gap-1.5">
                        {t.nav.bookConsultation}
                        <ArrowRight className="w-3.5 h-3.5 group-hover/book:translate-x-1 transition-transform" strokeWidth={3} />
                    </span>
                </Button>
            </div>
        );
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500`}>
            {/* Desktop: 1.5 Line Layout */}
            <div className="hidden md:block">
                {/* Line 0.5: Top Info Bar (Collapsible) */}
                <AnimatePresence>
                    {!scrolled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: '60px', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-950 dark:bg-black text-white/90 border-b border-white/5 overflow-hidden relative"
                        >
                            {/* Theme accent blur */}
                            <div className="absolute top-0 right-0 w-64 h-full bg-primary-theme/10 blur-3xl -z-10" />

                            <div className="container mx-auto px-6 h-full flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-3 group">
                                        <div className="relative flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        </div>
                                        <span className="text-white/60 group-hover:text-primary-theme transition-colors duration-300 flex items-center gap-2">
                                            <span className="w-1 h-3 bg-emerald-500/30 rounded-full" />
                                            Kalyan, Mumbai
                                        </span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <a href="tel:+919137105476" className="flex items-center gap-2 text-white/60 hover:text-primary-theme transition-all duration-300 group">
                                        <span className="bg-primary-theme/20 text-primary-theme px-1.5 py-0.5 rounded text-[10px] ring-1 ring-primary-theme/50">IN</span>
                                        <span className="tracking-widest">+91 9137105476</span>
                                    </a>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-5 pr-8 border-r border-white/10">
                                        {socialLinks.map((social, idx) => (
                                            <a key={idx} href={social.href} className="text-white/40 hover:text-primary-theme transition-all duration-300 transform hover:-translate-y-1">
                                                <social.icon size={18} strokeWidth={2.5} />
                                            </a>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white/5 backdrop-blur-md rounded-full px-2 py-1 ring-1 ring-white/10">
                                            <LanguageToggle />
                                            <div className="w-px h-4 bg-white/10 mx-1" />
                                            <button
                                                onClick={toggleDarkMode}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-theme/20 hover:text-primary-theme transition-all duration-300"
                                            >
                                                {isDark ? <Sun size={14} className="text-yellow-400" /> : <Moon size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Line 1.0: Main Navigation Bar */}
                <div className={`transition-all duration-500 overflow-hidden relative ${scrolled
                    ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-primary-theme/10 shadow-2xl shadow-primary-theme/5 py-1'
                    : 'bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl border-b border-primary-theme/5 pt-3 pb-1'
                    }`}>

                    {/* Background decoration */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-theme/5 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-theme/5 blur-[100px] rounded-full" />

                    <div className="container mx-auto px-4 xl:px-6 flex items-center h-20 relative z-10 gap-4 xl:gap-4">
                        {/* Branding Area - Left Column */}
                        <div className="flex-shrink-0 min-w-max">
                            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 group">
                                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-br from-primary-theme via-primary-theme to-primary-theme/80 rounded-[14px] xl:rounded-[18px] flex items-center justify-center shadow-xl shadow-primary-theme/20 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 relative ring-2 ring-primary-theme/20 dark:ring-white/10 shrink-0">
                                    <div className="absolute inset-0 bg-white/30 opacity-20 group-hover:opacity-0 transition-opacity rounded-[14px] xl:rounded-[18px]" />
                                    <img src="/Logo.png" alt="Logo" className="w-7 h-7 xl:w-8 xl:h-8 invert drop-shadow-2xl object-contain" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base xl:text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm whitespace-nowrap">
                                        {t.footer.companyName}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="h-[2px] w-8 bg-primary-theme/40 rounded-full overflow-hidden shrink-0">
                                            <div className="h-full w-full bg-primary-theme animate-[shimmer_2s_infinite]" />
                                        </div>
                                        <span className="text-[8px] xl:text-[10px] font-black text-primary-theme/80 uppercase tracking-[0.2em] whitespace-nowrap">Financial Consultancy</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Navigation Links - Center Column (flex-1 to fill remaining space, centered) */}
                        <div className="flex-1 flex justify-center min-w-0 px-2">
                            <div className="flex items-center gap-0.5 xl:gap-1 bg-white/60 dark:bg-black/30 backdrop-blur-2xl p-1 rounded-full ring-1 ring-black/[0.03] dark:ring-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                                {navLinks.map((link) => (
                                    link.isDropdown ? (
                                        <div key={link.name} className="relative group">
                                            <button className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-1.5 xl:px-5 py-2 rounded-full text-[9.5px] xl:text-[12px] font-black uppercase tracking-[0.05em] xl:tracking-[0.08em] transition-all cursor-pointer flex items-center gap-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] whitespace-nowrap">
                                                {link.name}
                                                <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-theme opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                                            </button>
                                            <div className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[60] scale-95 group-hover:scale-100">
                                                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-primary-theme/10 p-5 min-w-[280px]">
                                                    {link.children.map((child) => (
                                                        <a
                                                            key={child.path}
                                                            href={child.path}
                                                            onClick={(e) => { e.preventDefault(); handleNavClick(child); }}
                                                            className="relative px-2 xl:px-4 py-2 text-[11px] xl:text-[13px] font-bold uppercase tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5
                                                            text-slate-600 dark:text-slate-300 hover:text-primary-theme hover:bg-slate-100 dark:hover:bg-white/5"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-theme/20 group-hover/item:bg-primary-theme transition-colors duration-300 shrink-0" />
                                                                <span className="truncate">{child.name}</span>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-primary-theme" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <a
                                            key={link.path}
                                            href={link.path}
                                            onClick={(e) => { e.preventDefault(); handleNavClick(link); }}
                                            className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-1.5 xl:px-5 py-2 rounded-full text-[9.5px] xl:text-[12px] font-black uppercase tracking-[0.05em] xl:tracking-[0.08em] transition-all cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.05] group whitespace-nowrap"
                                        >
                                            {link.name}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-theme opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Actions Area - Right Column */}
                        <div className="flex items-center gap-1 flex-shrink-0 min-w-max">
                            <div className="flex items-center border-l border-primary-theme/10 pl-2 xl:pl-3">
                                {renderActions()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Layout (Compact) - Theme Based */}
            <div className="md:hidden flex flex-col pt-4 pb-3 gap-4 border-b border-primary-theme/5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-theme/5 blur-3xl -z-10" />

                {/* Line 1: Centered Logo & Brand */}
                <div className="flex justify-center w-full px-6">
                    <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-theme to-primary-theme/80 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-theme/20 transform group-active:scale-95 transition-all duration-300 relative ring-2 ring-primary-theme/10">
                            <div className="absolute inset-0 bg-white opacity-20 rounded-2xl" />
                            <img src="/Logo.png" alt="Logo" className="w-7 h-7 invert object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm">{t.footer.companyName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-[1.5px] w-6 bg-primary-theme/40 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-primary-theme animate-[shimmer_2s_infinite]" />
                                </div>
                                <span className="text-[10px] font-black text-primary-theme uppercase tracking-[0.3em]">Financial Consultancy</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Line 2: Actions & Menu Toggle */}
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full px-3">
                        {socialLinks.map((social, idx) => (
                            <a key={idx} href={social.href} className="p-2 text-slate-400 hover:text-primary-theme active:scale-90 transition-all duration-300">
                                <social.icon size={16} strokeWidth={2.5} />
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-full ring-1 ring-black/5 dark:ring-white/5">
                            <LanguageToggle />
                            <button onClick={toggleDarkMode} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-theme transition-all duration-300">
                                {isDark ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} />}
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMenu}
                            className="rounded-xl w-10 h-10 bg-primary-theme/10 text-primary-theme hover:bg-primary-theme hover:text-white transition-all duration-300 shadow-lg shadow-primary-theme/5"
                        >
                            {isOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
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
                        style={{ top: '130px' }}
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
                                link.isDropdown ? (
                                    <div key={link.name} className="space-y-1">
                                        <button
                                            onClick={() => setIsAboutOpen(!isAboutOpen)}
                                            className="w-full text-left flex items-center justify-between px-5 py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 hover:bg-primary-theme/10 hover:text-primary-theme transition-all duration-300 shadow-sm"
                                        >
                                            <span className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-theme" />
                                                {link.name}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-500 text-primary-theme ${isAboutOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isAboutOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0, y: -10 }}
                                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                                    exit={{ height: 0, opacity: 0, y: -10 }}
                                                    className="overflow-hidden bg-primary-theme/5 rounded-[24px] mx-1 border border-primary-theme/10"
                                                >
                                                    {link.children.map((child) => (
                                                        <div
                                                            key={child.path}
                                                            className="px-8 py-4 text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary-theme hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 flex items-center justify-between group/child"
                                                            onClick={() => handleNavClick(child)}
                                                        >
                                                            {child.name}
                                                            <div className="w-1 h-1 rounded-full bg-primary-theme opacity-0 group-hover/child:opacity-100 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="text-slate-900 dark:text-white block px-6 py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 hover:bg-primary-theme/10 hover:text-primary-theme transition-all duration-300 shadow-sm flex items-center gap-3"
                                        onClick={() => handleNavClick(link)}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        {link.name}
                                    </motion.div>
                                )
                            ))}
                            {user ? (
                                <>
                                    <Link to={isAdmin ? "/admin/dashboard" : "/profile"} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest text-primary-theme">
                                        {isAdmin ? t.auth.dashboard : t.auth.profile}
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left px-4 py-3 rounded-2xl text-[13px] font-black uppercase tracking-widest text-red-500">
                                        {t.nav.logout}
                                    </button>
                                </>
                            ) : (
                                <div className="pt-4 px-2">
                                    <Button
                                        className="w-full rounded-[24px] h-14 bg-gradient-to-br from-primary-theme via-primary-theme to-accent-theme text-white shadow-xl shadow-primary-theme/20 font-black uppercase tracking-widest text-[11px] relative overflow-hidden group/mbook ring-2 ring-white/10"
                                        onClick={() => { setIsBookingOpen(true); setIsOpen(false); }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/mbook:animate-[shimmer_1.5s_infinite]" />
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover/mbook:opacity-10 transition-opacity duration-500" />
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {t.nav.bookConsultation}
                                            <ArrowRight className="w-4 h-4 group-hover/mbook:translate-x-1 transition-transform" strokeWidth={3} />
                                        </span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Modal */}
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </nav>
    );
};

export default Navbar;
