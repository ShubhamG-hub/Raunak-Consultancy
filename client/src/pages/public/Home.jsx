import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

// Import Sections
import About from './About';
import Services from './Services';
import Claims from './Claims';
import Contact from './Contact';
import TestimonialList from '@/components/ui/TestimonialList';
import TestimonialForm from '@/components/forms/TestimonialForm';
import CertificateDisplay from '@/components/ui/CertificateDisplay';
import GalleryGrid from '@/components/ui/GalleryGrid';

const SectionHeader = ({ tag, title, description, accent = 'blue' }) => {
    const accentColors = {
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800',
        blueLine: 'bg-blue-600 dark:bg-blue-500',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
        >
            {tag && (
                <span className={`inline-block py-1 px-3 mb-4 font-bold text-[10px] tracking-widest uppercase ${accentColors[accent]} rounded-full border`}>
                    {tag}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{title}</h2>
            <div className={`w-16 h-1.5 ${accentColors.blueLine} mx-auto rounded-full mb-6`} />
            {description && (
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            )}
        </motion.div>
    );
};

const Home = () => {
    const { t } = useLanguage();

    const trustCounters = [
        { icon: Users, label: t.stats.families, value: t.stats.familiesVal, color: 'blue' },
        { icon: TrendingUp, label: t.stats.assets, value: t.stats.assetsVal, color: 'indigo' },
        { icon: Clock, label: t.stats.experience, value: t.stats.experienceVal, color: 'sky' },
        { icon: Award, label: t.stats.team, value: t.stats.teamVal, color: 'violet' },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', icon: 'text-blue-600 dark:text-blue-400', shadow: 'hover:shadow-blue-500/10' },
        indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/50', icon: 'text-indigo-600 dark:text-indigo-400', shadow: 'hover:shadow-indigo-500/10' },
        sky: { bg: 'bg-sky-100 dark:bg-sky-900/50', icon: 'text-sky-600 dark:text-sky-400', shadow: 'hover:shadow-sky-500/10' },
        violet: { bg: 'bg-violet-100 dark:bg-violet-900/50', icon: 'text-violet-600 dark:text-violet-400', shadow: 'hover:shadow-violet-500/10' },
    };

    return (
        <div className="flex flex-col pb-0">

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 pt-20 transition-colors duration-500">
                {/* Modern Mesh Gradient Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] rounded-full animate-blob"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-sky-400/20 dark:bg-sky-600/10 blur-[120px] rounded-full animate-blob animation-delay-4000"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <span className="inline-block py-1.5 px-4 mb-6 font-bold text-xs tracking-widest uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 animate-fade-in">
                                Trusted Financial Advisor
                            </span>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                                {t.hero.title} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{t.hero.titleHighlight}</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                {t.hero.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button size="lg" className="h-14 px-10 text-base rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
                                    {t.hero.ctaPrimary}
                                </Button>
                                <Button variant="outline" size="lg" className="h-14 px-10 text-base rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 dark:text-white" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
                                    {t.hero.ctaSecondary}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Counters - Modern Bento Style */}
            <section className="container mx-auto px-6 relative z-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-16">
                    {trustCounters.map((item, index) => {
                        const colors = colorMap[item.color];
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl ${colors.shadow} transition-all duration-300`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 ${colors.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
                                    <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${colors.icon}`} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">{item.value}</h3>
                                <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
                <About />
            </section>

            {/* Certificates Section */}
            <section id="certificates" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500">
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.certificates.title} description={t.certificates.subtitle} />
                    <CertificateDisplay />
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.gallery.title} description={t.gallery.subtitle} />
                    <GalleryGrid />
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500">
                <Services />
            </section>

            {/* Claims Section */}
            <section id="claims" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
                <Claims />
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500">
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.testimonials.title} description={t.testimonials.subtitle} />
                    <TestimonialList />
                    <div className="mt-16 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.testimonials.leaveReview}</h3>
                        <TestimonialForm />
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
                <Contact />
            </section>

        </div>
    );
};

export default Home;
