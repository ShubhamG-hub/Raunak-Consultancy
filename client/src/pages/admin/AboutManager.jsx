import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/Modal';
import {
    Plus, Edit, Trash2, TrendingUp, Users, Award, ShieldCheck, Target,
    Heart, Star, CheckCircle2, Calendar, BarChart2, Info, Power
} from 'lucide-react';
import ActionMenu from '@/components/admin/ActionMenu';

const TABS = [
    { key: 'general', label: 'General Info', icon: Info },
    { key: 'milestone', label: 'Milestones', icon: Calendar },
    { key: 'stat', label: 'Stats', icon: BarChart2 },
    { key: 'commitment', label: 'Commitments', icon: CheckCircle2 },
];

const ICON_OPTIONS = [
    'Users', 'TrendingUp', 'Award', 'ShieldCheck', 'Target', 'Heart', 'Star', 'CheckCircle2'
];

const ICON_MAP = {
    Users, TrendingUp, Award, ShieldCheck, Target, Heart, Star, CheckCircle2
};

const emptyForm = {
    section_type: 'milestone',
    title: '',
    description: '',
    icon: '',
    year: '',
    value: '',
    order_index: 0,
    active: true,
};

const AboutManager = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const { data } = await api.get('/about');
            setSections(data);
        } catch (err) {
            console.error('Failed to fetch about sections:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = sections.filter(s => s.section_type === activeTab);

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, section_type: activeTab });
        setIsModalOpen(true);
    };

    const openEditModal = (section) => {
        setEditingId(section.id);
        setFormData({
            section_type: section.section_type,
            title: section.title || '',
            description: section.description || '',
            icon: section.icon || '',
            year: section.year || '',
            value: section.value || '',
            order_index: section.order_index || 0,
            active: section.active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                const { data } = await api.put(`/about/${editingId}`, formData);
                setSections(sections.map(s => s.id === editingId ? data.data : s));
            } else {
                const { data } = await api.post('/about', formData);
                setSections([...sections, data.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save section:', err);
            alert(err.response?.data?.error || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;
        try {
            await api.delete(`/about/${id}`);
            setSections(sections.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete section:', err);
        }
    };

    const handleAction = (section, actionType) => {
        if (actionType === 'edit') {
            openEditModal(section);
        } else if (actionType === 'delete') {
            handleDelete(section.id);
        } else if (actionType === 'toggle') {
            toggleActive(section);
        }
    };

    const toggleActive = async (section) => {
        try {
            const updated = { ...section, active: !section.active };
            const { data } = await api.put(`/about/${section.id}`, updated);
            setSections(sections.map(s => s.id === section.id ? data.data : s));
        } catch (err) {
            console.error('Failed to toggle active:', err);
        }
    };

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">About Us Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage hero text, bio, milestones, stats, and commitments</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add {TABS.find(t => t.key === activeTab)?.label?.slice(0, -1)}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <Button
                            key={tab.key}
                            variant={activeTab === tab.key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab(tab.key)}
                            className="gap-2"
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label} ({sections.filter(s => s.section_type === tab.key).length})
                        </Button>
                    );
                })}
            </div>

            {/* Content */}
            <Card>
                <CardContent className="p-4 md:p-6">
                    {loading ? (
                        <p className="text-center py-8 text-slate-500">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <Info className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No {TABS.find(t => t.key === activeTab)?.label?.toLowerCase()} yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Click the button above to add one.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.sort((a, b) => a.order_index - b.order_index).map(section => (
                                <div
                                    key={section.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-xl border transition-all gap-3 ${section.active
                                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10 shadow-sm hover:shadow-md'
                                        : 'bg-slate-50 dark:bg-slate-950 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Icon/Year Badge */}
                                        {activeTab === 'milestone' && section.year ? (
                                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-black text-sm">{section.year}</span>
                                            </div>
                                        ) : section.icon && ICON_MAP[section.icon] ? (
                                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                {(() => { const Icon = ICON_MAP[section.icon]; return <Icon className="w-6 h-6 text-primary" />; })()}
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Info className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{section.title}</h3>
                                            {section.value && activeTab !== 'general' && (
                                                <span className="text-primary font-bold text-sm">{section.value}</span>
                                            )}
                                            {section.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mt-1 whitespace-pre-wrap">{section.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <ActionMenu
                                            actions={[
                                                { type: 'edit', label: 'Edit', icon: Edit },
                                                { type: 'toggle', label: section.active ? 'Set Inactive' : 'Set Active', icon: Power },
                                                { type: 'delete', label: 'Delete', icon: Trash2, danger: true }
                                            ]}
                                            onAction={(actionType) => handleAction(section, actionType)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Section' : 'Add Section'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Raunak Consultancy Founded"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description..."
                            rows={3}
                        />
                    </div>

                    {activeTab === 'milestone' && (
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                placeholder="e.g. 2015"
                            />
                        </div>
                    )}

                    {activeTab === 'stat' && (
                        <>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="e.g. 30,000+ or 98%"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <div className="flex flex-wrap gap-2">
                                    {ICON_OPTIONS.map(iconName => {
                                        const Icon = ICON_MAP[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                                className={`p-3 rounded-xl border-2 transition-all ${formData.icon === iconName
                                                    ? 'border-primary bg-primary/10 scale-110'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${formData.icon === iconName ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-24"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AboutManager;
