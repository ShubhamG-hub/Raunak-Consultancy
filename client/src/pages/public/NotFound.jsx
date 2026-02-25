import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background animated elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90],
                    opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] pointer-events-none"
            />

            <div className="text-center relative z-10 max-w-2xl px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-[12rem] md:text-[18rem] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
                        404
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Home size={40} strokeWidth={2.5} />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Page Not Found</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
                                <Link to="/" className="flex-1">
                                    <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold group">
                                        <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                        Go Home
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-2 font-bold dark:text-white"
                                    onClick={() => window.history.back()}
                                >
                                    Previous Page
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* SEO Optimization: Title and Meta should ideally be handled by a layout wrapper or helmet */}
        </div>
    );
};

export default NotFound;
