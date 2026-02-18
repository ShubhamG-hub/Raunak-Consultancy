import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';

// Input sanitizer — block numbers/special chars from name field
const allowOnlyLetters = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
};

const testimonialSchema = z.object({
    name: z.string()
        .min(2, "Name is required")
        .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
    content: z.string()
        .min(10, "Review must be at least 10 characters"),
});

const TestimonialForm = ({ onSuccess }) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(testimonialSchema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await api.post('/testimonials', { ...data, rating });
            setSubmitStatus('success');
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Testimonial submission failed:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-blue-500/5 overflow-hidden transition-colors">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl text-center font-black text-slate-900 dark:text-white">{t.testimonials.formTitle}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 font-medium">Your feedback helps us serve you better</p>
            </CardHeader>
            <CardContent className="p-8">
                <AnimatePresence mode="wait">
                    {submitStatus === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-green-800 dark:text-green-400 font-bold">{t.testimonials.success}</p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Your Name</label>
                                <Input
                                    placeholder={t.testimonials.name}
                                    {...register('name', { required: true })}
                                    onInput={allowOnlyLetters}
                                    className={`h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all px-6 text-base dark:text-white ${errors.name ? 'ring-2 ring-red-500/30 border-red-200' : ''}`}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{t.testimonials.rating}</label>
                                <div className="flex gap-1 justify-center py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Your Review</label>
                                <Textarea
                                    placeholder={t.testimonials.review}
                                    {...register('content', { required: true })}
                                    className={`rounded-2xl bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all px-6 py-4 text-base min-h-[120px] resize-none dark:text-white ${errors.content ? 'ring-2 ring-red-500/30 border-red-200' : ''}`}
                                />
                                {errors.content && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.content.message}</p>}
                            </div>

                            {submitStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30"
                                >
                                    {t.testimonials.error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t.testimonials.submitting : t.testimonials.submit}
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default TestimonialForm;
