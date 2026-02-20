import { useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    MessageSquare,
    CheckCircle2,
    X,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';

const bookingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    date: z.string().min(1, 'Please select a date'),
    time: z.string().min(1, 'Please select a time'),
    service_type: z.string().min(1, 'Please select a service'),
    message: z.string().optional()
});

const BookingModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            service_type: 'Investment Planning'
        }
    });

    const selectedDate = watch('date');

    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (!selectedDate) return;
            setFetchingSlots(true);
            try {
                const { data } = await api.get('/bookings/booked-slots', { params: { date: selectedDate } });
                setBookedSlots(data);
                // Reset time if it becomes invalid
                const currentTime = watch('time');
                if (data.includes(currentTime)) {
                    setValue('time', '');
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
            } finally {
                setFetchingSlots(false);
            }
        };

        fetchBookedSlots();
    }, [selectedDate, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await api.post('/bookings', data);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                reset();
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Booking Error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to book consultation. Please try again.';
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 mb-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {isSuccess ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.booking.successTitle}</h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                {t.booking.successDesc}
                            </p>
                            <Button
                                onClick={onClose}
                                className="mt-4 rounded-full px-8 bg-blue-600 hover:bg-blue-700"
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full max-h-[90vh]">
                            {/* Header */}
                            <div className="p-6 md:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <h2 className="text-2xl font-bold mb-2">{t.booking.title}</h2>
                                <p className="text-blue-100 text-sm">{t.booking.subtitle}</p>
                            </div>

                            {/* Form Area */}
                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" /> {t.booking.form.name}
                                            </label>
                                            <Input
                                                {...register('name')}
                                                placeholder={t.booking.form.namePlaceholder}
                                                className={`h-11 rounded-xl border-slate-200 dark:border-slate-800 ${errors.name ? 'border-rose-500' : ''}`}
                                            />
                                            {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Phone */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5" /> {t.booking.form.phone}
                                                </label>
                                                <Input
                                                    {...register('phone')}
                                                    placeholder={t.booking.form.phonePlaceholder}
                                                    className={`h-11 rounded-xl border-slate-200 dark:border-slate-800 ${errors.phone ? 'border-rose-500' : ''}`}
                                                />
                                                {errors.phone && <p className="text-[10px] text-rose-500 font-medium">{errors.phone.message}</p>}
                                            </div>
                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" /> {t.booking.form.email}
                                                </label>
                                                <Input
                                                    {...register('email')}
                                                    placeholder={t.booking.form.emailPlaceholder}
                                                    className={`h-11 rounded-xl border-slate-200 dark:border-slate-800 ${errors.email ? 'border-rose-500' : ''}`}
                                                />
                                                {errors.email && <p className="text-[10px] text-rose-500 font-medium">{errors.email.message}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> {t.booking.form.date}
                                                </label>
                                                <Input
                                                    type="date"
                                                    {...register('date')}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`h-11 rounded-xl border-slate-200 dark:border-slate-800 ${errors.date ? 'border-rose-500' : ''}`}
                                                />
                                                {errors.date && <p className="text-[10px] text-rose-500 font-medium">{errors.date.message}</p>}
                                            </div>
                                            {/* Time */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> {t.booking.form.time}
                                                </label>
                                                <select
                                                    {...register('time')}
                                                    disabled={fetchingSlots || !selectedDate}
                                                    className={`w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.time ? 'border-rose-500' : ''} disabled:opacity-50`}
                                                >
                                                    <option value="">{fetchingSlots ? 'Loading slots...' : t.booking.form.timeSelect}</option>
                                                    {[
                                                        "10:00 AM", "11:00 AM", "12:00 PM",
                                                        "01:00 PM", "02:00 PM", "03:00 PM",
                                                        "04:00 PM", "05:00 PM", "06:00 PM"
                                                    ].map(slot => (
                                                        <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                                                            {slot} {bookedSlots.includes(slot) ? '(Booked)' : ''}
                                                        </option>
                                                    ))}
                                                </select>

                                                {errors.time && <p className="text-[10px] text-rose-500 font-medium">{errors.time.message}</p>}
                                            </div>
                                        </div>

                                        {/* Service Type */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5" /> {t.booking.form.service}
                                            </label>
                                            <select
                                                {...register('service_type')}
                                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            >
                                                <option value="Mutual Funds & SIP">{t.booking.services.mutualFunds}</option>
                                                <option value="Tax Planning">{t.booking.services.taxPlanning}</option>
                                                <option value="Insurance Planning">{t.booking.services.insurance}</option>
                                                <option value="Health Insurance">{t.booking.services.health}</option>
                                                <option value="Retirement Planning">{t.booking.services.retirement}</option>
                                                <option value="Wealth Management">{t.booking.services.wealth}</option>
                                                <option value="Other">{t.booking.services.other}</option>
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <MessageSquare className="w-3.5 h-3.5" /> {t.booking.form.message}
                                            </label>
                                            <textarea
                                                {...register('message')}
                                                placeholder={t.booking.form.messagePlaceholder}
                                                className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                {t.booking.form.submitting}
                                            </>
                                        ) : (
                                            t.booking.form.submit
                                        )}
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400">{t.booking.form.disclaimer}</p>
                                </form>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
