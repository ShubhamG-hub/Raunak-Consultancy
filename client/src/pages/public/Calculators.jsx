import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/useLanguage';
import SectionHeader from '../../components/layout/SectionHeader';
import SIPCalculator from '@/components/calculators/SIPCalculator';
import RetirementCalculator from '@/components/calculators/RetirementCalculator';
import ChildFutureCalculator from '@/components/calculators/ChildFutureCalculator';
import LumpsumCalculator from '@/components/calculators/LumpsumCalculator';
import EMICalculator from '@/components/calculators/EMICalculator';
import FDCalculator from '@/components/calculators/FDCalculator';
import RDCalculator from '@/components/calculators/RDCalculator';
import HLVCalculator from '@/components/calculators/HLVCalculator';
import TaxCalculator from '@/components/calculators/TaxCalculator';
import SIPDelayCalculator from '@/components/calculators/SIPDelayCalculator';
import {
    TrendingUp,
    Sunset,
    Baby,
    Calculator as CalcIcon,
    Landmark,
    PiggyBank,
    Coins,
    Umbrella,
    ReceiptIndianRupee,
    Clock,
    ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';

const Calculators = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('sip');

    // Handle navigation from dropdown with state
    useEffect(() => {
        if (location.state?.activeTab) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab(location.state.activeTab);
            // Scroll to the calculator section if needed
            const element = document.getElementById('calc-container');
            if (element) {
                const navHeight = 120;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
    }, [location.state]);

    const tabs = [
        { id: 'sip', label: t.calculators.sip.title, icon: TrendingUp },
        { id: 'lumpsum', label: t.calculators.lumpsum.title, icon: CalcIcon },
        { id: 'retirement', label: t.calculators.retirement.title, icon: Sunset },
        { id: 'child', label: t.calculators.child.title, icon: Baby },
        { id: 'emi', label: t.calculators.emi.title, icon: Landmark },
        { id: 'fd', label: t.calculators.fd.title, icon: PiggyBank },
        { id: 'rd', label: t.calculators.rd.title, icon: Coins },
        { id: 'hlv', label: t.calculators.hlv.title, icon: Umbrella },
        { id: 'tax', label: t.calculators.tax.title, icon: ReceiptIndianRupee },
        { id: 'delay', label: t.calculators.delay.title, icon: Clock }
    ];

    const getActiveComponent = () => {
        switch (activeTab) {
            case 'sip': return <SIPCalculator />;
            case 'lumpsum': return <LumpsumCalculator />;
            case 'retirement': return <RetirementCalculator />;
            case 'child': return <ChildFutureCalculator />;
            case 'emi': return <EMICalculator />;
            case 'fd': return <FDCalculator />;
            case 'rd': return <RDCalculator />;
            case 'hlv': return <HLVCalculator />;
            case 'tax': return <TaxCalculator />;
            case 'delay': return <SIPDelayCalculator />;
            default: return <SIPCalculator />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 md:pt-32 pb-16 md:pb-20 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title={t.calculators.title}
                    subtitle={t.calculators.subtitle}
                    centered={true}
                />

                <div id="calc-container" className="mb-12 flex justify-center px-4 lg:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <div className="group flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-xl shadow-primary-theme/5 hover:border-primary-theme/50 transition-all duration-500 cursor-pointer w-full max-w-[320px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-theme/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        {(() => {
                                            const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || CalcIcon;
                                            return <ActiveIcon className="w-5 h-5 text-primary-theme" />;
                                        })()}
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-theme/50 leading-none mb-1">Select Tool</span>
                                        <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            {tabs.find(t => t.id === activeTab)?.label}
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-primary-theme group-hover:rotate-180 transition-all duration-500" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-[320px] p-2 rounded-2xl border-slate-100 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl shadow-2xl mt-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {tabs.map((tab) => (
                                    <DropdownMenuItem
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`rounded-xl p-3 flex items-center gap-3 transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-primary-theme text-white shadow-lg shadow-primary-theme/20'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                                        </div>
                                        <span className="font-bold text-sm">{tab.label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Desktop Tabs - Large Screens Only */}
                <div id="calc-container-desktop" className="hidden lg:flex flex-wrap justify-center gap-3 mb-16 px-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 shadow-xl shadow-primary-theme/5 text-primary-theme scale-105 border-2 border-primary-theme/20'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-800/30'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-theme' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-5xl mx-auto"
                    >
                        {getActiveComponent()}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-20 text-center max-w-2xl mx-auto">
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed italic">
                        {t.calculators.disclaimer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Calculators;
