import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calculator, Landmark } from 'lucide-react';

const EMICalculator = () => {
    const { t } = useLanguage();
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(15);

    const r = interestRate / 12 / 100;
    const n = loanTenure * 12;

    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - loanAmount;

    const results = {
        monthlyEMI: Math.round(emi),
        principalAmount: Math.round(loanAmount),
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount)
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
                    <Landmark className="text-primary-theme w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.emi.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.emi.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.loanAmount}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="100000" max="100000000" step="100000"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.interestRate}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="25" step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.emi.loanTenure}</Label>
                            <div className="relative w-24">
                                <Input
                                    type="number"
                                    value={loanTenure}
                                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                                    className="pr-8 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">yr</span>
                            </div>
                        </div>
                        <input
                            type="range" min="1" max="30" step="1"
                            value={loanTenure}
                            onChange={(e) => setLoanTenure(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
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
                                <div className="w-2 h-2 rounded-full bg-primary-theme" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t.calculators.emi.totalInterest}</span>
                            </div>
                            <span className="font-bold text-primary-theme">{formatCurrency(results.totalInterest)}</span>
                        </div>
                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">{t.calculators.emi.monthlyEMI}</span>
                                <span className="text-2xl font-black text-primary-theme">{formatCurrency(results.monthlyEMI)}</span>
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
