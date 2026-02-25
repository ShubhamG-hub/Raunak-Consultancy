import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Heart, Umbrella } from 'lucide-react';

const HLVCalculator = () => {
    const { t } = useLanguage();
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [annualExpenses, setAnnualExpenses] = useState(300000);
    const [inflation] = useState(6);
    const [rateOfReturn] = useState(8);

    const n = retirementAge - currentAge;
    const surplus = annualIncome - annualExpenses;

    // Income Replacement Method
    // Real rate of return adjusted for inflation
    const realRate = ((1 + (rateOfReturn / 100)) / (1 + (inflation / 100))) - 1;

    let hlvValue = 0;
    if (realRate === 0) {
        hlvValue = surplus * n;
    } else {
        hlvValue = surplus * (1 - Math.pow(1 + realRate, -n)) / realRate;
    }

    const hlv = Math.round(hlvValue);

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
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center">
                    <Umbrella className="text-rose-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.hlv.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.hlv.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.hlv.currentAge}</Label>
                            <Input
                                type="number"
                                value={currentAge}
                                onChange={(e) => setCurrentAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-rose-500 font-black text-rose-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.calculators.hlv.retirementAge}</Label>
                            <Input
                                type="number"
                                value={retirementAge}
                                onChange={(e) => setRetirementAge(Number(e.target.value))}
                                className="h-12 rounded-xl border-slate-200 focus:ring-rose-500 font-black text-rose-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.hlv.annualIncome}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={annualIncome}
                                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-rose-600 font-black text-rose-600"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="100000" max="20000000" step="50000"
                            value={annualIncome}
                            onChange={(e) => setAnnualIncome(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.hlv.annualExpenses}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={annualExpenses}
                                    onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-rose-600 font-black text-rose-600"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="50000" max="10000000" step="50000"
                            value={annualExpenses}
                            onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 md:p-8 rounded-[1.5rem] text-white flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Heart className="w-8 h-8 fill-current" />
                    </div>
                    <h4 className="text-rose-100 text-sm font-bold uppercase tracking-widest mb-2">{t.calculators.hlv.insuranceCover}</h4>
                    <motion.span
                        key={hlv}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-4"
                    >
                        {formatCurrency(hlv)}
                    </motion.span>
                    <p className="text-rose-100/70 text-xs leading-relaxed max-w-[250px]">
                        This is the estimated amount of life cover required to replace your income for your family's future.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HLVCalculator;
