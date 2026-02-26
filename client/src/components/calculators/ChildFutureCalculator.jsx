import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Baby, GraduationCap, Heart } from 'lucide-react';

const ChildFutureCalculator = () => {
    const { t } = useLanguage();
    const [childAge, setChildAge] = useState(2);
    const [higherEdAge, setHigherEdAge] = useState(18);
    const [currentCost, setCurrentCost] = useState(1000000); // 10 Lakhs
    const [inflation, setInflation] = useState(8);

    const yearsToGoal = higherEdAge - childAge;
    const targetSavings = yearsToGoal > 0
        ? Math.round(currentCost * Math.pow(1 + (inflation / 100), yearsToGoal))
        : currentCost;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-theme/10 dark:bg-primary-theme/20 rounded-2xl flex items-center justify-center">
                    <Baby className="text-primary-theme w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.child.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.child.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.child.childAge}</Label>
                            <Input
                                type="number"
                                value={childAge}
                                onChange={(e) => setChildAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.child.higherEdAge}</Label>
                            <Input
                                type="number"
                                value={higherEdAge}
                                onChange={(e) => setHigherEdAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.child.currentCost}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={currentCost}
                                    onChange={(e) => setCurrentCost(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="100000" max="10000000" step="100000"
                            value={currentCost}
                            onChange={(e) => setCurrentCost(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.child.inflation}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={inflation}
                                    onChange={(e) => setInflation(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="15" step="0.5"
                            value={inflation}
                            onChange={(e) => setInflation(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-primary-theme/5 dark:bg-primary-theme/10 rounded-2xl border border-primary-theme/10 dark:border-primary-theme/20">
                        <GraduationCap className="text-primary-theme w-10 h-10 shrink-0" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            Education costs are rising faster than general inflation. Planning early helps in building a sufficient corpus without stress.
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-theme to-accent-theme p-6 md:p-8 rounded-[1.5rem] text-white flex flex-col justify-center items-center text-center shadow-xl shadow-primary-theme/20">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Heart className="w-8 h-8 fill-white" />
                    </div>
                    <h4 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">{t.calculators.child.savingsTarget}</h4>
                    <motion.span
                        key={targetSavings}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        {formatCurrency(targetSavings)}
                    </motion.span>
                    <p className="text-white/70 text-xs leading-relaxed max-w-[200px]">
                        Estimated amount required for your child's goal in {higherEdAge - childAge} years.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChildFutureCalculator;
