import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';
import {
    ShieldCheck,
    Phone,
    Clock,
    ClipboardList,
    FileCheck,
    CheckCircle2
} from 'lucide-react';

// Input sanitizers — block invalid characters in real-time
const allowOnlyLetters = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
};
const allowOnlyDigits = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
};

const claimSchema = z.object({
    client_name: z.string()
        .min(2, "Name is required")
        .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
    email: z.string().email("Invalid email address"),
    phone: z.string()
        .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
    policy_no: z.string().optional(),
    type: z.string().min(1, "Claim type is required"),
    description: z.string().optional(),
});

const Claims = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(claimSchema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/claims', data);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit claim request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-red-600 dark:text-red-400 font-bold tracking-widest uppercase text-[10px] mb-4 inline-block">{t.claims.title}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">{t.claims.subtitle}</h2>
                    <div className="w-16 h-1.5 bg-red-600 dark:bg-red-500 mx-auto rounded-full"></div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                {/* Steps & Emergency */}
                <div className="space-y-10">
                    <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 rounded-[2.5rem] overflow-hidden transition-colors relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full group-hover:scale-110 transition-transform duration-700" />
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20 animate-pulse">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-red-900 dark:text-red-400 text-xl font-black">{t.claims.emergency}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 md:p-8">
                            <p className="text-red-800 dark:text-red-300 mb-6 text-sm font-medium leading-relaxed">{t.claims.emergencyDesc}</p>
                            <a href="tel:+919137105476">
                                <Button className="w-full sm:w-auto h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center gap-3">
                                    <Phone className="w-4 h-4" /> {t.claims.callNow}: +91 9137105476
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-600" /> {t.claims.processTitle}
                        </h3>
                        {[
                            { step: 1, title: t.claims.step1, desc: t.claims.step1Desc, icon: ClipboardList },
                            { step: 2, title: t.claims.step2, desc: t.claims.step2Desc, icon: FileCheck },
                            { step: 3, title: t.claims.step3, desc: t.claims.step3Desc, icon: CheckCircle2 },
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex gap-6 group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all duration-300">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Claim Form */}
                <Card className="border border-slate-100 dark:border-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-8 shadow-2xl shadow-red-500/5 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 dark:bg-red-900/10 rounded-bl-full -z-0"></div>

                    <CardHeader className="p-0 mb-8 relative z-10">
                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                            {t.claims.submitTrigger}
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Submit your claim request for quick processing.</p>
                    </CardHeader>

                    <CardContent className="p-0 relative z-10">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-8 rounded-[2rem] text-center"
                            >
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-xl text-green-900 dark:text-green-400 mb-2">{t.claims.successTitle}</h3>
                                <p className="text-green-700 dark:text-green-500 text-sm font-medium">{t.claims.successDesc}</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.contact.nameDetails}</label>
                                        <Input
                                            {...register('client_name')}
                                            placeholder={t.claims.formName}
                                            onInput={allowOnlyLetters}
                                            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all px-6 text-base dark:text-white"
                                        />
                                        {errors.client_name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.client_name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.claims.formPhone}</label>
                                        <Input
                                            {...register('phone')}
                                            placeholder="10-digit mobile number"
                                            onInput={allowOnlyDigits}
                                            inputMode="numeric"
                                            maxLength={10}
                                            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all px-6 text-base dark:text-white"
                                        />
                                        {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.claims.formEmail}</label>
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="email@example.com"
                                        className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all px-6 text-base dark:text-white"
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.claims.formPolicy}</label>
                                        <Input
                                            {...register('policy_no')}
                                            placeholder={t.claims.formPolicyPlaceholder}
                                            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all px-6 text-base dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.claims.formType}</label>
                                        <select
                                            {...register('type')}
                                            className="flex h-12 w-full rounded-2xl border border-transparent dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-2 text-base focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all outline-none dark:text-white"
                                        >
                                            <option value="">{t.claims.formTypeSelect}</option>
                                            <option value="Death Claim">{t.claims.formTypes.death}</option>
                                            <option value="Health Claim">{t.claims.formTypes.health}</option>
                                            <option value="Maturity Claim">{t.claims.formTypes.maturity}</option>
                                            <option value="Other">{t.claims.formTypes.other}</option>
                                        </select>
                                        {errors.type && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.type.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.claims.formDesc}</label>
                                    <textarea
                                        {...register('description')}
                                        className="flex min-h-[100px] w-full rounded-2xl border border-transparent dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4 text-base focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-red-500/10 transition-all outline-none resize-none dark:text-white"
                                        placeholder={t.claims.formDescPlaceholder}
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <Button type="submit" className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-black shadow-xl shadow-red-500/20 transition-all active:scale-[0.98]" disabled={isSubmitting}>
                                    {isSubmitting ? t.claims.submitting : t.claims.submitTrigger}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default Claims;
