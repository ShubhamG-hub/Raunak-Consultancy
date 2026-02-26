import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Layout, Shield, TrendingUp,
    Calculator, FileText, Briefcase, Heart, Users
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';
import SectionHeader from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const iconMap = {
    Layout,
    Shield,
    TrendingUp,
    Calculator,
    FileText,
    Briefcase,
    Heart,
    Users
};

const Services = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = Array.isArray(data) ? data : [];
                setCategories(cats.filter(c => c.is_active === 1 || c.is_active === true));
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-primary-theme border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section id="services" className="bg-white dark:bg-slate-900 transition-colors duration-500 overflow-hidden relative">
            <div className="container mx-auto px-6 relative z-10">
                <SectionHeader
                    title={t.services.title}
                    description={t.services.subtitle}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.slice(0, 6).map((category, index) => {
                        const Icon = iconMap[category.icon] || Layout;
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link to={`/services/${category.slug}`}>
                                    <Card className="group h-full rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary-theme/5 transition-all duration-500 overflow-hidden cursor-pointer">
                                        <CardContent className="p-5 md:p-8 flex flex-col h-full relative">
                                            {/* Decorative Background Blob */}
                                            <div
                                                className="absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-primary-theme/20"
                                            />

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary-theme/10 text-primary-theme flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-theme group-hover:text-white transition-colors duration-300">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary-theme transition-colors font-heading">
                                                {category.name}
                                            </h3>

                                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                                                {category.description || `Explore our comprehensive range of ${category.name} tailored for you.`}
                                            </p>

                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-theme">
                                                    View Services
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}


                </div>

                <div className="mt-16 text-center">
                    <Link to="/services">
                        <Button size="lg" className="relative h-14 px-10 rounded-full bg-gradient-to-br from-primary-theme via-primary-theme to-accent-theme text-white font-black shadow-xl shadow-primary-theme/20 hover:shadow-primary-theme/40 transition-all duration-500 overflow-hidden group/svc ring-2 ring-white/10">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/svc:animate-[shimmer_1.5s_infinite]" />
                            <div className="absolute inset-0 bg-white opacity-0 group-hover/svc:opacity-10 transition-opacity duration-500" />
                            <span className="relative z-10 flex items-center gap-2">
                                {t.services.exploreAll}
                                <ArrowRight className="w-5 h-5 group-hover/svc:translate-x-1 transition-transform" strokeWidth={3} />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Services;

