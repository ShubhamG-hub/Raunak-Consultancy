import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/useLanguage';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const BlogDetail = () => {
    const { slug } = useParams();
    const { t } = useLanguage();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data } = await api.get(`/blogs/${slug}`);
                setBlog(data);
            } catch (error) {
                console.error('Error fetching blog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 text-center">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Blog not found</h2>
                <Link to="/blogs" className="text-blue-600 mt-4 inline-block font-bold underline">Back to Blogs</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 pb-24 transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-12">
                    <Link to="/blogs" className="inline-flex items-center text-slate-900 dark:text-white hover:text-blue-600 font-bold group transition-colors">
                        <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Insights
                    </Link>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>

                {/* Article Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-bold uppercase tracking-widest mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Tag className="w-4 h-4" />
                            {blog.category}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            5 min read
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                            SG
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Written by</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{blog.author}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Featured Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <img
                        src={blog.image_url || 'https://images.unsplash.com/photo-1454165833767-1330084bc6f8?auto=format&fit=crop&q=80&w=1200'}
                        alt={blog.title}
                        className="w-full aspect-video object-cover rounded-[3rem] shadow-2xl"
                    />
                </motion.div>

                {/* Article Content */}
                <motion.article
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="prose prose-lg md:prose-xl prose-slate dark:prose-invert max-w-none 
                        prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white
                        prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-strong:font-black prose-strong:text-blue-600
                        prose-img:rounded-[2rem] prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 
                        dark:prose-blockquote:bg-blue-900/10 prose-blockquote:p-6 prose-blockquote:rounded-2xl"
                >
                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                </motion.article>

                <hr className="my-16 border-slate-100 dark:border-slate-800" />

                {/* Related CTA */}
                <div className="bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -ml-32 -mt-32" />
                    <h3 className="text-3xl font-black mb-6 relative z-10">Have questions about this topic?</h3>
                    <p className="text-slate-400 dark:text-blue-100 mb-10 text-lg max-w-2xl mx-auto relative z-10">
                        Schedule a free one-on-one consultation with Sudhir Gupta to discuss your specific financial goals.
                    </p>
                    <Link to="/" className="relative z-10">
                        <Button className="bg-white text-slate-900 hover:bg-blue-50 rounded-full h-16 px-10 text-lg font-black transition-all hover:scale-105">
                            Book Free Consultation
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
