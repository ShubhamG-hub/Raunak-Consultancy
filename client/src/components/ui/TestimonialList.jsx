import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const TestimonialList = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await api.get('/testimonials/public');
            setTestimonials(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-primary-theme border-t-transparent rounded-full animate-spin" />
                    Loading stories...
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="h-full border-none shadow-sm hover:shadow-2xl hover:shadow-primary-theme/10 bg-white dark:bg-slate-900 rounded-[2rem] transition-all duration-500 group overflow-hidden">
                        <CardContent className="p-8 relative h-full flex flex-col">
                            <Quote className="w-12 h-12 text-primary-theme/5 absolute top-0 right-0 -translate-y-2 group-hover:text-primary-theme/10 transition-all duration-500 group-hover:scale-125" />

                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 mb-6 italic relative z-10 text-sm leading-relaxed">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-3 mt-auto">
                                <div className="w-10 h-10 rounded-full bg-primary-theme/10 flex items-center justify-center text-primary-theme">
                                    <UserCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default TestimonialList;
