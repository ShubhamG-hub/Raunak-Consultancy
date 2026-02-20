import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Calculator, Landmark } from 'lucide-react';

const EMICalculator = () => {
    const { t } = useLanguage();
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(15);

    const [results, setResults] = useState({
        monthlyEMI: 0,
        principalAmount: 0,
        totalInterest: 0,
        totalAmount: 0
    });

    useEffect(() => {
        const p = loanAmount;
        const r = interestRate / 12 / 100;
        const n = loanTenure * 12;

        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalAmount = emi * n;
        const totalInterest = totalAmount - p;

        setResults({
            monthlyEMI: Math.round(emi),
            principalAmount: Math.round(p),
            totalInterest: Math.round(totalInterest),
            totalAmount: Math.round(totalAmount)
        });
    }, [loanAmount, interestRate, loanTenure]);

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
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                    <Landmark className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.emi.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.emi.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.loanAmount}</Label>
                            <span className="text-emerald-600 font-black">{formatCurrency(loanAmount)}</span>
                        </div>
                        <input
                            type="range" min="100000" max="100000000" step="100000"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.interestRate}</Label>
                            <span className="text-emerald-600 font-black">{interestRate}%</span>
                        </div>
                        <input
                            type="range" min="1" max="25" step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.loanTenure}</Label>
                            <span className="text-emerald-600 font-black">{loanTenure} yr</span>
                        </div>
                        <input
                            type="range" min="1" max="30" step="1"
                            value={loanTenure}
                            onChange={(e) => setLoanTenure(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.emi.principalAmount}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(results.principalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.emi.totalInterest}</span>
                            </div>
                            <span className="font-bold text-emerald-600">{formatCurrency(results.totalInterest)}</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">{t.calculators.emi.monthlyEMI}</span>
                                <span className="text-2xl font-black text-emerald-600">{formatCurrency(results.monthlyEMI)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">{t.calculators.emi.totalAmount}</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(results.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EMICalculator;
