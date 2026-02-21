import React from 'react';
import { motion } from 'framer-motion';
import WhatsAppButton from './WhatsAppButton';
import PhoneButton from './PhoneButton';
import MailButton from './MailButton';
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
        <div className="fixed z-50 pointer-events-none inset-0 flex flex-col justify-end items-end p-6 pb-24 md:pb-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3 pointer-events-auto items-end justify-end fixed bottom-6 right-6 px-4"
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
                    <SmartAssistant />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FloatingActions;
