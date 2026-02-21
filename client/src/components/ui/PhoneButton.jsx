import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const PhoneButton = () => {
    const [showLabel, setShowLabel] = useState(false);

    return (
        <div className="flex items-center group pointer-events-auto">
            <AnimatePresence>
                {showLabel && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="mr-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs border border-blue-100/50 dark:border-blue-900/50 whitespace-nowrap hidden md:block"
                    >
                        Call Us
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.a
                href="tel:7738658033"
                whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 15px 2px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group"
                aria-label="Call Us"
                onMouseEnter={() => setShowLabel(true)}
                onMouseLeave={() => setShowLabel(false)}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Phone className="w-6 h-6 fill-current" />
            </motion.a>
        </div>
    );
};

export default PhoneButton;
