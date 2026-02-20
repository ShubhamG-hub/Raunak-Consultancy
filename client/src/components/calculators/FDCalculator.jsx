import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Landmark, PiggyBank } from 'lucide-react';

const FDCalculator = () => {
    const { t } = useLanguage();
    const [totalInvestment, setTotalInvestment] = useState(100000);
    const [interestRate, setInterestRate] = useState(7);
    const [period, setPeriod] = useState(5);

    const [results, setResults] = useState({
        estReturns: 0,
        totalValue: 0
    });

    useEffect(() => {
        // Standard quarterly compounding formula
        const p = totalInvestment;
        const r = interestRate / 100;
        const n = 4; // Quarterly compounding
        const t_val = period;

        const totalValue = p * Math.pow(1 + (r / n), n * t_val);
        const estReturns = totalValue - p;

        setResults({
            estReturns: Math.round(estReturns),
            totalValue: Math.round(totalValue)
        });
    }, [totalInvestment, interestRate, period]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                    <PiggyBank className="text-amber-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.fd.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.fd.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.fd.totalInvestment}</Label>
                            <span className="text-amber-600 font-black">{formatCurrency(totalInvestment)}</span>
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
                            <span className="text-amber-600 font-black">{interestRate}%</span>
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
                            <span className="text-amber-600 font-black">{period} yr</span>
                        </div>
                        <input
                            type="range" min="1" max="25" step="1"
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
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
