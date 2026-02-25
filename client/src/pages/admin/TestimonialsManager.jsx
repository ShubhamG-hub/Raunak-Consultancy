import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, X, Star, Plus } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const TestimonialsManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [formData, setFormData] = useState({ name: '', rating: 5, content: '', email: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        filterTestimonials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, statusFilter, testimonials]);

    const fetchTestimonials = async () => {
        try {
            const { data } = await api.get('/testimonials');
            setTestimonials(data);
            setFilteredTestimonials(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterTestimonials = () => {
        let filtered = testimonials;

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        setFilteredTestimonials(filtered);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/testimonials/${id}`, { status });
            setTestimonials(testimonials.map(t =>
                t.id === id ? { ...t, status } : t
            ));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleAction = (testimonial, actionType) => {
        setSelectedTestimonial(testimonial);
        if (actionType === 'approve') {
            updateStatus(testimonial.id, 'Approved');
        } else if (actionType === 'reject') {
            updateStatus(testimonial.id, 'Rejected');
        } else if (actionType === 'edit') {
            setIsEditModalOpen(true);
        } else if (actionType === 'delete') {
            setIsDeleteModalOpen(true);
        }
    };

    const handleEditTestimonial = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.put(`/testimonials/${selectedTestimonial.id}`, selectedTestimonial);
            setTestimonials(testimonials.map(t => t.id === selectedTestimonial.id ? data.data : t));
            setIsEditModalOpen(false);
            alert('Testimonial updated successfully');
        } catch (err) {
            console.error('Failed to update testimonial:', err);
            alert(err.response?.data?.error || 'Failed to update testimonial');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTestimonial = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/testimonials/${selectedTestimonial.id}`);
            setTestimonials(testimonials.filter(t => t.id !== selectedTestimonial.id));
            setIsDeleteModalOpen(false);
            alert('Testimonial deleted successfully');
        } catch (err) {
            console.error('Failed to delete testimonial:', err);
            alert('Failed to delete testimonial');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddTestimonial = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/testimonials/admin', formData);
            setTestimonials([data.data, ...testimonials]);
            setIsAddModalOpen(false);
            setFormData({ name: '', rating: 5, content: '', email: '' });
            alert('Testimonial added successfully');
        } catch (err) {
            console.error('Failed to add testimonial:', err);
            alert(err.response?.data?.error || 'Failed to add testimonial');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Testimonials Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Review and manage customer testimonials</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Testimonial
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Search testimonials..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('all')}
                            >
                                All ({testimonials.length})
                            </Button>
                            <Button
                                variant={statusFilter === 'Pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('Pending')}
                            >
                                Pending ({testimonials.filter(t => t.status === 'Pending').length})
                            </Button>
                            <Button
                                variant={statusFilter === 'Approved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('Approved')}
                            >
                                Approved ({testimonials.filter(t => t.status === 'Approved').length})
                            </Button>
                            <Button
                                variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter('Rejected')}
                            >
                                Rejected ({testimonials.filter(t => t.status === 'Rejected').length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Testimonials Grid */}
            {loading ? (
                <p className="text-center py-8 text-slate-500">Loading testimonials...</p>
            ) : filteredTestimonials.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No testimonials found</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTestimonials.map((testimonial) => (
                        <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                                        <div className="mt-2">
                                            {renderStars(testimonial.rating)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={testimonial.status} pulse={testimonial.status === 'Pending'} />
                                        <ActionMenu
                                            actions={[
                                                { type: 'edit', label: 'Edit' },
                                                { type: 'approve', label: 'Approve' },
                                                { type: 'reject', label: 'Reject', danger: true },
                                                { type: 'delete', label: 'Delete', danger: true }
                                            ]}
                                            onAction={(action) => handleAction(testimonial, action)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Submitted: {new Date(testimonial.created_at).toLocaleDateString()}</span>
                                    {testimonial.status === 'Pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                onClick={() => updateStatus(testimonial.id, 'Approved')}
                                            >
                                                <Check className="w-3 h-3" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => updateStatus(testimonial.id, 'Rejected')}
                                            >
                                                <X className="w-3 h-3" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Testimonial Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Testimonial"
            >
                <form onSubmit={handleAddTestimonial} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="add-name">Customer Name</Label>
                        <Input
                            id="add-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-email">Email (Optional)</Label>
                        <Input
                            id="add-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g. rahul@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-rating">Rating (1-5)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="add-rating"
                                type="number"
                                min="1"
                                max="5"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                className="w-24"
                                required
                            />
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 cursor-pointer transition-colors ${i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-content">Testimonial Content</Label>
                        <Textarea
                            id="add-content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write the testimonial here..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Testimonial'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Testimonial Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Testimonial"
            >
                {selectedTestimonial && (
                    <form onSubmit={handleEditTestimonial} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Customer Name</Label>
                            <Input
                                id="edit-name"
                                value={selectedTestimonial.name}
                                onChange={(e) => setSelectedTestimonial({ ...selectedTestimonial, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email (Optional)</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={selectedTestimonial.email || ''}
                                onChange={(e) => setSelectedTestimonial({ ...selectedTestimonial, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-rating">Rating (1-5)</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="edit-rating"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={selectedTestimonial.rating}
                                    onChange={(e) => setSelectedTestimonial({ ...selectedTestimonial, rating: parseInt(e.target.value) })}
                                    className="w-24"
                                    required
                                />
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 cursor-pointer transition-colors ${i < selectedTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                            onClick={() => setSelectedTestimonial({ ...selectedTestimonial, rating: i + 1 })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <select
                                id="edit-status"
                                value={selectedTestimonial.status}
                                onChange={(e) => setSelectedTestimonial({ ...selectedTestimonial, status: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-content">Testimonial Content</Label>
                            <Textarea
                                id="edit-content"
                                value={selectedTestimonial.content}
                                onChange={(e) => setSelectedTestimonial({ ...selectedTestimonial, content: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Testimonial Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Are you sure you want to delete the testimonial from <span className="font-bold text-slate-900 dark:text-white">{selectedTestimonial?.name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTestimonial} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Testimonial'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TestimonialsManager;
