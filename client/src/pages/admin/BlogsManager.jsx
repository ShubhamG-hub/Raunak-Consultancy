import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    FileText,
    Loader2
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';
import Modal from '@/components/ui/Modal';

const BlogsManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        category: 'Planning',
        published: true
    });

    const [customCategory, setCustomCategory] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const defaultCategories = ['Tax Saving', 'Investment', 'Insurance', 'Planning'];

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/blogs');
            setBlogs(data);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (blog, action) => {
        setSelectedBlog(blog);
        if (action === 'edit') {
            setFormData({
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                content: blog.content,
                image_url: blog.image_url,
                category: blog.category,
                published: blog.published
            });
            const isDefault = defaultCategories.includes(blog.category);
            setIsCustom(!isDefault);
            if (!isDefault) setCustomCategory(blog.category);
            setIsFormModalOpen(true);
        } else if (action === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (action === 'view') {
            window.open(`/blog/${blog.slug}`, '_blank');
        } else if (action === 'toggle_published') {
            handleTogglePublished(blog);
        }
    };

    const handleTogglePublished = async (blog) => {
        try {
            await api.put(`/blogs/${blog.id}`, { published: !blog.published });
            fetchBlogs();
        } catch (error) {
            console.error('Failed to toggle blog status:', error);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/blogs/${selectedBlog.id}`);
            setBlogs(blogs.filter(b => b.id !== selectedBlog.id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalImageUrl = formData.image_url;
            let finalCategory = isCustom ? customCategory : formData.category;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('image', selectedFile);
                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.url;
            }

            const payload = { ...formData, image_url: finalImageUrl, category: finalCategory };

            if (selectedBlog) {
                await api.put(`/blogs/${selectedBlog.id}`, payload);
            } else {
                await api.post('/blogs', payload);
            }
            fetchBlogs();
            setIsFormModalOpen(false);
            setSelectedBlog(null);
            setSelectedFile(null);
            setIsCustom(false);
            setCustomCategory('');
            setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'Planning', published: true });
        } catch (err) {
            console.error('Save failed:', err);
            alert(err.response?.data?.error || 'Failed to save blog post');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-3 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Blogs Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Create and manage your articles and financial insights</p>
                </div>
                <Button onClick={() => {
                    setSelectedBlog(null);
                    setFormData({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'Planning', published: true });
                    setIsCustom(false);
                    setCustomCategory('');
                    setIsFormModalOpen(true);
                }} className="gap-2 rounded-xl bg-primary hover:opacity-90 text-white shadow-lg">
                    <Plus className="w-4 h-4" /> New Article
                </Button>
            </div>

            <div className="space-y-4">
                <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-white/10">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by title or category..."
                                className="pl-10 rounded-xl"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-slate-500">Loading articles...</p>
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-slate-500">No articles found</p>
                        </div>
                    ) : (
                        filteredBlogs.map(blog => (
                            <Card key={blog.id} className="rounded-2xl hover:shadow-md transition-all border-slate-200 dark:border-white/10 group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-200 dark:border-white/5">
                                            <img
                                                src={blog.image_url || ''}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x100?text=No+Image'; }}
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                    {blog.category}
                                                </span>
                                                <StatusBadge status={blog.published ? 'Approved' : 'Pending'} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{blog.title}</h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {blog.author || 'Admin'}</span>
                                            </div>
                                        </div>
                                        <ActionMenu
                                            actions={[
                                                { type: 'view', label: 'View Article', icon: Eye },
                                                { type: 'edit', label: 'Edit', icon: Edit },
                                                { type: 'toggle_published', label: blog.published ? 'Move to Draft' : 'Publish', icon: blog.published ? XCircle : CheckCircle },
                                                { type: 'delete', label: 'Delete', danger: true }
                                            ]}
                                            onAction={(action) => handleAction(blog, action)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedBlog ? 'Edit Article' : 'Create New Article'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter article title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL Slug</label>
                            <Input
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="eg: how-to-save-tax"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                            <select
                                className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none text-sm text-slate-900 dark:text-white"
                                value={isCustom ? 'Custom' : formData.category}
                                onChange={e => {
                                    if (e.target.value === 'Custom') {
                                        setIsCustom(true);
                                    } else {
                                        setIsCustom(false);
                                        setFormData({ ...formData, category: e.target.value });
                                    }
                                }}
                            >
                                {defaultCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="Custom">Other (Type manually...)</option>
                            </select>
                            {isCustom && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                                    <Input
                                        value={customCategory}
                                        onChange={e => setCustomCategory(e.target.value)}
                                        placeholder="Enter custom category"
                                        required={isCustom}
                                    />
                                </motion.div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Header Image</label>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm text-slate-900 dark:text-white"
                                />
                                <Input
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="Or provide Image URL..."
                                    disabled={!!selectedFile}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 flex flex-col">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Excerpt / Summary</label>
                            <textarea
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm resize-none"
                                value={formData.excerpt}
                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Short summary for the listing page..."
                                required
                            />
                        </div>
                        <div className="flex-1 space-y-2 min-h-[160px]">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Content</label>
                            <textarea
                                className="w-full h-[calc(100%-24px)] p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none text-sm font-mono resize-none"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your full article here (HTML/Markdown supported)..."
                                required
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)} className="rounded-xl px-6" disabled={submitting}>Cancel</Button>
                        <Button type="submit" className="rounded-xl px-10 bg-primary text-white" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : 'Save Article'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedBlog?.title}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Article'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BlogsManager;