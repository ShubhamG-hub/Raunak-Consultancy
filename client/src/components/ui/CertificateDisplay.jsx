import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const CertificateDisplay = () => {
    const { t, language } = useLanguage();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await api.get('/certificates/public');
            setCertificates(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    {t.certificates.loading}
                </div>
            </div>
        );
    }

    if (certificates.length === 0) {
        return null;
    }

    const locales = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
                <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="group hover:shadow-xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                        <CardContent className="p-0">
                            {cert.image_url ? (
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src={cert.image_url}
                                        alt={cert.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                                    <Award className="w-16 h-16 text-blue-300 dark:text-blue-700" />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="font-bold text-slate-900 dark:text-white text-center text-sm">{cert.name}</h3>
                                {cert.expiry_date && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5">
                                        {t.certificates.validUntil}: {new Date(cert.expiry_date).toLocaleDateString(locales[language] || 'en-IN')}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

export default CertificateDisplay;
