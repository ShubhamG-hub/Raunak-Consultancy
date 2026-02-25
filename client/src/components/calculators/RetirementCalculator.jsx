import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sunset, Calculator, Wallet } from 'lucide-react';

const RetirementCalculator = () => {
    const { t } = useLanguage();
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [monthlyExpense, setMonthlyExpense] = useState(50000);
    const [inflation, setInflation] = useState(6);

    const yearsToRetirement = retirementAge - currentAge;
    const lifeExpectancy = 85;
    const yearsInRetirement = lifeExpectancy - retirementAge;

    // Future value of monthly expense at retirement
    const futureMonthlyExpense = monthlyExpense * Math.pow(1 + (inflation / 100), yearsToRetirement);

    // Simplified retirement corpus calculation (assuming 8% return post-retirement, 6% inflation, i.e., 2% real return)
    const realReturn = 0.02;
    const r = realReturn / 12;
    const n = yearsInRetirement * 12;

    const corpusNeeded = Math.round(futureMonthlyExpense * ((1 - Math.pow(1 + r, -n)) / r));

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
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <Sunset className="text-indigo-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.retirement.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.retirement.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.retirement.currentAge}</Label>
                            <Input
                                type="number"
                                value={currentAge}
                                onChange={(e) => setCurrentAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-indigo-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.retirement.retirementAge}</Label>
                            <Input
                                type="number"
                                value={retirementAge}
                                onChange={(e) => setRetirementAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.retirement.monthlyExpense}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={monthlyExpense}
                                    onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-indigo-600 font-black text-indigo-600"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="10000" max="500000" step="5000"
                            value={monthlyExpense}
                            onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.retirement.inflation}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={inflation}
                                    onChange={(e) => setInflation(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-indigo-600 font-black text-indigo-600"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="15" step="0.5"
                            value={inflation}
                            onChange={(e) => setInflation(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 md:p-8 rounded-[1.5rem] text-white flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <h4 className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2">{t.calculators.retirement.corpusNeeded}</h4>
                    <motion.span
                        key={corpusNeeded}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        {formatCurrency(corpusNeeded)}
                    </motion.span>
                    <p className="text-indigo-100/70 text-xs leading-relaxed max-w-[200px]">
                        Target amount to maintain your lifestyle after retirement.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RetirementCalculator;
