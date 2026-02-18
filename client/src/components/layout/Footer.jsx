import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUpRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const socialLinks = [
        { icon: Linkedin, href: "#", color: "hover:text-blue-400" },
        { icon: Facebook, href: "#", color: "hover:text-blue-600" },
        { icon: Instagram, href: "#", color: "hover:text-pink-500" },
        { icon: Twitter, href: "#", color: "hover:text-sky-400" },
    ];

    return (
        <footer className="relative bg-slate-900 text-slate-50 overflow-hidden border-t border-white/5">
            {/* Gradient accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 opacity-80" />

            {/* Decorative blobs - lowered opacity to feel less airy */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]" />

            <div className="container mx-auto px-6 pt-3 pb-1 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                    {/* Brand Column */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 p-1 rounded-lg backdrop-blur-md border border-white/10">
                                <img
                                    src="/Logo.png"
                                    alt={t.footer.companyName}
                                    className="w-5 h-5 object-contain"
                                />
                            </div>
                            <h3 className="text-sm font-bold tracking-tight">{t.footer.companyName}</h3>
                        </div>
                        <p className="text-slate-400 text-[10px] leading-tight max-w-sm">
                            {t.footer.brandQuote}
                        </p>
                        <div className="flex items-center gap-2">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className={`p-1 rounded-full bg-white/5 border border-white/10 ${social.color} transition-all duration-300 hover:scale-110`}
                                >
                                    <social.icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:ml-auto">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{t.footer.quickLinks}</h4>
                        <ul className="space-y-0.5">
                            {[
                                { label: t.nav.about, id: 'about' },
                                { label: t.nav.services, id: 'services' },
                                { label: t.nav.claims, id: 'claims' },
                                { label: t.nav.contact, id: 'contact' },
                            ].map(link => (
                                <li key={link.id}>
                                    <button
                                        onClick={() => scrollTo(link.id)}
                                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="lg:ml-auto">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{t.footer.compliance}</h4>
                        <ul className="space-y-0.5">
                            <li><Link to="/privacy" className="text-slate-400 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {t.footer.privacy}
                            </Link></li>
                            <li><Link to="/terms" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {t.footer.terms}
                            </Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:ml-auto">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{t.contact.title}</h4>
                        <div className="space-y-1.5">
                            <div className="flex items-start gap-2">
                                <div className="p-1 bg-blue-600/10 rounded-md text-blue-500">
                                    <MapPin size={12} />
                                </div>
                                <p className="text-slate-400 text-[11px] leading-tight">{t.contact.officeAddress}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                                    <Phone size={16} />
                                </div>
                                <a href="tel:+919137105476" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">+91 9137105476</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                                    <Mail size={16} />
                                </div>
                                <a href="mailto:ms.sudhirgupta@rediffmail.com" className="text-slate-400 hover:text-white text-sm font-medium transition-colors break-all">ms.sudhirgupta@rediffmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-3 pt-2 border-t border-white/5">
                    <div className="bg-white/5 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm max-w-4xl mx-auto">
                        <p className="text-[9px] text-slate-500 leading-tight text-center">
                            <strong className="text-slate-300 uppercase tracking-tighter mr-1">{t.footer.legalDisclaimer}:</strong>
                            {t.services.disclaimer}{' '}{t.footer.insuranceSolicitation}
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-2 pt-1.5 flex flex-col items-center justify-center text-slate-500 text-[9px] font-medium tracking-tight gap-1 opacity-60">
                    <p>&copy; {new Date().getFullYear()} {t.footer.companyName}. All rights reserved.</p>
                    <div className="h-px w-4 bg-white/10" />
                    <p>
                        {t.footer.designedBy} <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors font-bold uppercase tracking-wider">Shubham Gupta</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
