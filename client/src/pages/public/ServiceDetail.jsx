import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Shield,
    ArrowRight, MessageSquare, Phone, MapPin,
    ChevronRight, Briefcase
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BookingModal from '@/components/ui/BookingModal';

const ServiceDetail = () => {
    const { categorySlug, serviceSlug } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        const fetchServiceDetail = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/services/${categorySlug}/${serviceSlug}`);
                setService(data);
            } catch (err) {
                console.error('Failed to fetch service details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceDetail();
    }, [categorySlug, serviceSlug]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-theme border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Service Not Found</h2>
                <Link to="/">
                    <Button className="bg-primary-theme text-white rounded-xl">Back to Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 md:pt-32 pb-24 dark:bg-slate-950 transition-colors duration-500">
            <div className="container mx-auto px-6">
                {/* Back Link */}
                <Link
                    to={`/services/${categorySlug}`}
                    className="inline-flex items-center gap-2 text-primary-theme font-black text-xs uppercase tracking-[0.2em] mb-6 hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {service.category_name}
                </Link>
                {/* Breadcrumbs */}
                <nav className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 md:mb-12">
                    <Link to="/" className="hover:text-primary-theme transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to={`/services/${categorySlug}`} className="hover:text-primary-theme transition-colors">{service.category_name}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900 dark:text-white">{service.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Left Side: Content */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-theme/10 text-primary-theme text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-theme/20">
                                <Briefcase className="w-3.5 h-3.5" />
                                {service.category_name}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight font-heading">
                                {service.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                {service.short_description}
                            </p>
                        </motion.div>

                        <div className="w-full h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />

                        {/* Detailed Description */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading underline decoration-primary-theme/30 decoration-8 underline-offset-[-2px]">Overview</h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-loose text-lg font-medium">
                                {service.full_description || "Detailed information for this service is coming soon."}
                            </div>
                        </motion.div>

                        {/* Benefits & Features Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Benefits */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800"
                            >
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 font-heading">
                                    <div className="w-10 h-10 rounded-xl bg-primary-theme text-white flex items-center justify-center">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    The Benefits
                                </h3>
                                <ul className="space-y-6">
                                    {service.benefits && Array.isArray(service.benefits) ? service.benefits.map((benefit, i) => (
                                        <li key={i} className="flex gap-4 items-start group">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-primary-theme/10 flex items-center justify-center shrink-0 group-hover:bg-primary-theme transition-colors">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-theme group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300 font-bold text-sm md:text-base">{benefit}</span>
                                        </li>
                                    )) : <li className="text-slate-500 italic">No benefits listed.</li>}
                                </ul>
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-primary-theme p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-primary-theme/20"
                            >
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3 font-heading">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    Key Features
                                </h3>
                                <ul className="space-y-6">
                                    {service.features && Array.isArray(service.features) ? service.features.map((feature, i) => (
                                        <li key={i} className="flex gap-4 items-start group">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </div>
                                            <span className="font-bold text-sm md:text-base opacity-90">{feature}</span>
                                        </li>
                                    )) : <li className="italic opacity-70">No features listed.</li>}
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side: Sticky Info & CTA */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-8">
                            <Card className="rounded-[3rem] overflow-hidden border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                                <CardContent className="p-8 md:p-10">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 font-heading">Get Started Today</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                                        Ready to secure your future with our {service.title}? Speak with our expert advisors for a personalized consultation.
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <Button
                                            onClick={() => setIsBookingOpen(true)}
                                            className="w-full h-14 rounded-2xl bg-primary-theme text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-theme/20 hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            Book Consultation <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                        <a href="https://wa.me/917738658033" target="_blank" rel="noopener noreferrer" className="block">
                                            <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.2em] gap-2">
                                                <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Us
                                            </Button>
                                        </a>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Expert</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-theme/20">
                                                <img src="/advisor.jpg" alt="Sudhir Gupta" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white text-sm">Sudhir Gupta</h4>
                                                <p className="text-xs font-bold text-primary-theme">Financial Advisor</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Help Box */}
                            <div className="p-8 md:p-10 rounded-[3.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-theme/20 blur-[60px] rounded-full" />
                                <h4 className="text-xl font-black mb-4 relative z-10 font-heading">Need Help?</h4>
                                <p className="text-xs md:text-sm text-slate-400 mb-8 leading-relaxed font-medium relative z-10">
                                    For any queries regarding this service, our support team is available from 10 AM to 6 PM.
                                </p>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">
                                        <Phone className="w-4 h-4 text-primary-theme" />
                                        +91 9137105476
                                    </div>
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">
                                        <MapPin className="w-4 h-4 text-primary-theme" />
                                        Kalyan, Mumbai
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        </div>
    );
};

export default ServiceDetail;
