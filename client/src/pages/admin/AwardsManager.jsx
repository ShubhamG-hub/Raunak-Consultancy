import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Edit,
    Trash2,
    Trophy,
    Search,
    Upload,
    Loader2
} from 'lucide-react';

const AwardsManager = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
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
        try {
            const { data } = await api.get('/awards');
            setAwards(data);
        } catch (err) {
            console.error('Failed to fetch awards:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (award) => {
        setSelectedAward(award);
        setFormData({
            title: award.title,
            description: award.description,
            year: award.year,
            image_url: award.image_url
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/awards/${id}`);
            setAwards(awards.filter(a => a.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
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
            setShowForm(false);
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
                <Button onClick={() => { setShowForm(true); setSelectedAward(null); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Award
                </Button>
            </div>

            {showForm ? (
                <Card className="rounded-[2rem]">
                    <CardHeader>
                        <CardTitle>{selectedAward ? 'Edit Award' : 'Add New Award'}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Award Title</label>
                                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Year</label>
                                    <Input value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold">Description</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold">Award Icon/Image</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-slate-200 dark:border-white/10" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or Image URL</span>
                                            </div>
                                        </div>
                                        <Input
                                            placeholder="https://..."
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            disabled={!!selectedFile}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Award'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p className="col-span-full text-center py-12">Loading...</p>
                    ) : awards.length === 0 ? (
                        <p className="col-span-full text-center py-12">No awards added yet.</p>
                    ) : (
                        awards.map(award => (
                            <Card key={award.id} className="rounded-2xl group overflow-hidden border-slate-200 dark:border-white/10">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-center text-blue-600">
                                            {award.image_url ? (
                                                <img src={award.image_url} alt={award.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Trophy className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(award)}><Edit className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(award.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{award.title}</h3>
                                    <p className="text-blue-600 font-bold text-sm mb-3">{award.year}</p>
                                    <p className="text-slate-500 text-sm line-clamp-3">{award.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AwardsManager;
