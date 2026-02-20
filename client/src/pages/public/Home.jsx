import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Users,
    TrendingUp,
    Clock,
    Award,
    Sunset,
    Baby,
    Coins,
    ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/useLanguage';
import BookingModal from '@/components/ui/BookingModal';

// Import Sections
import About from './About';
import Services from './Services';
import Claims from './Claims';
import Contact from './Contact';
import TestimonialList from '@/components/ui/TestimonialList';
import TestimonialForm from '@/components/forms/TestimonialForm';
import CertificateDisplay from '@/components/ui/CertificateDisplay';
import GalleryGrid from '@/components/ui/GalleryGrid';

import SectionHeader from '@/components/layout/SectionHeader';

const Home = () => {
    const { t } = useLanguage();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll();

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

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
        <div ref={containerRef} className="relative flex flex-col pb-0">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]"
                style={{ scaleX }}
            />

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
                                <Button size="lg" className="h-14 px-10 text-base rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95" onClick={() => setIsBookingOpen(true)}>
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
            <motion.section
                id="about"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <About />
            </motion.section>

            {/* Financial Tools / Calculators Preview */}
            <motion.section
                id="calculators"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <span className="inline-block py-1 px-3 mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                                Interactive Tools
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                                {t.calculators.title}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl">
                                {t.calculators.subtitle}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {[
                                    { icon: TrendingUp, label: t.services.goalPlanner, color: "text-blue-600" },
                                    { icon: Sunset, label: t.calculators.retirement.title, color: "text-indigo-600" },
                                    { icon: Baby, label: t.calculators.child.title, color: "text-rose-600" },
                                    { icon: Coins, label: t.services.goalPlanner, color: "text-emerald-600" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05, x: 10 }}
                                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-default"
                                    >
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.label}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <Link to="/calculators">
                                <Button size="lg" className="h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-700 font-bold shadow-xl shadow-blue-600/20 group">
                                    {t.services.startPlanning} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <motion.div
                                animate={{
                                    rotate: [2, -2, 2],
                                    y: [0, -10, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10 bg-white dark:bg-slate-800 p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700"
                            >
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIP Analysis</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                        <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                        <div className="flex items-end gap-2 h-32 pt-4">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '40%' }}
                                                className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '100%' }}
                                                className="flex-1 bg-blue-600 rounded-t-lg shadow-lg shadow-blue-600/20"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '60%' }}
                                                className="flex-1 bg-indigo-500 rounded-t-lg"
                                            />
                                        </div>
                                        <div className="pt-4 flex justify-between">
                                            <div className="space-y-2">
                                                <div className="h-2 w-12 bg-blue-600/20 rounded-full" />
                                                <div className="h-4 w-20 bg-blue-600/40 rounded-full" />
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative background for the card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[100px] rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Certificates Section */}
            <motion.section
                id="certificates"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.certificates.title} description={t.certificates.subtitle} />
                    <CertificateDisplay />
                    <div className="mt-12 text-center">
                        <Link to="/certificates">
                            <Button variant="outline" size="lg" className="rounded-full px-8 font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                View All Certificates <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Gallery Section */}
            <motion.section
                id="gallery"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.gallery.title} description={t.gallery.subtitle} />
                    <GalleryGrid />
                    <div className="mt-12 text-center">
                        <Link to="/gallery">
                            <Button variant="outline" size="lg" className="rounded-full px-8 font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                Explore Full Gallery <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Services Section */}
            <motion.section
                id="services"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <Services />
            </motion.section>

            {/* Claims Section */}
            <motion.section
                id="claims"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <Claims />
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
                id="testimonials"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <div className="container mx-auto px-6">
                    <SectionHeader title={t.testimonials.title} description={t.testimonials.subtitle} />
                    <TestimonialList />
                    <div className="mt-12 text-center">
                        <Link to="/testimonials">
                            <Button variant="outline" size="lg" className="rounded-full px-8 font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                                Read All Testimonials <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-16 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.testimonials.leaveReview}</h3>
                        <TestimonialForm />
                    </div>
                </div>
            </motion.section>

            {/* Contact Section */}
            <motion.section
                id="contact"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <Contact />
            </motion.section>

            {/* Global Booking Modal */}
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </div>
    );
};

export default Home;
