import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Award, Star, Trophy } from 'lucide-react';
import SectionHeader from '@/components/layout/SectionHeader';
import api from '@/lib/api';

const AwardsSection = () => {
    const { t } = useLanguage();
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const { data } = await api.get('/awards');
                setAwards(data);
            } catch (error) {
                console.error('Error fetching awards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAwards();
    }, []);

    if (!loading && awards.length === 0) return null;

    return (
        <section id="awards" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title={t.awards.title}
                    description={t.awards.subtitle}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {loading ? (
                        [1, 2, 3].map((n) => (
                            <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]" />
                        ))
                    ) : (
                        awards.map((award, index) => (
                            <motion.div
                                key={award.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl overflow-hidden flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-all duration-500">
                                        {award.image_url ? (
                                            <img
                                                src={award.image_url}
                                                alt={award.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Trophy className="w-8 h-8" />
                                        )}
                                    </div>
                                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-blue-600/20 uppercase tracking-widest">
                                        {award.year}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                                    {award.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                    {award.description}
                                </p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default AwardsSection;
