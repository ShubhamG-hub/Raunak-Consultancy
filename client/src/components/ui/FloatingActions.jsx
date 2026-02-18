import React from 'react';
import { motion } from 'framer-motion';
import WhatsAppButton from './WhatsAppButton';
import PhoneButton from './PhoneButton';
import SmartAssistant from './SmartAssistant';
import { useLocation } from 'react-router-dom';

const FloatingActions = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    if (isAdmin) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="fixed z-50 pointer-events-none inset-0 flex flex-col md:justify-center md:items-end px-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-row md:flex-col gap-4 pointer-events-auto items-center justify-center md:justify-end fixed bottom-6 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto px-4"
            >
                <motion.div variants={itemVariants}>
                    <PhoneButton />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <WhatsAppButton />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <SmartAssistant />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FloatingActions;
