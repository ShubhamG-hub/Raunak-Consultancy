import { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    Eye,
    EyeOff,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';

const GalleryManager = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newImage, setNewImage] = useState({
        title: '',
        image_url: '',
        category: 'Other'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const categories = ['Events', 'Office', 'Clients', 'Awards', 'Other'];

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/gallery');
            setImages(res.data);
        } catch (error) {
            console.error('Failed to fetch gallery images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalImageUrl = newImage.image_url;

            // 1. If file is selected, upload it first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);

                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.url;
            }

            if (!finalImageUrl) {
                alert('Please provide an image URL or select a file');
                setSubmitting(false);
                return;
            }

            // 2. Save image details to database
            await api.post('/gallery', {
                ...newImage,
                image_url: finalImageUrl
            });

            setIsAddModalOpen(false);
            setNewImage({ title: '', image_url: '', category: 'Other' });
            setSelectedFile(null);
            fetchImages();
        } catch (error) {
            console.error('Failed to add image:', error);
            alert(error.response?.data?.error || 'Failed to add image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        try {
            await api.delete(`/gallery/${id}`);
            fetchImages();
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const toggleStatus = async (image) => {
        try {
            await api.put(`/gallery/${image.id}`, { active: !image.active });
            fetchImages();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredImages = images.filter(img => {
        const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || img.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gallery Manager</h1>
                    <p className="text-slate-500">Manage images displayed in the website gallery</p>
                </div>

                <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add New Image
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search images..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-slate-500">Fetching images...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredImages.length > 0 ? (
                                filteredImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={image.image_url}
                                                alt={image.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    onClick={() => toggleStatus(image)}
                                                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${image.active
                                                        ? 'bg-green-500/80 text-white'
                                                        : 'bg-slate-500/80 text-white hover:bg-green-500/80'
                                                        }`}
                                                    title={image.active ? "Click to hide" : "Click to show"}
                                                >
                                                    {image.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2">
                                                <StatusBadge status={image.active ? 'Approved' : 'Rejected'} />
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 line-clamp-1">{image.title}</h3>
                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{image.category}</span>
                                                </div>
                                                <ActionMenu
                                                    actions={[
                                                        { label: 'View Large', icon: ExternalLink, onClick: () => window.open(image.image_url, '_blank') },
                                                        { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => handleDeleteImage(image.id) }
                                                    ]}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                                                Added on {new Date(image.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No images found</h3>
                                    <p className="text-slate-500">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Custom Modal for Adding Image */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">Add Gallery Image</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddImage} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Image Title</label>
                                <Input
                                    required
                                    value={newImage.title}
                                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                                    placeholder="e.g. Annual Event 2024"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Upload Image</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <p className="text-[11px] text-slate-400 text-center italic">OR provide a URL below</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Image URL</label>
                                <Input
                                    value={newImage.image_url}
                                    onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    disabled={!!selectedFile}
                                />
                                {selectedFile && <p className="text-[10px] text-blue-500">Selected file: {selectedFile.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Category</label>
                                <select
                                    value={newImage.category}
                                    onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : 'Add Image'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryManager;
