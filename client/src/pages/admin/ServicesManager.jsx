import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import ActionMenu from '@/components/admin/ActionMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Loader2, Edit, Layout, Briefcase,
    Settings, CheckCircle2, List, ClipboardList,
    Search, FolderPlus
} from 'lucide-react';
import CategoryManager from './CategoryManager';

const ServicesManager = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('services'); // 'services' or 'categories'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
    const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category_id: '',
        short_description: '',
        full_description: '',
        benefits: '', // To be handled as text area (one per line)
        features: '', // To be handled as text area (one per line)
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                api.get('/services'),
                api.get('/categories')
            ]);
            setServices(servicesRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (service, action) => {
        setSelectedService(service);
        if (action === 'edit') {
            setFormData({
                title: service.title || '',
                slug: service.slug || '',
                category_id: service.category_id || '',
                short_description: service.short_description || '',
                full_description: service.full_description || '',
                benefits: Array.isArray(service.benefits) ? service.benefits.join('\n') : '',
                features: Array.isArray(service.features) ? service.features.join('\n') : '',
                is_active: service.is_active === 1 || service.is_active === true,
                display_order: service.display_order || 0
            });
            setIsFormModalOpen(true);
        } else if (action === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (action === 'toggle') {
            handleToggleActive(service);
        }
    };

    const handleToggleActive = async (service) => {
        try {
            const newStatus = !(service.is_active === 1 || service.is_active === true);
            await api.put(`/services/${service.id}`, {
                ...service,
                is_active: newStatus ? 1 : 0
            });
            fetchData();
        } catch (err) {
            console.error('Toggle status failed:', err);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/services/${selectedService.id}`);
            setServices(services.filter(s => s.id !== selectedService.id));
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
            const payload = {
                ...formData,
                benefits: formData.benefits.split('\n').filter(b => b.trim() !== ''),
                features: formData.features.split('\n').filter(f => f.trim() !== ''),
                is_active: formData.is_active ? 1 : 0
            };

            if (selectedService) {
                await api.put(`/services/${selectedService.id}`, payload);
            } else {
                await api.post('/services', payload);
            }
            fetchData();
            setIsFormModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Save failed:', err);
            alert(err.response?.data?.error || 'Failed to save service');
        } finally {
            setSubmitting(false);
        }
    };

    const generateSlug = () => {
        const slug = formData.title.toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const resetForm = () => {
        setSelectedService(null);
        setFormData({
            title: '',
            slug: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            short_description: '',
            full_description: '',
            benefits: '',
            features: '',
            is_active: true,
            display_order: 0
        });
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (service.category_name && service.category_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategoryFilter === 'all' ||
            String(service.category_id) === String(selectedCategoryFilter);

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-3 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-heading">Services & Categories</h1>
                    <p className="text-slate-600 mt-1">Manage your professional offerings and groups</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'services'
                                ? 'bg-white dark:bg-slate-700 text-primary-theme shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Services
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories'
                                ? 'bg-white dark:bg-slate-700 text-primary-theme shadow-md'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        Categories
                    </button>
                </div>
            </div>

            {activeTab === 'services' && (
                <>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200"
                            />
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <select
                                className="h-12 px-4 rounded-2xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none text-sm font-bold md:min-w-[200px]"
                                value={selectedCategoryFilter}
                                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <Button onClick={() => {
                                resetForm();
                                setIsFormModalOpen(true);
                            }} className="flex-grow md:flex-none gap-2 h-12 px-8 rounded-2xl shadow-lg shadow-primary-theme/20">
                                <Plus className="w-4 h-4" /> Add Service
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-10 h-10 animate-spin text-primary-theme" />
                                <p className="text-slate-500">Fetching services...</p>
                            </div>
                        ) : filteredServices.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                                <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No services found</h3>
                                <p className="text-slate-500">
                                    {searchQuery ? "Try searching for something else" : "Click the button above to add your first service"}
                                </p>
                            </div>
                        ) : (
                            filteredServices.map(service => (
                                <Card key={service.id} className={`rounded-[2rem] group overflow-hidden border-slate-200 dark:border-white/10 hover:shadow-2xl transition-all duration-500 ${(!service.is_active || service.is_active === 0) ? 'opacity-60' : ''}`}>
                                    <CardContent className="p-7">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="w-12 h-12 bg-primary-theme/10 text-primary-theme rounded-[1rem] flex items-center justify-center transition-transform group-hover:scale-110">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <ActionMenu
                                                actions={[
                                                    { type: 'edit', label: 'Edit', icon: Edit },
                                                    { type: 'toggle', label: (service.is_active === 1) ? 'Deactivate' : 'Activate', icon: Settings },
                                                    { type: 'delete', label: 'Delete', danger: true }
                                                ]}
                                                onAction={(action) => handleAction(service, action)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-1 font-heading group-hover:text-primary-theme transition-colors">{service.title}</h3>
                                                {(!service.is_active || service.is_active === 0) && (
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest">Inactive</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-black text-primary-theme uppercase tracking-widest">
                                                {service.category_name || 'Uncategorized'}
                                            </p>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 line-clamp-2 leading-relaxed">{service.short_description}</p>
                                        <div className="mt-6 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50 dark:border-slate-800">
                                            <span className="flex items-center gap-1.5">
                                                <ClipboardList className="w-3.5 h-3.5 text-slate-300" />
                                                Order: {service.display_order}
                                            </span>
                                            {service.slug && <span className="text-slate-300 hover:text-primary-theme cursor-help transition-colors">/{service.slug}</span>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}

            {activeTab === 'categories' && (
                <CategoryManager
                    isEmbedded={true}
                    onCategoryChange={fetchData}
                />
            )}

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedService ? 'Edit Service' : 'Add New Service'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Title</label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                onBlur={!selectedService ? generateSlug : undefined}
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
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                            <div className="flex gap-2">
                                <select
                                    className="flex-grow h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none text-sm focus:border-primary-theme focus:ring-2 focus:ring-primary-theme/10 transition-all font-bold"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsQuickCategoryModalOpen(true);
                                    }}
                                    className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:text-primary-theme group"
                                    title="Add New Category"
                                >
                                    <FolderPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display Order</label>
                            <Input
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2 flex items-end">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="form_is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="form_is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Set as Active</label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Short Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-20 text-sm"
                            value={formData.short_description}
                            onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-32 text-sm"
                            value={formData.full_description}
                            onChange={e => setFormData({ ...formData, full_description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Benefits (One per line)</label>
                            <textarea
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-32 text-sm"
                                value={formData.benefits}
                                onChange={e => setFormData({ ...formData, benefits: e.target.value })}
                                placeholder="Benefit 1&#10;Benefit 2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Features (One per line)</label>
                            <textarea
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-32 text-sm"
                                value={formData.features}
                                onChange={e => setFormData({ ...formData, features: e.target.value })}
                                placeholder="Feature 1&#10;Feature 2"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-primary/20" disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Service'}
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
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedService?.title}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Service'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Quick Category Modal */}
            <Modal
                isOpen={isQuickCategoryModalOpen}
                onClose={() => setIsQuickCategoryModalOpen(false)}
                title="Quick Add Category"
            >
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const name = e.target.elements.cat_name.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        try {
                            const { data } = await api.post('/categories', {
                                name,
                                slug,
                                display_order: categories.length,
                                is_active: 1,
                                show_on_homepage: 0
                            });
                            // Refresh categories and select the new one
                            const categoriesRes = await api.get('/categories');
                            setCategories(categoriesRes.data);
                            setFormData(prev => ({ ...prev, category_id: data.id }));
                            setIsQuickCategoryModalOpen(false);
                        } catch (err) {
                            console.error('Quick category failed:', err);
                            alert('Failed to add category');
                        }
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category Name</label>
                        <Input name="cat_name" required placeholder="e.g. Health Insurance" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsQuickCategoryModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-xl bg-primary-theme text-white">Create Category</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ServicesManager;

