import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const WhatsAppButton = () => {
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
                        className="mr-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs border border-emerald-100/50 dark:border-emerald-900/50 whitespace-nowrap hidden md:block"
                    >
                        WhatsApp Us
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.a
                href="https://wa.me/917738658033?text=Hi, I would like to know more about your financial services."
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 15px 2px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-3 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden group"
                aria-label="Chat on WhatsApp"
                onMouseEnter={() => setShowLabel(true)}
                onMouseLeave={() => setShowLabel(false)}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle className="w-6 h-6 fill-current" />
            </motion.a>
        </div>
    );
};

export default WhatsAppButton;
