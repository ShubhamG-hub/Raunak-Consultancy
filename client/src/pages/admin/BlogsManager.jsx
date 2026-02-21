import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Upload,
    Loader2
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';

const BlogsManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const { data } = await api.get('/blogs');
            setBlogs(data);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog) => {
        setSelectedBlog(blog);
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
        if (!isDefault) {
            setCustomCategory(blog.category);
        }
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
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
            setShowForm(false);
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
                <Button onClick={() => { setShowForm(true); setSelectedBlog(null); }} className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> New Article
                </Button>
            </div>

            {showForm ? (
                <Card className="rounded-[2rem] border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                    <CardHeader className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                        <CardTitle>{selectedBlog ? 'Edit Article' : 'Create New Article'}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter eye-catching title"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">URL Slug</label>
                                <Input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="eg: how-to-save-tax"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                <div className="space-y-3">
                                    <select
                                        className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none"
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
                                        <option value="Tax Saving">Tax Saving</option>
                                        <option value="Investment">Investment</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Planning">Financial Planning</option>
                                        <option value="Custom">Other (Type manually...)</option>
                                    </select>

                                    {isCustom && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Input
                                                value={customCategory}
                                                onChange={e => setCustomCategory(e.target.value)}
                                                placeholder="Enter custom category name"
                                                required={isCustom}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Blog Header Image</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 italic block">Browse Local File</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 italic block">OR Image URL</label>
                                        <Input
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://..."
                                            disabled={!!selectedFile}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Excerpt / Summary</label>
                                <textarea
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none min-h-[100px]"
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="Short description for the card view"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Content (HTML Supported)</label>
                                <textarea
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none min-h-[300px] font-mono text-sm"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write your article here..."
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3 pt-6">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl" disabled={submitting}>Cancel</Button>
                                <Button type="submit" className="rounded-xl px-8" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Article'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
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
                            <p className="text-center py-12 text-slate-500">Loading articles...</p>
                        ) : filteredBlogs.length === 0 ? (
                            <p className="text-center py-12 text-slate-500">No articles found</p>
                        ) : (
                            filteredBlogs.map(blog => (
                                <Card key={blog.id} className="rounded-2xl hover:shadow-md transition-all border-slate-200 dark:border-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                <img src={blog.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.src = 'https://via.placeholder.com/150'} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                        {blog.category}
                                                    </span>
                                                    {blog.published ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                            <CheckCircle className="w-3 h-3" /> Published
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                                            <XCircle className="w-3 h-3" /> Draft
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{blog.title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(blog.created_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {blog.author}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="rounded-lg h-9 w-9" onClick={() => handleEdit(blog)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="rounded-lg h-9 w-9 text-red-600 hover:bg-red-50" onClick={() => handleDelete(blog.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogsManager;
