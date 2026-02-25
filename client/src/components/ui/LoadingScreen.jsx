import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col items-center justify-center"
        >
            <div className="relative flex flex-col items-center">
                {/* Logo with pulse effect */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.1, 1],
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    className="mb-6"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 0, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-primary-theme/20 rounded-full blur-xl"
                        />
                        <img
                            src="/Logo.png"
                            alt="Raunak Consultancy"
                            className="w-24 h-24 object-contain relative z-10 drop-shadow-2xl"
                        />
                    </div>
                </motion.div>

                {/* Company Name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-3xl font-bold bg-primary-theme bg-clip-text text-transparent mb-2">
                        Raunak Consultancy
                    </h1>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
