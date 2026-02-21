import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShieldCheck, Clock, Award, Briefcase, Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';

const Services = () => {
    const { t } = useLanguage();

    const servicesData = [
        {
            title: t.services.mutualFunds,
            icon: TrendingUp,
            description: t.services.mutualFundsDesc,
            forWhom: t.services.mutualFunds,
            risk: t.services.riskProfile,
        },
        {
            title: t.services.taxPlanning,
            icon: Calculator,
            description: t.services.taxPlanningDesc,
            forWhom: t.services.taxPlanning,
            risk: t.services.riskProfile,
        },
        {
            title: t.services.insurance,
            icon: ShieldCheck,
            description: t.services.insuranceDesc,
            forWhom: t.services.insurance,
            risk: t.services.riskProfile,
        },
        {
            title: t.services.retirement,
            icon: Clock,
            description: t.services.retirementDesc,
            forWhom: t.services.retirement,
            risk: t.services.riskProfile,
        },
        {
            title: t.services.healthInsurance,
            icon: Award,
            description: t.services.healthInsuranceDesc,
            forWhom: t.services.healthInsurance,
            risk: t.services.riskProfile,
        },
        {
            title: t.services.wealthManagement,
            icon: Briefcase,
            description: t.services.wealthManagementDesc,
            forWhom: t.services.wealthManagement,
            risk: t.services.riskProfile,
        },
    ];

    return (
        <div className="container mx-auto px-6">
            <div className="text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-[10px] mb-4 inline-block">{t.services.title}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">{t.services.subtitle}</h2>
                    <div className="w-16 h-1.5 bg-blue-600 dark:bg-blue-500 mx-auto rounded-full mb-8"></div>
                    <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Explore our comprehensive range of financial solutions tailored to your unique life goals.
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesData.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="group relative bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 p-5 md:p-8 transition-all duration-300 overflow-hidden"
                    >
                        {/* Decorative background pulse */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 dark:bg-blue-400/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10 text-left">
                            <div className="w-16 h-16 mb-8 relative group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
                                <div className="absolute inset-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                                    <service.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{service.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-sm h-12 line-clamp-2">
                                {service.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {t.services.bestFor}: <span className="text-slate-900 dark:text-slate-200">{service.title}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black group-hover:gap-3 transition-all tracking-widest text-[10px] uppercase"
                            >
                                {t.services.learnMore} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <Link to="/services">
                    <Button
                        size="lg"
                        className="h-14 px-10 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold shadow-xl border border-slate-200 dark:border-slate-700 group transition-all duration-300"
                    >
                        {t.services.exploreAll}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Disclaimer Strip */}
            <div className="mt-12 md:mt-16 bg-slate-100 dark:bg-slate-900/50 p-4 md:p-6 rounded-lg text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
                <p><strong>Disclaimer:</strong> {t.services.disclaimer}</p>
            </div>
        </div>
    );
};

export default Services;
