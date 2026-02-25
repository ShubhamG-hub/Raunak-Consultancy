import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import api from '@/lib/api';
import {
    Award,
    CheckCircle2,
    Users,
    TrendingUp,
    ShieldCheck,
    Target,
    Heart,
    Star,
    ArrowLeft,
    Calendar,
    BarChart2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ICON_MAP = {
    Users, TrendingUp, Award, ShieldCheck, Target, Heart, Star, CheckCircle2, Calendar, BarChart2, Info
};

const AboutDetails = () => {
    useLanguage();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await api.get('/about/public');
                setSections(data);
            } catch (err) {
                console.error('Failed to fetch about content:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const milestones = sections.filter(s => s.section_type === 'milestone').sort((a, b) => a.order_index - b.order_index);
    const stats = sections.filter(s => s.section_type === 'stat').sort((a, b) => a.order_index - b.order_index);
    const commitments = sections.filter(s => s.section_type === 'commitment').sort((a, b) => a.order_index - b.order_index);

    const getGeneral = (title, defaultValue) => {
        const item = sections.find(s => s.section_type === 'general' && s.title === title);
        return item ? item.description : defaultValue;
    };

    const heroTitle = getGeneral('Hero Main Title', 'From 2008 to 2024: Building Trust, One Family at a Time');
    const heroHighlight = getGeneral('Hero Highlight Text', 'Building Trust, One Family at a Time');
    const bioParagraphs = [
        getGeneral('Bio Paragraph 1', "My journey in financial services began more than two decades ago with a simple observation: most families worked incredibly hard for their money, but their money didn't work for them. There was a massive gap between earning and strategic wealth creation."),
        getGeneral('Bio Paragraph 2', "In 2008, I decided to bridge this gap. I set out with a mission to simplify finance and bring institutional-grade investment strategies to every household. Whether it's planning for a child's Ivy League education or building a comfortable retirement corpus, I believe every dream deserves a roadmap."),
        getGeneral('Bio Paragraph 3', "Over the years, Raunak Consultancy has evolved into a trusted name for financial advisory. But beyond the numbers and portfolios, what drives me is the \"Peace of Mind\" I see on a parent's face when they know their family's future is secure.")
    ];
    const advisorName = getGeneral('Advisor Name', 'Sudhir Mewalal Gupta');
    const advisorRole = getGeneral('Advisor Role', 'Financial Growth & Claims Expert');
    const primaryFocus = getGeneral('Primary Focus', 'Wealth Creation');
    const philosophy = getGeneral('Philosophy', 'Client Interest First');

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 md:pt-32 pb-16 md:pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 items-start">
                    {/* Left: Interactive Bio Card */}
                    <div className="lg:w-1/3 sticky top-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-50 dark:bg-slate-800 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl"
                        >
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 bg-primary-theme rounded-[2rem] rotate-6 group-hover:rotate-3 transition-transform duration-500 -z-10 opacity-20" />
                                <img
                                    src="/advisor.jpg"
                                    alt={advisorName}
                                    className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-2xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute -bottom-3 -right-3 md:-bottom-6 md:-right-6 bg-primary-theme text-white p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col items-center">
                                    <Star className="w-4 h-4 md:w-6 md:h-6 mb-1 fill-white" />
                                    <span className="text-base md:text-xl font-black">25+</span>
                                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-primary-theme/20">Years</span>
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{advisorName}</h1>
                            <p className="text-primary-theme font-bold mb-6">{advisorRole}</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-105">
                                    <Target className="w-5 h-5 text-rose-500" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Primary Focus</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{primaryFocus}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:scale-105">
                                    <Heart className="w-5 h-5 text-primary-theme" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Philosophy</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{philosophy}</p>
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
                                {heroTitle.split(':')[0]}: <br />
                                <span className="text-primary-theme">{heroTitle.split(':')[1]?.trim() || heroHighlight}</span>
                            </h2>

                            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-12">
                                {bioParagraphs.map((para, i) => para && <p key={i}>{para}</p>)}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20">
                                {stats.map((stat, i) => {
                                    const Icon = ICON_MAP[stat.icon] || BarChart2;
                                    return (
                                        <div key={i} className="text-center p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800">
                                            <Icon className={`w-8 h-8 text-primary-theme mx-auto mb-4`} />
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h4>
                                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-tight">{stat.title}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Timeline / Milestones */}
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                                <TrendingUp className="text-primary-theme" />
                                Growth Milestones
                            </h3>
                            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-12 pb-12">
                                {milestones.map((item, i) => (
                                    <div key={i} className="relative pl-12 group">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-theme border-4 border-white dark:border-slate-900 group-hover:scale-150 transition-transform duration-300" />
                                        <span className="text-primary-theme font-black text-sm uppercase tracking-widest">{item.year}</span>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">{item.title}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium whitespace-pre-wrap">{item.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* My Vision Table */}
                            <div className="bg-primary-theme rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <h3 className="text-xl md:text-3xl font-black mb-5 md:mb-8 leading-tight">My Commitment to You</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {commitments.map((promise, i) => (
                                            <div key={i} className="flex gap-4">
                                                <CheckCircle2 className="w-10 h-10 text-white/40 flex-shrink-0" />
                                                <div>
                                                    <h5 className="font-black text-lg mb-2">{promise.title}</h5>
                                                    <p className="text-white/80 text-sm leading-relaxed">{promise.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 text-center">
                                <Link to="/certificates">
                                    <Button size="lg" className="h-16 px-12 rounded-full bg-primary-theme hover:opacity-90 text-lg font-black shadow-2xl shadow-primary-theme/30 transition-all hover:scale-105">
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
