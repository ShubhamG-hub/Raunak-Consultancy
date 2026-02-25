import { motion } from 'framer-motion';

const SectionHeader = ({ tag, title, description, subtitle, accent = 'blue', centered = true }) => {
    const accentColors = {
        blue: 'text-primary-theme bg-primary-theme/10 border-primary-theme/20',
        blueLine: 'bg-primary-theme',
    };

    // Use subtitle if description is not provided (for calculators page)
    const displayDescription = description || subtitle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl mb-16`}
        >
            {tag && (
                <span className={`inline-block py-1.5 px-4 mb-4 font-bold text-[10px] tracking-widest uppercase ${accentColors[accent]} rounded-full border`}>
                    {tag}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{title}</h2>
            <div className={`w-16 h-1.5 ${accentColors.blueLine} ${centered ? 'mx-auto' : ''} rounded-full mb-6`} />
            {displayDescription && (
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{displayDescription}</p>
            )}
        </motion.div>
    );
};

export default SectionHeader;
