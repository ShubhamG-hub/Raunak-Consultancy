import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, X, Star } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';

const TestimonialsManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        filterTestimonials();
    }, [searchTerm, statusFilter, testimonials]);

    const fetchTestimonials = async () => {
        try {
            const { data } = await api.get('/testimonials/admin');
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

    const handleAction = (testimonialId, actionType) => {
        if (actionType === 'approve') {
            updateStatus(testimonialId, 'Approved');
        } else if (actionType === 'reject') {
            updateStatus(testimonialId, 'Rejected');
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
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Testimonials Management</h1>
                <p className="text-slate-600 mt-1">Review and manage customer testimonials</p>
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
                                                { type: 'approve', label: 'Approve' },
                                                { type: 'reject', label: 'Reject', danger: true }
                                            ]}
                                            onAction={(action) => handleAction(testimonial.id, action)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">
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
        </div>
    );
};

export default TestimonialsManager;
