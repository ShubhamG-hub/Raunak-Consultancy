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
    Briefcase,
    MapPin,
    Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';

const bookingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string()
        .min(10, 'Please enter a valid 10-digit phone number')
        .max(12, 'Phone number too long')
        .regex(/^[0-9]{10,12}$/, 'Only digits allowed, 10-12 digits'),
    date: z.string().min(1, 'Please select a date'),
    time: z.string().min(1, 'Please select a time slot'),
    service_type: z.string().min(1, 'Please select a service'),
    meeting_mode: z.enum(['In-Person', 'Online']),
    message: z.string().optional()
});

const SERVICES = [
    { value: 'Mutual Funds & SIP', labelKey: 'mutualFunds' },
    { value: 'Tax Planning', labelKey: 'taxPlanning' },
    { value: 'Insurance Planning', labelKey: 'insurance' },
    { value: 'Health Insurance', labelKey: 'health' },
    { value: 'Retirement Planning', labelKey: 'retirement' },
    { value: 'Wealth Management', labelKey: 'wealth' },
    { value: 'Business Planning', labelKey: 'businessPlanning' },
    { value: 'Complete Financial Planning', labelKey: 'completeFinancialPlanning' },
    { value: 'Scientific Financial Planning', labelKey: 'scientificFinancialPlanning' },
    { value: 'Adequate Planning', labelKey: 'adequatePlanning' },
    { value: 'Child Education Planning', labelKey: 'childEducation' },
    { value: 'Business Insurance', labelKey: 'businessInsurance' },
    { value: 'Other', labelKey: 'other' },
];

const TIME_SLOTS = [
    "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM"
];

const BookingModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [apiError, setApiError] = useState('');

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
            service_type: 'Mutual Funds & SIP',
            meeting_mode: 'In-Person'
        }
    });

    const meetingMode = watch('meeting_mode');

    const selectedDate = watch('date');

    // Block body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        if (!selectedDate) return;
        const fetchBookedSlots = async () => {
            setFetchingSlots(true);
            try {
                const { data } = await api.get('/bookings/booked-slots', { params: { date: selectedDate } });
                setBookedSlots(Array.isArray(data) ? data : []);
                // Clear selected time if now booked
                const currentTime = watch('time');
                if (currentTime && data.includes(currentTime)) {
                    setValue('time', '');
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
                setBookedSlots([]);
            } finally {
                setFetchingSlots(false);
            }
        };
        fetchBookedSlots();
    }, [selectedDate, setValue, watch]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setApiError('');
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
            setApiError(error.response?.data?.error || 'Failed to book consultation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setApiError('');
        onClose();
    };

    if (!isOpen) return null;

    // Today's date in YYYY-MM-DD for min constraint
    const today = new Date().toLocaleDateString('en-CA'); // local date, not UTC

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    {isSuccess ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 flex-1">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.booking.successTitle}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                                {t.booking.successDesc}
                            </p>
                            <Button
                                onClick={handleClose}
                                className="mt-4 rounded-full px-8 bg-primary-theme hover:opacity-90"
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Header — fixed */}
                            <div className="p-5 md:p-8 bg-gradient-to-br from-primary-theme to-primary-theme/80 text-white relative flex-shrink-0">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                                <h2 className="text-2xl font-bold mb-1">{t.booking.title}</h2>
                                <p className="text-white/80 text-sm">{t.booking.subtitle}</p>
                            </div>

                            {/* Form — scrollable */}
                            <div className="overflow-y-auto flex-1 p-5 md:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                    {/* Meeting Mode Toggle */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Video className="w-3.5 h-3.5" /> Consultation Mode
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: 'In-Person', icon: MapPin, label: 'In-Person', desc: 'Visit our office' },
                                                { value: 'Online', icon: Video, label: 'Online (Zoom)', desc: 'Zoom link sent by WhatsApp' },
                                                // eslint-disable-next-line no-unused-vars
                                            ].map(({ value, icon: Icon, label, desc }) => (
                                                <label
                                                    key={value}
                                                    className={`flex flex-col items-center gap-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all select-none ${meetingMode === value
                                                        ? 'border-primary-theme bg-primary-theme/5 text-primary-theme'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-theme/50 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <input type="radio" value={value} {...register('meeting_mode')} className="sr-only" />
                                                    <Icon className={`w-5 h-5 ${meetingMode === value ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    <span className="text-xs font-bold">{label}</span>
                                                    <span className="text-[9px] leading-tight opacity-70">{desc}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {meetingMode === 'Online' && (
                                            <p className="text-[10px] text-primary-theme font-medium flex items-center gap-1 mt-1">
                                                <Video className="w-3 h-3" /> A Zoom meeting link will be sent to your WhatsApp after confirmation.
                                            </p>
                                        )}
                                    </div>
                                    {/* API Error Banner */}
                                    {apiError && (
                                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-sm text-rose-600 dark:text-rose-400 font-medium">
                                            {apiError}
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" /> {t.booking.form.name}
                                        </label>
                                        <Input
                                            {...register('name')}
                                            placeholder={t.booking.form.namePlaceholder}
                                            className={`h-11 rounded-xl ${errors.name ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                        />
                                        {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>}
                                    </div>

                                    {/* Phone + Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" /> {t.booking.form.phone}
                                            </label>
                                            <Input
                                                {...register('phone')}
                                                placeholder={t.booking.form.phonePlaceholder}
                                                type="tel"
                                                inputMode="numeric"
                                                className={`h-11 rounded-xl ${errors.phone ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                            />
                                            {errors.phone && <p className="text-[10px] text-rose-500 font-medium">{errors.phone.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5" /> {t.booking.form.email}
                                            </label>
                                            <Input
                                                {...register('email')}
                                                placeholder={t.booking.form.emailPlaceholder}
                                                type="email"
                                                className={`h-11 rounded-xl ${errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                            />
                                            {errors.email && <p className="text-[10px] text-rose-500 font-medium">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    {/* Date + Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> {t.booking.form.date}
                                            </label>
                                            <Input
                                                type="date"
                                                {...register('date')}
                                                min={today}
                                                className={`h-11 rounded-xl ${errors.date ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
                                            />
                                            {errors.date && <p className="text-[10px] text-rose-500 font-medium">{errors.date.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> {t.booking.form.time}
                                            </label>
                                            <select
                                                {...register('time')}
                                                disabled={fetchingSlots || !selectedDate}
                                                className={`w-full h-11 px-3 rounded-xl border bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-theme transition-all disabled:opacity-50 cursor-pointer ${errors.time ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
                                            >
                                                <option value="">
                                                    {!selectedDate ? 'Select date first' : fetchingSlots ? 'Loading slots...' : t.booking.form.timeSelect}
                                                </option>
                                                {TIME_SLOTS.map(slot => (
                                                    <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                                                        {slot}{bookedSlots.includes(slot) ? ' (Booked)' : ''}
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
                                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-theme transition-all cursor-pointer"
                                        >
                                            {SERVICES.map(s => (
                                                <option key={s.value} value={s.value}>{t.booking.services[s.labelKey]}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" /> {t.booking.form.message}
                                            <span className="text-slate-300 dark:text-slate-600 normal-case font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            {...register('message')}
                                            placeholder={t.booking.form.messagePlaceholder}
                                            rows={3}
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-theme transition-all resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 bg-primary-theme hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-primary-theme/20 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t.booking.form.submitting}
                                            </>
                                        ) : t.booking.form.submit}
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400">{t.booking.form.disclaimer}</p>
                                </form>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence >
    );
};

export default BookingModal;
