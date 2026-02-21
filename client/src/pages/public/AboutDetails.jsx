import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import {
    Award,
    CheckCircle2,
    Users,
    TrendingUp,
    ShieldCheck,
    Target,
    Heart,
    Star,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutDetails = () => {
    const { t } = useLanguage();

    const stats = [
        { icon: Users, label: t.stats.families, value: t.stats.familiesVal, color: "text-blue-600" },
        { icon: TrendingUp, label: t.stats.assets, value: t.stats.assetsVal, color: "text-indigo-600" },
        { icon: Award, label: "Success Rate", value: "98%", color: "text-emerald-600" },
        { icon: ShieldCheck, label: t.stats.experience, value: t.stats.experienceVal, color: "text-amber-600" }
    ];

    const milestones = [
        { year: "2008", title: "Started Journey", desc: "Began professional career as a financial advisor with a mission to help the middle class." },
        { year: "2012", title: "Corporate Excellence", desc: "Recognized as a top-performing advisor in the region for mutual fund excellence." },
        { year: "2015", title: "Raunak Consultancy Founded", desc: "Established a dedicated firm to provide holistic financial solutions under one roof." },
        { year: "2020", title: "Digital Transformation", desc: "Switched to paperless processes to provide seamless service to clients globally." },
        { year: "2023", title: "30,000+ Families", desc: "Reached a major milestone of impacting 30,000+ lives with financial security." }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 md:pt-32 pb-16 md:pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6">
                {/* Back Link */}
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold mb-12 group transition-colors">
                    <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-start">
                    {/* Left: Interactive Bio Card */}
                    <div className="lg:w-1/3 sticky top-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-50 dark:bg-slate-800 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl"
                        >
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 bg-blue-600 rounded-[2rem] rotate-6 group-hover:rotate-3 transition-transform duration-500 -z-10 opacity-20" />
                                <img
                                    src="/images/sudhir-gupta.jpg"
                                    alt="Sudhir Gupta"
                                    className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-2xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                    onError={(e) => e.target.src = "/advisor.jpg"}
                                />
                                <div className="absolute -bottom-3 -right-3 md:-bottom-6 md:-right-6 bg-blue-600 text-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col items-center">
                                    <Star className="w-4 h-4 md:w-6 md:h-6 mb-1 fill-white" />
                                    <span className="text-base md:text-xl font-black">25+</span>
                                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-blue-100">Years</span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.about.name}</h1>
                            <p className="text-blue-600 dark:text-blue-400 font-bold mb-6">{t.about.role}</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-105">
                                    <Target className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Primary Focus</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Wealth Creation</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-105">
                                    <Heart className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Philosophy</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Client Interest First</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Detailed Journey Content */}
                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 leading-tight">
                                From 2008 to 2024: <br />
                                <span className="text-blue-600">Building Trust, One Family at a Time</span>
                            </h2>

                            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-12">
                                <p>
                                    My journey in financial services began more than two decades ago with a simple observation: most families worked incredibly hard for their money, but their money didn't work for them. There was a massive gap between earning and strategic wealth creation.
                                </p>
                                <p>
                                    In 2008, I decided to bridge this gap. I set out with a mission to simplify finance and bring institutional-grade investment strategies to every household. Whether it's planning for a child's Ivy League education or building a comfortable retirement corpus, I believe every dream deserves a roadmap.
                                </p>
                                <p>
                                    Over the years, <strong>Raunak Consultancy</strong> has evolved into a trusted name for financial advisory. But beyond the numbers and portfolios, what drives me is the "Peace of Mind" I see on a parent's face when they know their family's future is secure.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20">
                                {stats.map((stat, i) => (
                                    <div key={i} className="text-center p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800">
                                        <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h4>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-tight">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline / Milestones */}
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                                <TrendingUp className="text-blue-600" />
                                Growth Milestones
                            </h3>
                            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-12 pb-12">
                                {milestones.map((item, i) => (
                                    <div key={i} className="relative pl-12 group">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900 group-hover:scale-150 transition-transform duration-300" />
                                        <span className="text-blue-600 font-black text-sm uppercase tracking-widest">{item.year}</span>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">{item.title}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* My Vision Table */}
                            <div className="bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <h3 className="text-xl md:text-3xl font-black mb-5 md:mb-8 leading-tight">My Commitment to You</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { title: "Personalized Roadmap", desc: "No cookie-cutter plans. Every strategy is built around your specific cash flow, risk appetite, and time horizon." },
                                            { title: "End-to-End Support", desc: "From claim settlement assistance to annual portfolio rebalancing — I stay with you throughout your financial journey." },
                                            { title: "Transparent Advice", desc: "Honesty is my brand. I will never recommend a product that I wouldn't invest in myself or suggest to my family." },
                                            { title: "Continuous Learning", desc: "Markets evolve, and so do we. We stay ahead with the latest tools and insights to protect your wealth." }
                                        ].map((promise, i) => (
                                            <div key={i} className="flex gap-4">
                                                <CheckCircle2 className="w-10 h-10 text-blue-200 flex-shrink-0" />
                                                <div>
                                                    <h5 className="font-black text-lg mb-2">{promise.title}</h5>
                                                    <p className="text-blue-100 text-sm leading-relaxed">{promise.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 text-center">
                                <Link to="/certificates">
                                    <Button size="lg" className="h-16 px-12 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-2xl shadow-blue-600/30 transition-all hover:scale-105">
                                        View Professional Certifications
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutDetails;
