import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Label } from '@/components/ui/label';
import { Calculator, ReceiptIndianRupee } from 'lucide-react';

const TaxCalculator = () => {
    const { t } = useLanguage();
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [deductions, setDeductions] = useState(150000);

    const [results, setResults] = useState({
        oldTax: 0,
        newTax: 0,
        savings: 0
    });

    const calculateOldTax = (income, deduct) => {
        const taxableIncome = Math.max(0, income - deduct - 50000); // Including Standard Deduction
        if (taxableIncome <= 500000) return 0; // Rebate 87A

        let tax = 0;
        if (taxableIncome > 250000) tax += Math.min(250000, taxableIncome - 250000) * 0.05;
        if (taxableIncome > 500000) tax += Math.min(500000, taxableIncome - 500000) * 0.20;
        if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;

        return tax * 1.04; // Including 4% Cess
    };

    const calculateNewTax = (income) => {
        const taxableIncome = Math.max(0, income - 50000); // Standard Deduction in New Regime too since FY 23-24
        if (taxableIncome <= 700000) return 0; // Rebate 87A in New Regime

        let tax = 0;
        if (taxableIncome > 300000) tax += Math.min(300000, taxableIncome - 300000) * 0.05;
        if (taxableIncome > 600000) tax += Math.min(300000, taxableIncome - 600000) * 0.10;
        if (taxableIncome > 900000) tax += Math.min(300000, taxableIncome - 900000) * 0.15;
        if (taxableIncome > 1200000) tax += Math.min(300000, taxableIncome - 1200000) * 0.20;
        if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;

        return tax * 1.40 / 1.35; // This is a bit simplified, let's just do base and 4% cess
        // Correcting: just apply 4% cess
    };

    const calculateNewTaxProper = (income) => {
        const taxableIncome = Math.max(0, income - 50000);
        if (taxableIncome <= 700000) return 0;

        let tax = 0;
        const slabs = [300000, 300000, 300000, 300000, 300000];
        const rates = [0.05, 0.10, 0.15, 0.20, 0.30];

        let remaining = taxableIncome - 300000;
        for (let i = 0; i < slabs.length; i++) {
            if (remaining > 0) {
                const taxableInSlab = Math.min(remaining, slabs[i]);
                tax += taxableInSlab * rates[i];
                remaining -= slabs[i];
            } else break;
        }
        if (remaining > 0) tax += remaining * 0.30;

        return tax * 1.04;
    };

    useEffect(() => {
        const oldTax = calculateOldTax(annualIncome, deductions);
        const newTax = calculateNewTaxProper(annualIncome);
        setResults({
            oldTax: Math.round(oldTax),
            newTax: Math.round(newTax),
            savings: Math.round(Math.abs(oldTax - newTax))
        });
    }, [annualIncome, deductions]);

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
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <ReceiptIndianRupee className="text-indigo-600 w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.calculators.tax.title}</h3>
                    <p className="text-sm text-slate-500">{t.calculators.tax.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.tax.annualIncome}</Label>
                            <span className="text-indigo-600 font-black">{formatCurrency(annualIncome)}</span>
                        </div>
                        <input
                            type="range" min="300000" max="10000000" step="50000"
                            value={annualIncome}
                            onChange={(e) => setAnnualIncome(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.calculators.tax.deductions}</Label>
                            <span className="text-indigo-600 font-black">{formatCurrency(deductions)}</span>
                        </div>
                        <input
                            type="range" min="0" max="500000" step="5000"
                            value={deductions}
                            onChange={(e) => setDeductions(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">80C, 80D, etc. (Applies to Old Regime only)</p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-bold text-slate-500">{t.calculators.tax.oldTax}</span>
                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(results.oldTax)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <span className="text-sm font-bold text-indigo-100">{t.calculators.tax.newTax}</span>
                            <span className="font-black text-white">{formatCurrency(results.newTax)}</span>
                        </div>
                        <div className="pt-4 flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.calculators.tax.savings}</span>
                            <span className="text-xl font-black text-emerald-500">
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
