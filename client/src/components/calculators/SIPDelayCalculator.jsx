import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, AlertTriangle } from 'lucide-react';

const SIPDelayCalculator = () => {
    const { t } = useLanguage();
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [period, setPeriod] = useState(20);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [delayMonths, setDelayMonths] = useState(6);

    const p = monthlyInvestment;
    const i = expectedReturn / 100 / 12;
    const n_months = period * 12;
    const d = delayMonths;

    const fvNormal = p * ((Math.pow(1 + i, n_months) - 1) / i) * (1 + i);
    const fvDelayed = p * ((Math.pow(1 + i, n_months - d) - 1) / i) * (1 + i);

    const results = {
        withoutDelay: Math.round(fvNormal),
        withDelay: Math.round(fvDelayed),
        costOfDelay: Math.round(fvNormal - fvDelayed)
    };

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
                    <Clock className="text-primary-theme w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.delay.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.delay.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.delay.monthlyInvestment}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="500" max="100000" step="500"
                            value={monthlyInvestment}
                            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.delay.period}</Label>
                                <div className="relative w-24">
                                    <Input
                                        type="number"
                                        value={period}
                                        onChange={(e) => setPeriod(Number(e.target.value))}
                                        className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">yr</span>
                                </div>
                            </div>
                            <input
                                type="range" min="1" max="40" step="1"
                                value={period}
                                onChange={(e) => setPeriod(Number(e.target.value))}
                                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.delay.delayPeriod}</Label>
                                <div className="relative w-24">
                                    <Input
                                        type="number"
                                        value={delayMonths}
                                        onChange={(e) => setDelayMonths(Number(e.target.value))}
                                        className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">mo</span>
                                </div>
                            </div>
                            <input
                                type="range" min="1" max="120" step="1"
                                value={delayMonths}
                                onChange={(e) => setDelayMonths(Number(e.target.value))}
                                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.delay.expectedReturn}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={expectedReturn}
                                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="30" step="0.5"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-sm font-bold text-slate-500">{t.calculators.delay.valueWithoutDelay}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(results.withoutDelay)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">{t.calculators.delay.valueWithDelay}</span>
                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(results.withDelay)}</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-primary-theme" />
                                <span className="text-xs font-bold text-primary-theme uppercase tracking-widest">{t.calculators.delay.costOfDelay}</span>
                            </div>
                            <span
                                className="text-3xl font-black text-primary-theme"
                            >
                                {formatCurrency(results.costOfDelay)}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
                                Compound interest waits for no one. A small delay today leads to massive wealth loss in the long run.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SIPDelayCalculator;
