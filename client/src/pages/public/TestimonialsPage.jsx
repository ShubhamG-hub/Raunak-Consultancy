import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import SectionHeader from '@/components/layout/SectionHeader';
import TestimonialList from '@/components/ui/TestimonialList';
import TestimonialForm from '@/components/forms/TestimonialForm';

const TestimonialsPage = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 pb-20 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <SectionHeader
                        title={t.testimonials.title}
                        description={t.testimonials.subtitle}
                        centered={true}
                    />
                </motion.div>

                <div className="mt-12 max-w-6xl mx-auto">
                    <TestimonialList />

                    <div className="mt-24 max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">
                            {t.testimonials.leaveReview}
                        </h2>
                        <TestimonialForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsPage;
