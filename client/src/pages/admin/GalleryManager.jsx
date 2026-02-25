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
import Modal from '@/components/ui/Modal';
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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

        // Validation: Must have either file or URL, but not both (though UI prevents both)
        if (!selectedFile && !newImage.image_url) {
            alert('Please provide an image: either upload a file or enter a URL.');
            return;
        }

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

    const handleAction = (image, actionType) => {
        setSelectedImage(image);
        if (actionType === 'edit') {
            setIsEditModalOpen(true);
        } else if (actionType === 'delete') {
            setIsDeleteModalOpen(true);
        } else if (actionType === 'view_large') {
            window.open(image.image_url, '_blank');
        }
    };

    const handleEditImage = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/gallery/${selectedImage.id}`, selectedImage);
            setIsEditModalOpen(false);
            fetchImages();
            alert('Image details updated');
        } catch (error) {
            console.error('Failed to update image:', error);
            alert('Failed to update image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/gallery/${selectedImage.id}`);
            setIsDeleteModalOpen(false);
            fetchImages();
            alert('Image deleted successfully');
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image');
        } finally {
            setSubmitting(false);
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
        const matchesSearch = (img.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || img.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Gallery Manager</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage images displayed in the website gallery</p>
                </div>

                <Button
                    className="flex items-center gap-2 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12"
                    onClick={() => setIsAddModalOpen(true)}
                >
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
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-slate-500 dark:text-slate-400">Fetching images...</p>
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
                                                <button
                                                    onClick={() => handleAction(image, 'delete')}
                                                    className="p-2 rounded-lg bg-red-500/80 text-white backdrop-blur-md hover:bg-red-600/90 transition-colors"
                                                    title="Delete image"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2">
                                                <StatusBadge status={image.active ? 'Approved' : 'Rejected'} />
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{image.title}</h3>
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{image.category}</span>
                                                </div>
                                                <ActionMenu
                                                    actions={[
                                                        { type: 'view_large', label: 'View Large', icon: ExternalLink },
                                                        { type: 'edit', label: 'Edit', icon: ImageIcon },
                                                        { type: 'delete', label: 'Delete', danger: true }
                                                    ]}
                                                    onAction={(action) => handleAction(image, action)}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
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
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No images found</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Image Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Gallery Image"
            >
                <form onSubmit={handleAddImage} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image Title</label>
                        <Input
                            required
                            value={newImage.title}
                            onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                            placeholder="e.g. Annual Event 2024"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</label>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    id="gallery-file-input"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={!!newImage.image_url}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-white"
                                />
                                {selectedFile && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            const input = document.getElementById('gallery-file-input');
                                            if (input) input.value = '';
                                        }}
                                        className="h-10 px-3 text-red-500 hover:text-red-600 border-red-100 hover:border-red-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center italic">OR provide a URL below</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                        <Input
                            value={newImage.image_url}
                            onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            disabled={!!selectedFile}
                        />
                        {selectedFile && <p className="text-[10px] text-primary">Selected file: <span className="font-bold">{selectedFile.name}</span></p>}
                        {newImage.image_url && <p className="text-[10px] text-green-500 font-medium">Using image URL</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                        <select
                            value={newImage.category}
                            onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
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
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl"
                            disabled={submitting}
                        >
                            {submitting ? 'Adding...' : 'Add Image'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Image Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Gallery Image"
            >
                {selectedImage && (
                    <form onSubmit={handleEditImage} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image Title</label>
                            <Input
                                required
                                value={selectedImage.title}
                                onChange={(e) => setSelectedImage({ ...selectedImage, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                            <Input
                                required
                                value={selectedImage.image_url}
                                onChange={(e) => setSelectedImage({ ...selectedImage, image_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                            <select
                                value={selectedImage.category}
                                onChange={(e) => setSelectedImage({ ...selectedImage, category: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visibility</label>
                            <select
                                value={selectedImage.active ? 'true' : 'false'}
                                onChange={(e) => setSelectedImage({ ...selectedImage, active: e.target.value === 'true' })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                <option value="true">Visible</option>
                                <option value="false">Hidden</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Image Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedImage?.title}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteImage} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Image'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GalleryManager;