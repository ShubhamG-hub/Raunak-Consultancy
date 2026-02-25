import { Link } from 'react-router-dom';
import { MapPin, Phone, Heart, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/useLanguage';

const Footer = () => {
    const { t } = useLanguage();

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const socialLinks = [
        { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600 focus:text-blue-600" },
        { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-700 focus:text-blue-700" },
        { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600 focus:text-pink-600" },
        { icon: MessageCircle, href: "https://whatsapp.com/channel/0029VaVlXym42DcomEobtW3O", label: "WhatsApp Chat", color: "hover:text-green-500 focus:text-green-500" },
    ];

    const navLinks = [
        { label: t.nav.services, id: 'services', type: 'hash' },
        { label: t.nav.calculators, id: 'calculators', type: 'hash' },
        { label: t.nav.claims, id: 'claims', type: 'hash' },
        { label: t.nav.about, id: 'about', type: 'hash' },
        { label: t.nav.blogs, path: '/blogs', type: 'route' },
        { label: t.nav.contact, id: 'contact', type: 'hash' },
    ];

    return (
        <footer className="relative bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-500">
            {/* Minimalist Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-slate-50/30 dark:bg-slate-900/10 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 py-8 lg:py-6 space-y-8 lg:space-y-6">

                {/* LINE 1: Comprehensive Core Info */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-2">
                    {/* Brand Identity */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 bg-primary-theme rounded-xl flex items-center justify-center shadow-lg shadow-primary-theme/20 group-hover:scale-110 transition-transform duration-300">
                            <img src="/Logo.png" alt="Logo" className="w-5 h-5 invert" />
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.footer.companyName}</span>
                    </Link>

                    {/* Navigation - Centered Desktop */}
                    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                        {navLinks.map((link, idx) => (
                            link.type === 'route' ? (
                                <Link
                                    key={idx}
                                    to={link.path}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary-theme transition-all"
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(link.id)}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary-theme transition-all"
                                >
                                    {link.label}
                                </button>
                            )
                        ))}
                    </nav>

                    {/* Contact - Right Aligned Desktop */}
                    <div className="flex flex-wrap items-center justify-center gap-6 shrink-0 lg:ml-auto">
                        <div className="flex items-center gap-2 group">
                            <MapPin className="w-3.5 h-3.5 text-primary-theme" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kalyan, Mumbai</span>
                        </div>
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                        <a href="tel:+919137105476" className="flex items-center gap-2 group transition-transform hover:scale-105">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">+91 9137105476</span>
                        </a>
                    </div>
                </div>

                {/* LINE 2: Legal, Socials & Credits */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100/50 dark:border-slate-800/50">
                    {/* Copyright & Legal */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 order-2 md:order-1">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] shrink-0">
                            © {new Date().getFullYear()} {t.footer.companyName}.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-primary-theme transition-colors">Privacy</Link>
                            <Link to="/terms" className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-primary-theme transition-colors">Terms</Link>
                        </div>
                    </div>

                    {/* Interaction - Socials Centered */}
                    <div className="flex items-center gap-6 order-1 md:order-2">
                        {socialLinks.map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                className={`text-slate-400 dark:text-slate-500 transition-all duration-300 hover:scale-125 ${social.color}`}
                                aria-label={social.label}
                            >
                                <social.icon size={16} />
                            </a>
                        ))}
                    </div>

                    {/* Developer Credit - Right */}
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 group order-3">
                        CREATED WITH <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" /> BY
                        <a href="#" className="text-primary-theme hover:underline tracking-tight decoration-2 underline-offset-4">SHUBHAM GUPTA</a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
