import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReceiptIndianRupee } from 'lucide-react';

// Old Tax Regime slabs (with deductions)
function calculateOldTax(income, deductions) {
    const taxableIncome = Math.max(0, income - deductions);
    let tax = 0;
    if (taxableIncome <= 250000) tax = 0;
    else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
    else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
    else tax = 112500 + (taxableIncome - 1000000) * 0.30;
    // Add 4% health & education cess
    return tax + tax * 0.04;
}

// New Tax Regime slabs (FY 2024-25 proper slabs)
function calculateNewTaxProper(income) {
    let tax = 0;
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = (income - 300000) * 0.05;
    else if (income <= 900000) tax = 15000 + (income - 600000) * 0.10;
    else if (income <= 1200000) tax = 45000 + (income - 900000) * 0.15;
    else if (income <= 1500000) tax = 90000 + (income - 1200000) * 0.20;
    else tax = 150000 + (income - 1500000) * 0.30;
    // Add 4% health & education cess
    return tax + tax * 0.04;
}

const TaxCalculator = () => {
    const { t } = useLanguage();
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [deductions, setDeductions] = useState(150000);

    const oldTax = calculateOldTax(annualIncome, deductions);
    const newTax = calculateNewTaxProper(annualIncome);
    const results = {
        oldTax: Math.round(oldTax),
        newTax: Math.round(newTax),
        savings: Math.round(Math.abs(oldTax - newTax))
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
                    <ReceiptIndianRupee className="text-primary-theme w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.tax.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.tax.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.tax.annualIncome}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={annualIncome}
                                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="300000" max="10000000" step="50000"
                            value={annualIncome}
                            onChange={(e) => setAnnualIncome(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.tax.deductions}</Label>
                            <div className="relative w-36">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={deductions}
                                    onChange={(e) => setDeductions(Number(e.target.value))}
                                    className="pl-7 h-9 rounded-lg border-slate-200 focus:ring-primary-theme font-black text-primary-theme"
                                />
                            </div>
                        </div>
                        <input
                            type="range" min="0" max="500000" step="5000"
                            value={deductions}
                            onChange={(e) => setDeductions(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-theme"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">80C, 80D, etc. (Applies to Old Regime only)</p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-bold text-slate-500">{t.calculators.tax.oldTax}</span>
                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(results.oldTax)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-primary-theme shadow-lg shadow-primary-theme/20 dark:shadow-none">
                            <span className="text-sm font-bold text-white/80">{t.calculators.tax.newTax}</span>
                            <span className="font-black text-white">{formatCurrency(results.newTax)}</span>
                        </div>
                        <div className="pt-4 flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.calculators.tax.savings}</span>
                            <span className="text-xl font-black text-primary-theme">
                                {formatCurrency(results.savings)}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                                {results.newTax < results.oldTax ? "Switch to New Regime to save" : "Stay in Old Regime to save"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxCalculator;
