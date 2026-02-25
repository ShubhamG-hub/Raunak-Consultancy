import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppButton from './WhatsAppButton';
import PhoneButton from './PhoneButton';
import MailButton from './MailButton';
import SmartAssistant from './SmartAssistant';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

const FloatingActions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    if (isAdmin) return null;

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuVariants = {
        closed: {
            transition: {
                staggerChildren: 0.1,
                staggerDirection: -1
            }
        },
        open: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, y: 20, scale: 0.5, pointerEvents: 'none' },
        open: { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 overflow-visible">
            {/* Expanded Menu Actions */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="flex flex-col gap-4 items-end mb-2"
                    >
                        <motion.div variants={itemVariants}>
                            <PhoneButton />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <MailButton />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <WhatsAppButton />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <SmartAssistant isEmbedded={true} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <div className="relative flex flex-col items-center">
                <motion.button
                    onClick={toggleMenu}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative group overflow-hidden border border-white/20
                        ${isOpen
                            ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800'
                            : 'bg-gradient-to-br from-primary-theme to-accent-theme text-white'
                        }`}
                    aria-label={isOpen ? "Close Actions" : "Open Actions"}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="relative flex items-center justify-center w-full h-full"
                            >
                                {/* Rotating Text Ring */}
                                <motion.svg
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-full h-full p-0.5"
                                    viewBox="0 0 100 100"
                                >
                                    <defs>
                                        <path
                                            id="circlePath"
                                            d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                                        />
                                    </defs>
                                    <text className="fill-white font-black text-[12px] uppercase tracking-widest">
                                        <textPath
                                            xlinkHref="#circlePath"
                                            textLength="240"
                                            lengthAdjust="spacingAndGlyphs"
                                        >
                                            Click Me • Click Me • Click Me •
                                        </textPath>
                                    </text>
                                </motion.svg>

                                {/* Logo in Center */}
                                <img
                                    src="/Logo.png"
                                    alt="Logo"
                                    className="w-6 h-6 invert object-contain relative z-10"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

export default FloatingActions;
