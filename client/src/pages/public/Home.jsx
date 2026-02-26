import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
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
import Claims from './Claims';
import Contact from './Contact';
import TestimonialList from '@/components/ui/TestimonialList';
import TestimonialForm from '@/components/forms/TestimonialForm';
import Services from './Services';
import CertificateDisplay from '@/components/ui/CertificateDisplay';
import GalleryGrid from '@/components/ui/GalleryGrid';
import AwardsSection from '@/components/ui/AwardsSection';
import BlogsPreview from '@/components/ui/BlogsPreview';
import Typewriter from '@/components/ui/Typewriter';

import SectionHeader from '@/components/layout/SectionHeader';

const Home = () => {
    const { t } = useLanguage();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const containerRef = useRef(null);

    const heroImages = [
        "/images/posters/WhatsApp Image 2026-02-13 at 10.51.11 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-14 at 8.44.27 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-15 at 8.29.38 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-16 at 9.13.19 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-17 at 8.36.14 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-18 at 8.35.38 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-19 at 8.57.14 AM.jpeg",
        "/images/posters/WhatsApp Image 2026-02-20 at 7.40.43 AM.jpeg"
    ];

    const nextImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, [heroImages.length]);

    const prevImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }, [heroImages.length]);

    useEffect(() => {
        const timer = setInterval(nextImage, 6000);
        return () => clearInterval(timer);
    }, [nextImage]);

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
        blue: { bg: 'bg-primary-theme/10', icon: 'text-primary-theme', shadow: 'hover:shadow-primary-theme/10' },
        indigo: { bg: 'bg-accent-theme/10', icon: 'text-accent-theme', shadow: 'hover:shadow-accent-theme/10' },
        sky: { bg: 'bg-sky-100 dark:bg-sky-900/50', icon: 'text-sky-600 dark:text-sky-400', shadow: 'hover:shadow-sky-500/10' },
        violet: { bg: 'bg-violet-100 dark:bg-violet-900/50', icon: 'text-violet-600 dark:text-violet-400', shadow: 'hover:shadow-violet-500/10' },
    };

    return (
        <div ref={containerRef} className="relative flex flex-col pb-0">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary-theme origin-left z-[60]"
                style={{ scaleX }}
            />

            {/* Hero Section - Perfectly Balanced Layout */}
            <section id="home" className="relative min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-20 transition-colors duration-500">
                <div className="container mx-auto px-6 relative z-10 h-full flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
                        {/* Left Side: Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-lg px-4 lg:px-0"
                        >
                            <span className="inline-block py-1 px-3 mb-6 font-bold text-[10px] tracking-[0.2em] uppercase text-primary-theme bg-primary-theme/10 rounded-full border border-primary-theme/20">
                                {t.nav.aboutOverview}
                            </span>

                            <h1 className="text-3xl md:text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                                {t.hero.title} <br />
                                <Typewriter
                                    words={t.hero.typingWords}
                                    className="text-primary-theme min-h-[1.2em] inline-block"
                                />
                            </h1>

                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg font-medium">
                                {t.hero.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <Button
                                    size="lg"
                                    className="relative w-full sm:w-auto h-14 px-10 text-base rounded-2xl bg-gradient-to-br from-primary-theme via-primary-theme to-accent-theme text-white font-black uppercase tracking-widest shadow-xl shadow-primary-theme/20 hover:shadow-primary-theme/40 transition-all duration-500 overflow-hidden group/hbook ring-2 ring-white/10"
                                    onClick={() => setIsBookingOpen(true)}
                                >
                                    {/* Animated Shine Effect */}
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/hbook:animate-[shimmer_1.5s_infinite]" />

                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover/hbook:opacity-10 transition-opacity duration-500" />

                                    <span className="relative z-10 flex items-center gap-2">
                                        {t.hero.ctaPrimary}
                                        <ArrowRight className="w-5 h-5 group-hover/hbook:translate-x-1 transition-transform" strokeWidth={3} />
                                    </span>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right Side: Interactive Single Image Slider */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative flex flex-col items-center gap-6 w-full"
                        >
                            {/* Slider Container - Perfectly Balanced */}
                            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] lg:aspect-auto lg:h-[70vh] max-h-[60vh] md:max-h-none rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white dark:border-slate-800 bg-white dark:bg-slate-900 group">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={heroImages[currentImageIndex]}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        onDragEnd={(e, { offset }) => {
                                            const swipe = Math.abs(offset.x) > 50;
                                            if (swipe && offset.x > 0) prevImage();
                                            else if (swipe && offset.x < 0) nextImage();
                                        }}
                                        className="w-full h-full object-contain bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing"
                                        alt="Financial Service Poster"
                                    />
                                </AnimatePresence>

                                {/* Manual Navigation Arrows */}
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
                                    <button
                                        onClick={prevImage}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 transition-all hover:scale-110 active:scale-90"
                                        aria-label="Previous image"
                                    >
                                        <ArrowRight className="w-6 h-6 rotate-180" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 transition-all hover:scale-110 active:scale-90"
                                        aria-label="Next image"
                                    >
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Indicators */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {heroImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImageIndex(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex
                                                ? "w-8 bg-primary-theme"
                                                : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Counters - Modern Bento Style */}
            <section className="container mx-auto px-6 relative z-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-8 md:-mt-12 lg:-mt-16">
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
                                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl ${colors.shadow} transition-all duration-300`}
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 ${colors.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
                                    <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${colors.icon}`} />
                                </div>
                                <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">{item.value}</h3>
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
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <About />
            </motion.section>

            {/* Services Section */}
            <motion.section
                id="services"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500"
            >
                <Services />
            </motion.section>

            {/* Financial Tools / Calculators Preview */}
            <motion.section
                id="calculators"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500 overflow-hidden relative"
            >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-12 lg:gap-16">
                        <div className="lg:w-1/2">
                            <span className="inline-block py-1 px-3 mb-4 rounded-lg bg-primary-theme/10 text-primary-theme text-xs font-bold uppercase tracking-widest">
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
                                    { icon: TrendingUp, label: t.calculators.sip.title, color: "text-primary-theme" },
                                    { icon: Sunset, label: t.calculators.retirement.title, color: "text-accent-theme" },
                                    { icon: Baby, label: t.calculators.child.title, color: "text-rose-600" },
                                    { icon: Coins, label: t.calculators.lumpsum.title, color: "text-emerald-600" }
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
                                <Button size="lg" className="h-14 px-10 rounded-full bg-primary-theme hover:opacity-90 font-bold shadow-xl transition-all group">
                                    {t.calculators.startPlanning} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                                                className="flex-1 bg-primary-theme rounded-t-lg shadow-lg"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: '60%' }}
                                                className="flex-1 bg-accent-theme rounded-t-lg"
                                            />
                                        </div>
                                        <div className="pt-4 flex justify-between">
                                            <div className="space-y-2">
                                                <div className="h-2 w-12 bg-primary-theme/20 rounded-full" />
                                                <div className="h-4 w-20 bg-primary-theme/40 rounded-full" />
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-primary-theme flex items-center justify-center text-white font-black text-xl">
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative background for the card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-theme/5 blur-[100px] rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Claims Section */}
            <motion.section
                id="claims"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <Claims />
            </motion.section>


            {/* Certificates Section */}
            <motion.section
                id="certificates"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500"
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

            {/* Awards Section */}
            <motion.section
                id="awards"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <AwardsSection />
            </motion.section>

            {/* Gallery Section */}
            <motion.section
                id="gallery"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500"
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

            {/* Testimonials Section */}
            <motion.section
                id="testimonials"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-white dark:bg-slate-900 transition-colors duration-500"
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

            {/* Blogs Section */}
            <motion.section
                id="blogs"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <BlogsPreview />
            </motion.section>

            {/* Contact Section */}
            <motion.section
                id="contact"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-10 md:py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500"
            >
                <Contact />
            </motion.section>

            {/* Global Booking Modal */}
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </div>
    );
};

export default Home;