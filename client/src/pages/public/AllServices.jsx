import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, Filter, Briefcase, ArrowRight,
    X, CheckCircle2, ChevronRight, Layout
} from 'lucide-react';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';
import SectionHeader from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const AllServices = () => {
    const { t } = useLanguage();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [servicesRes, categoriesRes] = await Promise.all([
                    api.get('/services'),
                    api.get('/categories')
                ]);

                const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : [];
                const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

                // Only active services and categories
                const activeServices = servicesData.filter(s => s.is_active === 1 || s.is_active === true);
                const activeCategories = categoriesData.filter(c => c.is_active === 1 || c.is_active === true);

                setServices(activeServices);
                setCategories(activeCategories);
            } catch (err) {
                console.error('Failed to fetch services data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredServices = services.filter(service => {
        const matchesSearch =
            (service.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || service.category_slug === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-theme border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <SectionHeader
                        title={t.services.title}
                        description={t.services.subtitle}
                        centered={true}
                    />
                </motion.div>

                {/* Search and Filter Section */}
                <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Search Bar */}
                        <div className="relative w-full md:flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type="text"
                                placeholder={t.services.searchServices}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-theme transition-all shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative w-full md:w-64">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="h-14 w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-theme transition-all shadow-sm apperance-none text-slate-700 dark:text-slate-300 font-bold text-sm"
                            >
                                <option value="All">{t.services.allCategories}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="mt-16">
                    <AnimatePresence mode="popLayout">
                        {filteredServices.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                layout
                            >
                                {filteredServices.map((service, index) => (
                                    <motion.div
                                        key={service.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link to={`/services/${service.category_slug}/${service.slug}`}>
                                            <Card className="group h-full rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border-b-4 border-b-transparent hover:border-b-primary-theme">
                                                <CardContent className="p-8 flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary-theme/10 text-primary-theme flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                                                            <Briefcase className="w-7 h-7" />
                                                        </div>
                                                        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {service.category_name}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary-theme transition-colors font-heading">
                                                        {service.title}
                                                    </h3>

                                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                                                        {service.short_description}
                                                    </p>

                                                    {service.features && Array.isArray(JSON.parse(service.features)) && (
                                                        <div className="space-y-3 mb-8">
                                                            {JSON.parse(service.features).slice(0, 2).map((feature, i) => (
                                                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                    <CheckCircle2 className="w-4 h-4 text-primary-theme" />
                                                                    {feature}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-primary-theme font-black text-xs uppercase tracking-[0.2em] group">
                                                        <span>{t.services.viewDetails}</span>
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-slate-50 dark:bg-slate-800/30 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                            >
                                <div className="bg-white dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.services.noServicesFound}</h3>
                                <p className="text-slate-500 font-medium">Try different keywords or check other categories.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                    className="mt-8 rounded-xl border-primary-theme text-primary-theme font-bold"
                                >
                                    Reset Filters
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AllServices;
