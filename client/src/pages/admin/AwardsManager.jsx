import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import ActionMenu from '@/components/admin/ActionMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Award, Plus, Loader2, Trash2, Trophy, Edit } from 'lucide-react';

const AwardsManager = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAward, setSelectedAward] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear().toString(),
        image_url: ''
    });

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/awards');
            setAwards(data);
        } catch (err) {
            console.error('Failed to fetch awards:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (award, action) => {
        setSelectedAward(award);
        if (action === 'edit') {
            setFormData({
                title: award.title,
                description: award.description,
                year: award.year.toString(),
                image_url: award.image_url
            });
            setIsFormModalOpen(true);
        } else if (action === 'delete') {
            setIsDeleteModalOpen(true);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/awards/${selectedAward.id}`);
            setAwards(awards.filter(a => a.id !== selectedAward.id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalImageUrl = formData.image_url;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('image', selectedFile);
                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.url;
            }

            const payload = { ...formData, image_url: finalImageUrl };

            if (selectedAward) {
                await api.put(`/awards/${selectedAward.id}`, payload);
            } else {
                await api.post('/awards', payload);
            }
            fetchAwards();
            setIsFormModalOpen(false);
            setSelectedAward(null);
            setSelectedFile(null);
            setFormData({ title: '', description: '', year: new Date().getFullYear().toString(), image_url: '' });
        } catch (err) {
            console.error('Save failed:', err);
            alert(err.response?.data?.error || 'Failed to save award');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Awards & Honors</h1>
                    <p className="text-slate-600 mt-1">Showcase your professional recognitions</p>
                </div>
                <Button onClick={() => {
                    setSelectedAward(null);
                    setFormData({ title: '', description: '', year: new Date().getFullYear().toString(), image_url: '' });
                    setIsFormModalOpen(true);
                }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Award
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-slate-500">Fetching awards...</p>
                    </div>
                ) : awards.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No awards found</h3>
                        <p className="text-slate-500">Click the button above to add your first award</p>
                    </div>
                ) : (
                    awards.map(award => (
                        <Card key={award.id} className="rounded-2xl group overflow-hidden border-slate-200 dark:border-white/10 hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl overflow-hidden flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        {award.image_url ? (
                                            <img src={award.image_url} alt={award.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Trophy className="w-6 h-6" />
                                        )}
                                    </div>
                                    <ActionMenu
                                        actions={[
                                            { type: 'edit', label: 'Edit', icon: Edit },
                                            { type: 'delete', label: 'Delete', danger: true }
                                        ]}
                                        onAction={(action) => handleAction(award, action)}
                                    />
                                </div>
                                <h3 className="text-lg font-bold mb-1 line-clamp-1">{award.title}</h3>
                                <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-3">{award.year}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">{award.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedAward ? 'Edit Award' : 'Add New Award'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Award Title</label>
                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year</label>
                            <Input value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Award Image</label>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-white"
                                />
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100 dark:border-white/5" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                                        <span className="bg-white dark:bg-slate-900 px-2 tracking-widest">Or provide URL</span>
                                    </div>
                                </div>
                                <Input
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    disabled={!!selectedFile}
                                />
                                {selectedFile && <p className="text-[10px] text-blue-500">Selected file: {selectedFile.name}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormModalOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button type="submit" className="flex-1 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : 'Save Award'}
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
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedAward?.title}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Award'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AwardsManager;