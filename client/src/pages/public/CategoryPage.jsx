import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Briefcase, CheckCircle2, ChevronRight, Layout } from 'lucide-react';
import api from '@/lib/api';
import SectionHeader from '@/components/layout/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CategoryPage = () => {
    const { categorySlug } = useParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const [servicesRes, categoriesRes] = await Promise.all([
                    api.get(`/services/category/${categorySlug}`),
                    api.get('/categories')
                ]);

                setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
                const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
                const currentCat = cats.find(c => c.slug === categorySlug);
                setCategory(currentCat);
            } catch (err) {
                console.error('Failed to fetch category services:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categorySlug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-theme border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!category && !loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Category Not Found</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">The category you are looking for does not exist or has been removed.</p>
                <Link to="/#services">
                    <Button className="bg-primary-theme text-white rounded-xl">Back to Services</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-6">
                {/* Back Link */}
                <Link
                    to="/#services"
                    className="inline-flex items-center gap-2 text-primary-theme font-black text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Services
                </Link>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
                    <Link to="/" className="hover:text-primary-theme transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/services" className="hover:text-primary-theme transition-colors">Services</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900 dark:text-white">{category?.name}</span>
                </nav>

                <SectionHeader
                    title={category?.name}
                    description={category?.description || `Explore our expert ${category?.name} designed to secure your financial future.`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link to={`/services/${categorySlug}/${service.slug}`}>
                                <Card className="group h-full rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border-b-4 border-b-transparent hover:border-b-primary-theme">
                                    <CardContent className="p-8 flex flex-col h-full">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-theme/10 text-primary-theme flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3">
                                            <Briefcase className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary-theme transition-colors font-heading">
                                            {service.title}
                                        </h3>

                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                                            {service.short_description}
                                        </p>

                                        {service.features && Array.isArray(service.features) && (
                                            <div className="space-y-3 mb-8">
                                                {service.features.slice(0, 3).map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        <CheckCircle2 className="w-4 h-4 text-primary-theme" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-primary-theme font-black text-xs uppercase tracking-[0.2em] group">
                                            <span>Learn More</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {services.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Layout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Services Found</h3>
                        <p className="text-slate-500 mt-2">We are currently updating our offerings for this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
