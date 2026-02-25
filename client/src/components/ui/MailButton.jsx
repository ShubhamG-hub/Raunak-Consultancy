import { Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/context/useLanguage';

const MailButton = () => {
    const { t } = useLanguage();
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
                        className="mr-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl text-primary-theme px-3 py-1.5 rounded-xl shadow-2xl font-bold text-xs border border-primary-theme/20 whitespace-nowrap hidden md:block"
                    >
                        {t.chatbot.floatingActions?.email || "Email Us"}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.a
                href="mailto:ms.sudhirgupta@rediffmail.com"
                whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 20px 2px var(--primary-glow)"
                }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gradient-to-br from-primary-theme to-accent-theme text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/20"
                aria-label="Email Us"
                onMouseEnter={() => setShowLabel(true)}
                onMouseLeave={() => setShowLabel(false)}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Mail className="w-6 h-6 fill-transparent" />
            </motion.a>
        </div>
    );
};

export default MailButton;
