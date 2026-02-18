import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const WhatsAppButton = () => {
    const [showLabel, setShowLabel] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowLabel(true), 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed bottom-24 right-6 z-50 flex items-center group">
            <AnimatePresence>
                {showLabel && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="mr-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs border border-green-100 dark:border-green-800 whitespace-nowrap hidden md:block"
                    >
                        WhatsApp Us
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.a
                href="https://wa.me/917738658033?text=Hi, I would like to know more about your financial services."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group"
                aria-label="Chat on WhatsApp"
                onMouseEnter={() => setShowLabel(true)}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle className="w-8 h-8 fill-current" />
            </motion.a>
        </div>
    );
};

export default WhatsAppButton;
