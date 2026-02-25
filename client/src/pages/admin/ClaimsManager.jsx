import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    X,
    ExternalLink,
    Plus,
    Trash2,
    Edit
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import StatusBadge from '@/components/admin/StatusBadge';
import ActionMenu from '@/components/admin/ActionMenu';

const ClaimsManager = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [updateNotes, setUpdateNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newClaim, setNewClaim] = useState({
        client_name: '',
        email: '',
        phone: '',
        policy_no: '',
        type: 'Health Insurance',
        amount: '',
        status: 'Pending',
        description: ''
    });

    const claimTypes = ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Travel Insurance', 'Home Insurance', 'Other'];

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const res = await api.get('/claims');
            setClaims(res.data);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setUpdating(true);
        try {
            await api.put(`/claims/${id}`, {
                status,
                admin_notes: updateNotes
            });
            setIsViewModalOpen(false);
            setUpdateNotes('');
            fetchClaims();
        } catch (error) {
            console.error('Failed to update claim:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleAction = (claim, actionType) => {
        setSelectedClaim(claim);
        if (actionType === 'view') {
            setUpdateNotes(claim.admin_notes || '');
            setIsViewModalOpen(true);
        } else if (actionType === 'edit') {
            setIsEditModalOpen(true);
        } else if (actionType === 'delete') {
            setIsDeleteModalOpen(true);
        }
    };

    const handleEditClaim = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/claims/${selectedClaim.id}`, selectedClaim);
            setIsEditModalOpen(false);
            fetchClaims();
            alert('Claim updated successfully');
        } catch (error) {
            console.error('Failed to update claim:', error);
            alert('Failed to update claim');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClaim = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/claims/${selectedClaim.id}`);
            setIsDeleteModalOpen(false);
            fetchClaims();
            alert('Claim deleted successfully');
        } catch (error) {
            console.error('Failed to delete claim:', error);
            alert('Failed to delete claim');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddClaim = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/claims', newClaim);
            setClaims([data, ...claims]);
            setIsAddModalOpen(false);
            setNewClaim({
                client_name: '',
                email: '',
                phone: '',
                policy_no: '',
                type: 'Health Insurance',
                amount: '',
                status: 'Pending',
                description: ''
            });
        } catch (err) {
            console.error('Failed to add claim:', err);
            alert('Failed to add claim entry');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClaims = claims.filter(claim => {
        const matchesSearch = claim.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (claim.policy_no && claim.policy_no.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Claims Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and process insurance claim requests</p>
                </div>
                <Button
                    className="flex items-center gap-2 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    Add Manual Claim
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or policy no..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">In Progress</option>
                                <option value="Settled">Settled</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-slate-500">Fetching claims...</p>
                        </div>
                    ) : filteredClaims.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredClaims.map((claim) => (
                                <Card key={claim.id} className="hover:shadow-md transition-shadow duration-300">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{claim.client_name}</h3>
                                                    <p className="text-xs text-slate-500">{claim.type} • {claim.policy_no || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={claim.status} />
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                                            "{claim.description || 'No description provided.'}"
                                        </p>

                                        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                                                    onClick={() => handleAction(claim, 'view')}
                                                    title="View & Process"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <ActionMenu
                                                    actions={[
                                                        { type: 'edit', label: 'Edit' },
                                                        { type: 'delete', label: 'Delete', danger: true }
                                                    ]}
                                                    onAction={(action) => handleAction(claim, action)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No claims found</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View/Process Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Process Claim"
            >
                {selectedClaim && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                {selectedClaim.client_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{selectedClaim.client_name}</h4>
                                <StatusBadge status={selectedClaim.status} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</label>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedClaim.phone || 'N/A'}</p>
                                {selectedClaim.email && <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedClaim.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Policy Details</label>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedClaim.policy_no || 'N/A'}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedClaim.type}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Description</label>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5 italic text-slate-700 dark:text-slate-300">
                                {selectedClaim.description || 'No description provided.'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Notes</label>
                                <Textarea
                                    placeholder="Add notes for this claim..."
                                    className="mt-1 h-24 resize-none"
                                    value={updateNotes}
                                    onChange={(e) => setUpdateNotes(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Status</label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-1.5 ${selectedClaim.status === 'Processing' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Processing')}
                                        disabled={updating}
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        In Progress
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-1.5 ${selectedClaim.status === 'Settled' ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Settled')}
                                        disabled={updating}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Settle Claim
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-1.5 ${selectedClaim.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Rejected')}
                                        disabled={updating}
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-1.5 ${selectedClaim.status === 'Pending' ? 'bg-slate-50 border-slate-200 text-slate-700' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedClaim.id, 'Pending')}
                                        disabled={updating}
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        Back to Pending
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Claim Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Claim"
            >
                <form onSubmit={handleAddClaim} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                            <Input
                                required
                                value={newClaim.client_name}
                                onChange={(e) => setNewClaim({ ...newClaim, client_name: e.target.value })}
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                            <Input
                                value={newClaim.phone}
                                onChange={(e) => setNewClaim({ ...newClaim, phone: e.target.value })}
                                placeholder="10-digit mobile"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                        <Input
                            type="email"
                            value={newClaim.email}
                            onChange={(e) => setNewClaim({ ...newClaim, email: e.target.value })}
                            placeholder="customer@example.com (Optional)"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy Number</label>
                        <Input
                            required
                            value={newClaim.policy_no}
                            onChange={(e) => setNewClaim({ ...newClaim, policy_no: e.target.value })}
                            placeholder="e.g. POL-123456"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Claim Type</label>
                            <select
                                value={newClaim.type}
                                onChange={(e) => setNewClaim({ ...newClaim, type: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                {claimTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                            <Input
                                type="number"
                                required
                                value={newClaim.amount}
                                onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
                                placeholder="e.g. 5000"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            value={newClaim.description}
                            onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                            placeholder="Provide details about the claim..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Entry'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Claim Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Claim Details"
            >
                {selectedClaim && (
                    <form onSubmit={handleEditClaim} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                                <Input
                                    required
                                    value={selectedClaim.client_name}
                                    onChange={(e) => setSelectedClaim({ ...selectedClaim, client_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                                <Input
                                    value={selectedClaim.phone || ''}
                                    onChange={(e) => setSelectedClaim({ ...selectedClaim, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                            <Input
                                type="email"
                                value={selectedClaim.email || ''}
                                onChange={(e) => setSelectedClaim({ ...selectedClaim, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy Number</label>
                            <Input
                                required
                                value={selectedClaim.policy_no || ''}
                                onChange={(e) => setSelectedClaim({ ...selectedClaim, policy_no: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Claim Type</label>
                                <select
                                    value={selectedClaim.type}
                                    onChange={(e) => setSelectedClaim({ ...selectedClaim, type: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                                >
                                    {claimTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                                <Input
                                    type="number"
                                    required
                                    value={selectedClaim.amount || ''}
                                    onChange={(e) => setSelectedClaim({ ...selectedClaim, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                            <select
                                value={selectedClaim.status}
                                onChange={(e) => setSelectedClaim({ ...selectedClaim, status: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">In Progress</option>
                                <option value="Settled">Settled</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                            <textarea
                                value={selectedClaim.description || ''}
                                onChange={(e) => setSelectedClaim({ ...selectedClaim, description: e.target.value })}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-xl"
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

            {/* Delete Claim Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        Are you sure you want to delete the claim for <span className="font-bold text-slate-900 dark:text-white">{selectedClaim?.client_name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClaim} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete Claim'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClaimsManager;