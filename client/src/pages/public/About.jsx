import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const About = () => {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-6">

            {/* Introduction */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-10 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-1/3"
                >
                    {/* Advisor Image with Premium Border */}
                    <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group border-[6px] md:border-[12px] border-white dark:border-slate-800 shadow-blue-500/10">
                        <img
                            src="/advisor.jpg"
                            alt={t.about.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />
                    </div>
                </motion.div>

                <div className="w-full md:w-2/3 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-[10px] mb-4 inline-block">Meet Your Advisor</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                            {t.about.hello} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{t.about.name}</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {t.about.intro}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base">
                            {t.about.description}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-bold mb-6">
                            {t.about.associatedWith} <span className="text-blue-600 dark:text-blue-400">{t.stats.team}</span>.
                        </p>

                        <Link to="/about-details">
                            <Button variant="outline" className="rounded-full px-8 py-6 border-2 font-bold group hover:bg-blue-600 hover:text-white dark:text-white dark:hover:bg-blue-500 transition-all">
                                {t.about.readMore} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                            <div className="flex items-center gap-4 group p-2 transition-all">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-300">
                                    <BadgeCheck className="text-blue-600 dark:text-blue-400 w-6 h-6 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white leading-tight">{t.about.certified}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">{t.about.certifiedDesc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group p-2 transition-all">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-colors duration-300">
                                    <Target className="text-indigo-600 dark:text-indigo-400 w-6 h-6 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white leading-tight">{t.about.goalFocused}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">{t.about.unbiased}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Mission & Vision - Modern Cards */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Card className="bg-slate-900 dark:bg-slate-900/50 text-white border-none rounded-[2.5rem] overflow-hidden group h-full">
                        <CardContent className="p-6 md:p-12 text-center space-y-6 relative h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full group-hover:bg-blue-600/20 transition-all duration-500"></div>
                            <Target className="w-16 h-16 mx-auto text-blue-400 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-black">{t.about.missionTitle}</h3>
                            <p className="text-slate-400 text-base leading-relaxed">
                                {t.about.mission}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="bg-blue-600 dark:bg-blue-700 text-white border-none rounded-[2.5rem] overflow-hidden group h-full shadow-2xl shadow-blue-600/20">
                        <CardContent className="p-6 md:p-12 text-center space-y-6 relative h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full group-hover:bg-white/20 transition-all duration-500"></div>
                            <Heart className="w-16 h-16 mx-auto text-white group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-black">{t.about.valuesTitle}</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {(Array.isArray(t?.about?.values) ? t.about.values : []).map((v, i) => (
                                    <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">{v}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

        </div>
    );
};

export default About;
