import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, Phone, Mail, MessageSquare, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';

// Input sanitizers — block invalid characters in real-time
const allowOnlyLetters = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
};
const allowOnlyDigits = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
};

const contactSchema = z.object({
    name: z.string()
        .min(2, "Name is required")
        .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
    mobile: z.string()
        .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
    email: z.string()
        .email("Enter a valid email address")
        .min(5, "Email is required"),
    requirement: z.string().optional(),
});

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/leads', { ...data, type: 'contact' });
            setSuccess(true);
            reset();
        } catch (err) {
            const rawError = err.response?.data?.error;
            setError(typeof rawError === 'string' ? rawError : rawError?.message || rawError?.code || 'Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-6">
            <div className="text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-primary-theme font-bold tracking-widest uppercase text-[10px] mb-4 inline-block">{t.contact.title}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 font-display">Get In Touch</h2>
                    <div className="w-16 h-1.5 bg-primary-theme mx-auto rounded-full mb-8"></div>
                    <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Ready to secure your financial future? Contact us today for a personalized consultation.
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                {/* Contact Info - Bento Style */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden shadow-sm transition-colors">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white">
                                    <div className="p-3 bg-primary-theme rounded-2xl">
                                        <MapPin className="text-white w-5 h-5" />
                                    </div>
                                    Our Office
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                                    {t.contact.officeAddress}
                                </p>
                                <div className="h-48 md:h-72 w-full rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
                                    <iframe
                                        src="https://www.google.com/maps?q=Om+Darshan+Heights+Hanuman+Nagar+Kalyan+East&output=embed"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="Office Location"
                                        className="grayscale hover:grayscale-0 transition-all duration-700 dark:opacity-70 dark:hover:opacity-100"
                                    ></iframe>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="border-none bg-primary-theme/10 rounded-[2rem] p-6 hover:bg-primary-theme hover:text-white transition-all duration-500 group">
                                <CardContent className="p-0 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-primary-theme/10 group-hover:bg-white/20 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500">
                                        <Phone className="w-6 h-6 text-primary-theme group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <h3 className="font-black text-lg mb-1">{t.contact.phone}</h3>
                                    <p className="text-sm font-bold opacity-70 tracking-tight">+91 9137105476</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="border-none bg-accent-theme/10 rounded-[2rem] p-6 hover:bg-accent-theme hover:text-white transition-all duration-500 group">
                                <CardContent className="p-0 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 bg-accent-theme/10 group-hover:bg-white/20 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-500">
                                        <Mail className="w-6 h-6 text-accent-theme group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <h3 className="font-black text-lg mb-1">{t.contact.email}</h3>
                                    <p className="text-[10px] font-bold opacity-70 tracking-tighter break-all">ms.sudhirgupta@rediffmail.com</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Contact Form - Modern Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Card className="border border-slate-100 dark:border-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-10 shadow-2xl bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-theme/5 rounded-bl-full -z-0"></div>

                        <CardHeader className="p-0 mb-10 relative z-10 text-center">
                            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                {t.contact.formTitle}
                            </CardTitle>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">We'll get back to you within 24 hours.</p>
                        </CardHeader>

                        <CardContent className="p-0 relative z-10">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-8 rounded-[2rem] text-center"
                                >
                                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                                        <BadgeCheck className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-black text-xl text-green-900 dark:text-green-400 mb-2">{t.contact.successTitle}</h3>
                                    <p className="text-green-700 dark:text-green-500 font-medium mb-8 leading-relaxed text-sm">{t.contact.successDesc}</p>
                                    <Button variant="outline" className="h-12 px-8 rounded-full border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/50 font-bold transition-all dark:text-white" onClick={() => setSuccess(false)}>
                                        {t.contact.sendAnother}
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.contact.nameDetails}</label>
                                        <Input
                                            {...register('name')}
                                            placeholder="Your Full Name"
                                            onInput={allowOnlyLetters}
                                            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-theme/10 focus:border-primary-theme transition-all px-6 text-base dark:text-white"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.contact.mobileDetails}</label>
                                        <Input
                                            {...register('mobile')}
                                            placeholder="10-digit mobile number"
                                            onInput={allowOnlyDigits}
                                            inputMode="numeric"
                                            maxLength={10}
                                            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-theme/10 focus:border-primary-theme transition-all px-6 text-base dark:text-white"
                                        />
                                        {errors.mobile && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.mobile.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Input
                                                {...register('email')}
                                                type="email"
                                                placeholder="example@mail.com"
                                                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-theme/10 focus:border-primary-theme transition-all px-6 text-base dark:text-white"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.contact.messageDetails}</label>
                                        <textarea
                                            {...register('requirement')}
                                            className="min-h-[100px] w-full rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 px-6 py-4 text-base focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-theme/10 focus:border-primary-theme transition-all outline-none resize-none dark:text-white"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-center"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <Button type="submit" className="relative w-full h-14 rounded-2xl bg-gradient-to-br from-primary-theme via-primary-theme to-accent-theme text-white font-black shadow-xl shadow-primary-theme/20 hover:shadow-primary-theme/40 transition-all duration-500 overflow-hidden group/ctasend ring-2 ring-white/10" disabled={isSubmitting}>
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/ctasend:animate-[shimmer_1.5s_infinite]" />
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover/ctasend:opacity-10 transition-opacity duration-500" />
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isSubmitting ? t.contact.sending : t.contact.send}
                                        </span>
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
};

export default Contact;
