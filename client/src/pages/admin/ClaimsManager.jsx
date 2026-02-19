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
    ExternalLink
} from 'lucide-react';
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
    const [updateNotes, setUpdateNotes] = useState('');
    const [updating, setUpdating] = useState(false);

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

    const openViewModal = (claim) => {
        setSelectedClaim(claim);
        setUpdateNotes(claim.admin_notes || '');
        setIsViewModalOpen(true);
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
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Claims Management</h1>
                    <p className="text-slate-500">Review and process insurance claim requests</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
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
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{claim.client_name}</h3>
                                                    <p className="text-xs text-slate-500">{claim.type} • {claim.policy_no || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={claim.status} />
                                        </div>

                                        <p className="text-sm text-slate-600 line-clamp-2 italic">
                                            "{claim.description || 'No description provided.'}"
                                        </p>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => openViewModal(claim)}
                                            >
                                                View & Process
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No claims found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your filters</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View/Process Modal */}
            {isViewModalOpen && selectedClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Process Claim</h2>
                                    <p className="text-sm text-slate-500">ID: {selectedClaim.id.split('-')[0]}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Details</label>
                                    <p className="font-semibold text-slate-900">{selectedClaim.client_name}</p>
                                    <p className="text-sm text-slate-600">Email: {selectedClaim.email || 'N/A'}</p>
                                    <p className="text-sm text-slate-600">Phone: {selectedClaim.phone || 'N/A'}</p>
                                    <p className="text-sm text-slate-600">Policy: {selectedClaim.policy_no || 'Not specified'}</p>
                                    <p className="text-sm text-slate-600">Type: {selectedClaim.type}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                        "{selectedClaim.description || 'No description provided.'}"
                                    </p>
                                </div>
                                {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Documents</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedClaim.documents.map((doc, i) => (
                                                <a
                                                    key={i}
                                                    href={doc}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    View Doc {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Notes</label>
                                        <Textarea
                                            placeholder="Add notes for this claim..."
                                            className="mt-1 h-32 resize-none"
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
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                            <span>Last updated: {new Date().toLocaleString()}</span>
                            <span>Submitted on: {new Date(selectedClaim.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimsManager;
