import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import {
    TrendingUp,
    ShieldCheck,
    Clock,
    Award,
    Briefcase,
    Calculator,
    ArrowLeft,
    CheckCircle2,
    BarChart3,
    HeartPulse,
    UserCircle2,
    HandIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesDetails = () => {
    const { t } = useLanguage();

    const services = [
        {
            title: t.services.mutualFunds,
            icon: TrendingUp,
            description: t.services.mutualFundsDesc,
            details: "Systematic Investment Plans (SIP) and Lumpsum investments in top-performing mutual funds tailored to your wealth goals. We focus on long-term capital appreciation while managing risk through diversified portfolios.",
            features: [
                "Custom SIP Planning",
                "Tax-Saving ELSS Funds",
                "Sector-specific & Index Funds",
                "Goal-based Portfolio Review"
            ],
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: t.services.taxPlanning,
            icon: Calculator,
            description: t.services.taxPlanningDesc,
            details: "Strategic tax planning to maximize your take-home income while ensuring full compliance with tax laws. We help you choose the best investment avenues under Section 80C, 80D, and beyond.",
            features: [
                "Section 80C Optimization",
                "Health Insurance Tax Benefits",
                "NPS & Pension Savings",
                "Capital Gains Management"
            ],
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            title: t.services.insurance,
            icon: ShieldCheck,
            description: t.services.insuranceDesc,
            details: "Comprehensive Life Insurance planning to protect your family's financial future in your absence. We specialize in Term Plans with adequate coverage and claim settlement support.",
            features: [
                "Term Life Insurance",
                "Endowment & Money-Back",
                "Claim Assistance",
                "Policy Review & Analysis"
            ],
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            title: t.services.healthInsurance,
            icon: HeartPulse,
            description: t.services.healthInsuranceDesc,
            details: "Top-tier Health Insurance solutions for you and your family. Protect your savings from rising medical costs and ensure the best healthcare without financial stress.",
            features: [
                "Family Floater Plans",
                "Critical Illness Cover",
                "Top-up & Super Top-up",
                "Cashless Hospitalization"
            ],
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-900/20"
        },
        {
            title: t.services.retirement,
            icon: Clock,
            description: t.services.retirementDesc,
            details: "Build a corpus that ensures a dignified lifestyle after retirement. We help you calculate your needs and invest in reliable pension and annuity plans.",
            features: [
                "Retirement Corpus Calculation",
                "Monthly Pension Planning",
                "Annuity Selection",
                "Inflation-protected Income"
            ],
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            title: t.services.wealthManagement,
            icon: BarChart3,
            description: t.services.wealthManagementDesc,
            details: "Holistic wealth management for high-net-worth individuals and families. We manage your entire financial ecosystem with a focus on preservation and legacy.",
            features: [
                "Asset Allocation Strategy",
                "Regular Performance Monitoring",
                "Estate & Legacy Planning",
                "Direct Equity & PMS Advice"
            ],
            color: "text-violet-600",
            bg: "bg-violet-50 dark:bg-violet-900/20"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold mb-6 group transition-colors">
                            <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            {t.nav.home}
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                            {t.nav.services} <br />
                            <span className="text-blue-600">Tailored for Your Growth</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
                            {t.services.subtitle}
                        </p>
                    </div>
                    <Link to="/#contact">
                        <Button size="lg" className="h-16 px-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                            Get Expert Advice
                        </Button>
                    </Link>
                </div>

                {/* Services Grid */}
                <div className="space-y-12">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group"
                        >
                            <div className="flex flex-col lg:flex-row">
                                <div className={`lg:w-1/3 p-12 flex flex-col justify-center items-center text-center ${service.bg}`}>
                                    <div className="w-24 h-24 mb-6 relative">
                                        <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl rotate-12 transition-transform duration-500 group-hover:rotate-[20deg] opacity-50 shadow-xl" />
                                        <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:-translate-x-2">
                                            <service.icon className={`w-12 h-12 ${service.color}`} />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{service.title}</h2>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {t.services.bestFor}: {service.title}
                                    </p>
                                </div>
                                <div className="lg:w-2/3 p-12">
                                    <div className="flex flex-col h-full">
                                        <div className="flex-grow">
                                            <h3 className="text-blue-600 font-bold mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4" />
                                                Core Offering
                                            </h3>
                                            <p className="text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-8">
                                                {service.details}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                                {service.features.map((feature, fIndex) => (
                                                    <div key={fIndex} className="flex items-center gap-3">
                                                        <div className={`p-1 rounded-full ${service.bg.replace('bg-', 'bg-opacity-50 bg-')}`}>
                                                            <CheckCircle2 className={`w-4 h-4 ${service.color}`} />
                                                        </div>
                                                        <span className="text-slate-600 dark:text-slate-400 font-bold text-sm tracking-tight">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Link to="/#contact" className="flex-1">
                                                <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black shadow-xl hover:scale-[1.02] transition-all">
                                                    Consult Now
                                                </Button>
                                            </Link>
                                            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-slate-700 font-black hover:bg-slate-50 dark:hover:bg-slate-800">
                                                View Case Study
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-24 p-12 md:p-20 bg-blue-600 rounded-[4rem] text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <span className="inline-block py-2 px-6 bg-white/10 rounded-full text-blue-100 text-xs font-black uppercase tracking-widest mb-8">
                            Ready to transform your lifestyle?
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            Start Your Financial <br /> Journey with Sudhir Gupta
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/#contact">
                                <Button size="lg" className="h-16 px-12 rounded-full bg-white text-blue-600 hover:bg-slate-100 font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                    Book Free Consultation
                                </Button>
                            </Link>
                            <Link to="/calculators">
                                <Button variant="outline" size="lg" className="h-16 px-12 rounded-full border-blue-400 text-white hover:bg-blue-700 font-black text-lg transition-all hover:scale-105 active:scale-95">
                                    Try Our Calculators
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ServicesDetails;
