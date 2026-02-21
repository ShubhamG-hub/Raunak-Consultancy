import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SectionHeader from '@/components/layout/SectionHeader';
import api from '@/lib/api';

const BlogsPreview = () => {
    const { t } = useLanguage();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await api.get('/blogs');
                // Show only first 3 blogs on home page
                setBlogs(data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (!loading && blogs.length === 0) return null;

    return (
        <section id="blogs-preview" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <SectionHeader
                            title={t.blogs.title}
                            description={t.blogs.subtitle}
                            className="text-left mx-0"
                        />
                    </div>
                    <Link to="/blogs">
                        <Button variant="outline" className="rounded-full px-8 border-2 font-bold group">
                            View All Blogs <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [1, 2, 3].map((n) => (
                            <div key={n} className="h-[450px] bg-white dark:bg-slate-800 animate-pulse rounded-[2rem] border border-slate-100 dark:border-slate-800" />
                        ))
                    ) : (
                        blogs.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={blog.image_url || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black shadow-lg">
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex-grow flex flex-col">
                                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="w-3.5 h-3.5" />
                                            {blog.author}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto">
                                        <Link to={`/blogs/${blog.slug}`} className="inline-flex items-center text-blue-600 dark:text-blue-400 font-black text-sm group/btn">
                                            {t.blogs.readMore}
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default BlogsPreview;
