import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TrendingUp, PieChart, Coins } from 'lucide-react';

const SIPCalculator = () => {
    const { t } = useLanguage();
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [period, setPeriod] = useState(10);
    const [expectedReturn, setExpectedReturn] = useState(12);

    const [results, setResults] = useState({
        investedAmount: 0,
        estReturns: 0,
        totalValue: 0
    });

    useEffect(() => {
        const i = (expectedReturn / 100) / 12;
        const n = period * 12;
        const totalValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const investedAmount = monthlyInvestment * n;
        const estReturns = totalValue - investedAmount;

        setResults({
            investedAmount: Math.round(investedAmount),
            estReturns: Math.round(estReturns),
            totalValue: Math.round(totalValue)
        });
    }, [monthlyInvestment, period, expectedReturn]);

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
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.sip.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.sip.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.sip.monthlyInvestment}</Label>
                            <span className="text-blue-600 font-black">{formatCurrency(monthlyInvestment)}</span>
                        </div>
                        <input
                            type="range" min="500" max="100000" step="500"
                            value={monthlyInvestment}
                            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.sip.period}</Label>
                            <span className="text-blue-600 font-black">{period} yr</span>
                        </div>
                        <input
                            type="range" min="1" max="40" step="1"
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.sip.expectedReturn}</Label>
                            <span className="text-blue-600 font-black">{expectedReturn}%</span>
                        </div>
                        <input
                            type="range" min="1" max="30" step="0.5"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(results.investedAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.sip.estReturns}</span>
                            </div>
                            <span className="font-bold text-blue-600">{formatCurrency(results.estReturns)}</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-base font-black text-slate-900 dark:text-white">{t.calculators.sip.totalValue}</span>
                            <span className="text-2xl font-black text-blue-600">{formatCurrency(results.totalValue)}</span>
                        </div>
                    </div>

                    {/* Simplified Chart Representation */}
                    <div className="mt-8 flex gap-1 h-20 items-end">
                        <motion.div
                            animate={{ height: `${(results.investedAmount / results.totalValue) * 100}%` }}
                            className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg"
                        />
                        <motion.div
                            animate={{ height: '100%' }}
                            className="flex-1 bg-blue-600 rounded-t-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SIPCalculator;
