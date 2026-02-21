import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useLanguage } from '@/context/useLanguage';

const GalleryGrid = () => {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await api.get('/gallery/public');
            setImages(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = useCallback(() => {
        setLightboxOpen(false);
    }, []);

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

    if (loading) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    {t.gallery.loading}
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {images.map((image, index) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-sm"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={image.image_url || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&sig=${index}`}
                            alt={image.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <p className="text-white text-sm font-semibold line-clamp-2">
                                {image.title}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                            <X className="w-7 h-7" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-5xl max-h-[90vh] flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[currentIndex].image_url}
                                alt={images[currentIndex].title}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                            />
                            <div className="mt-4 text-center">
                                <p className="text-white text-lg font-medium">
                                    {images[currentIndex].title}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                    {currentIndex + 1} / {images.length}
                                </p>
                            </div>
                        </motion.div>

                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GalleryGrid;
