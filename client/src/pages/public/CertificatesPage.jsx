import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import SectionHeader from '@/components/layout/SectionHeader';
import CertificateDisplay from '@/components/ui/CertificateDisplay';

const CertificatesPage = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-20 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <SectionHeader
                        title={t.certificates.title}
                        description={t.certificates.subtitle}
                        centered={true}
                    />
                </motion.div>

                <div className="mt-12">
                    <CertificateDisplay />
                </div>
            </div>
        </div>
    );
};

export default CertificatesPage;
