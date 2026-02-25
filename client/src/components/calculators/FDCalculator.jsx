import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Landmark, PiggyBank } from 'lucide-react';

const FDCalculator = () => {
    const { t } = useLanguage();
    const [totalInvestment, setTotalInvestment] = useState(100000);
    const [interestRate, setInterestRate] = useState(7);
    const [period, setPeriod] = useState(5);

    const p = totalInvestment;
    const r = interestRate / 100;
    const n = 4; // Quarterly compounding
    const t_val = period;

    const totalValue = p * Math.pow(1 + (r / n), n * t_val);
    const estReturns = totalValue - p;

    const results = {
        estReturns: Math.round(estReturns),
        totalValue: Math.round(totalValue)
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
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                    <PiggyBank className="text-amber-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.fd.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.fd.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.fd.totalInvestment}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={totalInvestment}
                                    onChange={(e) => setTotalInvestment(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-amber-600 font-black text-amber-600"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="5000" max="10000000" step="5000"
                            value={totalInvestment}
                            onChange={(e) => setTotalInvestment(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.fd.interestRate}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-amber-600 font-black text-amber-600"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="15" step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.fd.period}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={period}
                                    onChange={(e) => setPeriod(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-amber-600 font-black text-amber-600"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">yr</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="25" step="1"
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.sip.investedAmount}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalInvestment)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.fd.estReturns}</span>
                            </div>
                            <span className="font-bold text-amber-600">{formatCurrency(results.estReturns)}</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-base font-black text-slate-900 dark:text-white">{t.calculators.fd.totalValue}</span>
                            <span className="text-2xl font-black text-amber-600">{formatCurrency(results.totalValue)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FDCalculator;
