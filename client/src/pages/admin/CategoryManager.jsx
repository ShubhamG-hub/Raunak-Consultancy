import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import ActionMenu from '@/components/admin/ActionMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Loader2, Edit, Layout, Settings,
    Eye, EyeOff, SortAsc, Search
} from 'lucide-react';

const CategoryManager = ({ isEmbedded = false, onCategoryChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        icon: 'Layout',
        show_on_homepage: true,
        display_order: 0,
        is_active: true
    });

    const icons = ['Layout', 'Shield', 'TrendingUp', 'Calculator', 'FileText', 'Briefcase', 'Heart', 'Users'];

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            if (onCategoryChange) onCategoryChange(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    }, [onCategoryChange]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAction = (category, action) => {
        setSelectedCategory(category);
        if (action === 'edit') {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                slug: category.slug || '',
                icon: category.icon || 'Layout',
                show_on_homepage: category.show_on_homepage === 1 || category.show_on_homepage === true,
                display_order: category.display_order || 0,
                is_active: category.is_active === 1 || category.is_active === true
            });
            setIsFormModalOpen(true);
        } else if (action === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (action === 'toggle_active') {
            handleUpdateStatus(category, 'is_active', !(category.is_active === 1 || category.is_active === true));
        } else if (action === 'toggle_homepage') {
            handleUpdateStatus(category, 'show_on_homepage', !(category.show_on_homepage === 1 || category.show_on_homepage === true));
        }
    };

    const handleUpdateStatus = async (category, field, value) => {
        try {
            await api.put(`/categories/${category.id}`, {
                ...category,
                [field]: value ? 1 : 0
            });
            fetchCategories();
        } catch (err) {
            console.error(`Toggle ${field} failed:`, err);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/categories/${selectedCategory.id}`);
            setCategories(categories.filter(c => c.id !== selectedCategory.id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.error || 'Failed to delete category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                show_on_homepage: formData.show_on_homepage ? 1 : 0,
                is_active: formData.is_active ? 1 : 0
            };

            if (selectedCategory) {
                await api.put(`/categories/${selectedCategory.id}`, payload);
            } else {
                await api.post('/categories', payload);
            }
            fetchCategories();
            setIsFormModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Save failed:', err);
            alert(err.response?.data?.error || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const generateSlug = () => {
        const slug = formData.name.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const resetForm = () => {
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            slug: '',
            icon: 'Layout',
            show_on_homepage: true,
            display_order: 0,
            is_active: true
        });
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`${isEmbedded ? '' : 'p-3 md:p-6'} space-y-6`}>
            {!isEmbedded && (
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-heading">Category Management</h1>
                        <p className="text-slate-600 mt-1">Organize your services into logical groups</p>
                    </div>
                    <Button onClick={() => {
                        resetForm();
                        setIsFormModalOpen(true);
                    }} className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> Add Category
                    </Button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200"
                    />
                </div>
                {isEmbedded && (
                    <Button onClick={() => {
                        resetForm();
                        setIsFormModalOpen(true);
                    }} className="w-full md:w-auto gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-primary-theme/20">
                        <Plus className="w-4 h-4" /> Add Category
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-theme" />
                        <p className="text-slate-500">Fetching categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                        <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No categories found</h3>
                        <p className="text-slate-500">
                            {searchQuery ? "Try searching for something else" : "Click the button above to add your first category"}
                        </p>
                    </div>
                ) : (
                    filteredCategories.map(category => (
                        <Card key={category.id} className={`rounded-2xl group overflow-hidden border-slate-200 dark:border-white/10 hover:shadow-lg transition-all duration-300 ${(!category.is_active || category.is_active === 0) ? 'opacity-60' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Layout className="w-6 h-6" />
                                    </div>
                                    <ActionMenu
                                        actions={[
                                            { type: 'edit', label: 'Edit', icon: Edit },
                                            { type: 'toggle_active', label: (category.is_active === 1) ? 'Deactivate' : 'Activate', icon: Settings },
                                            { type: 'toggle_homepage', label: (category.show_on_homepage === 1) ? 'Hide from Home' : 'Show on Home', icon: Eye },
                                            { type: 'delete', label: 'Delete', danger: true }
                                        ]}
                                        onAction={(action) => handleAction(category, action)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold line-clamp-1 font-heading">{category.name}</h3>
                                        {(!category.is_active || category.is_active === 0) && (
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">/{category.slug}</p>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 line-clamp-2">{category.description || 'No description provided.'}</p>

                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${category.show_on_homepage ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {category.show_on_homepage ? 'On Homepage' : 'Hidden'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <SortAsc className="w-3 h-3" />
                                        <span>Order: {category.display_order}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedCategory ? 'Edit Category' : 'Add New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                onBlur={!selectedCategory ? generateSlug : undefined}
                                required
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slug (URL Path)</label>
                            <Input
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Icon</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none text-sm"
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                            >
                                {icons.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Order</label>
                            <Input
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="show_on_homepage"
                                checked={formData.show_on_homepage}
                                onChange={e => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="show_on_homepage" className="text-sm font-bold text-slate-700 dark:text-slate-300">Show on Homepage</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary/20" disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
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
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedCategory?.name}</span>?
                        This will fail if there are services still linked to this category.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Category'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CategoryManager;
