import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Calendar, User, ArrowRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SectionHeader from '@/components/layout/SectionHeader';
import api from '@/lib/api';

const Blogs = () => {
    const { t } = useLanguage();
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: t.blogs.categories.all },
        { id: 'Tax Saving', label: t.blogs.categories.tax },
        { id: 'Investment', label: t.blogs.categories.investment },
        { id: 'Insurance', label: t.blogs.categories.insurance },
        { id: 'Planning', label: t.blogs.categories.planning }
    ];

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await api.get('/blogs');
                setBlogs(data);
                setFilteredBlogs(data);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    useEffect(() => {
        let result = blogs;

        // Filter by category
        if (activeCategory !== 'all') {
            result = result.filter(blog => blog.category === activeCategory);
        }

        // Filter by search query
        if (searchQuery) {
            result = result.filter(blog =>
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredBlogs(result);
    }, [activeCategory, searchQuery, blogs]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-32 pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <SectionHeader
                    title={t.blogs.title}
                    description={t.blogs.subtitle}
                />

                {/* Search & Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full py-4 pl-12 pr-6 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Blogs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-[500px] bg-white dark:bg-slate-800 animate-pulse rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
                        ))
                    ) : filteredBlogs.length > 0 ? (
                        <AnimatePresence mode='popLayout'>
                            {filteredBlogs.map((blog, index) => (
                                <motion.div
                                    key={blog.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="group bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={blog.image_url || 'https://images.unsplash.com/photo-1454165833767-1330084bc6f8?auto=format&fit=crop&q=80&w=800'}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                                                {blog.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-grow flex flex-col">
                                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(blog.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {blog.author}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                                            {blog.excerpt}
                                        </p>
                                        <div className="mt-auto">
                                            <Link to={`/blogs/${blog.slug}`}>
                                                <Button className="w-full rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 h-14 font-bold transition-all shadow-xl group-hover:shadow-blue-600/20">
                                                    {t.blogs.readMore}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="col-span-full py-24 text-center">
                            <h3 className="text-2xl font-black text-slate-400">{t.blogs.noBlogs}</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
