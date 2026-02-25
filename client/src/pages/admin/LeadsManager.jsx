import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Eye, Edit, Trash2, Phone, Mail, Calendar, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/ui/Modal';
import ActionMenu from '@/components/admin/ActionMenu';

const LeadsManager = () => {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [selectedLead, setSelectedLead] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newLead, setNewLead] = useState({
        name: '',
        mobile: '',
        email: '',
        type: 'Insurance',
        requirement: '',
        status: 'New'
    });

    const leadTypes = ['Insurance', 'Taxation', 'Investment', 'Loan', 'Other'];

    const fetchLeads = async () => {
        try {
            const { data } = await api.get('/leads');
            setLeads(data);
            setFilteredLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterLeads = useCallback(() => {
        let filtered = leads;

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lead.mobile || '').includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        setFilteredLeads(filtered);
    }, [leads, searchTerm, statusFilter]);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        filterLeads();
    }, [filterLeads]);

    const handleAction = (lead, actionType) => {
        setSelectedLead(lead);
        if (actionType === 'view') setIsViewModalOpen(true);
        if (actionType === 'edit') setIsEditModalOpen(true);
        if (actionType === 'delete') setIsDeleteModalOpen(true);
    };


    const handleEditLead = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.put(`/leads/${selectedLead.id}`, selectedLead);
            setLeads(prev => prev.map(l => l.id === data.data.id ? data.data : l));
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update lead');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteLead = async () => {
        setActionLoading(true);
        try {
            await api.delete(`/leads/${selectedLead.id}`);
            setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Failed to delete lead:', err);
            alert('Failed to delete lead');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddLead = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/leads', newLead);
            setLeads([data, ...leads]);
            setIsAddModalOpen(false);
            setNewLead({
                name: '',
                mobile: '',
                email: '',
                type: 'Insurance',
                requirement: '',
                status: 'New'
            });
        } catch (err) {
            console.error(err);
            alert('Failed to add lead');
        } finally {
            setSubmitting(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Name', 'Mobile', 'Type', 'Status', 'Requirement'];
        const rows = filteredLeads.map(lead => [
            new Date(lead.created_at).toLocaleDateString(),
            lead.name,
            lead.mobile,
            lead.type,
            lead.status,
            lead.requirement || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Leads Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track all customer inquiries</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={exportToCSV}
                        className="gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 rounded-xl px-6 h-12"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 sticky top-16 md:top-24 z-10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by name or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 flex-nowrap scrollbar-hide">
                        {['all', 'New', 'Contacted', 'Closed'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap ${statusFilter === filter
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                {filter === 'all' && ` (${leads.length})`}
                                {filter !== 'all' && ` (${leads.filter(l => l.status === filter).length})`}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Table Card */}
            <motion.div variants={itemVariants} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/10">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Leads</h2>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Loading leads...</p>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                            <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p>No leads found matching your criteria</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <table className="w-full hidden md:table">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-white/10">
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    <AnimatePresence>
                                        {filteredLeads.map((lead, index) => (
                                            <motion.tr
                                                key={lead.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                            >
                                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                    <div className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 text-primary flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-800">
                                                            {(lead.name || "?").charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{lead.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                                                            <Phone className="w-3 h-3" /> {lead.mobile}
                                                        </div>
                                                        {lead.email && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Mail className="w-3 h-3" /> {lead.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <StatusBadge status={lead.status} pulse={lead.status === 'New'} />
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end">
                                                        <ActionMenu
                                                            actions={[
                                                                { type: 'view', label: 'View Details', icon: Eye },
                                                                { type: 'edit', label: 'Edit Lead', icon: Edit },
                                                                { type: 'delete', label: 'Delete', icon: Trash2, danger: true }
                                                            ]}
                                                            onAction={(actionType) => handleAction(lead, actionType)}
                                                        />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                <AnimatePresence>
                                    {filteredLeads.map((lead, index) => (
                                        <motion.div
                                            key={lead.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="p-4 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 text-primary flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
                                                        {(lead.name || "?").charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate">{lead.name}</div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <Phone className="w-3 h-3 flex-shrink-0" /> {lead.mobile}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={lead.status} pulse={lead.status === 'New'} />
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-xs text-slate-400">
                                                    {new Date(lead.created_at).toLocaleDateString()} • <span className="capitalize">{lead.type}</span>
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <ActionMenu
                                                        actions={[
                                                            { type: 'view', label: 'View Details', icon: Eye },
                                                            { type: 'edit', label: 'Edit Lead', icon: Edit },
                                                            { type: 'delete', label: 'Delete', icon: Trash2, danger: true }
                                                        ]}
                                                        onAction={(actionType) => handleAction(lead, actionType)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 bg-primary/10 text-primary hover:bg-primary/20"
                                                        onClick={() => handleAction(lead, 'view')}
                                                    >
                                                        Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Lead Details"
            >
                {selectedLead && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                {selectedLead.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{selectedLead.name}</h4>
                                <StatusBadge status={selectedLead.status} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> Contact Info
                                </p>
                                <p className="text-slate-900 dark:text-white font-medium">{selectedLead.mobile}</p>
                                {selectedLead.email && <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedLead.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Submitted On
                                </p>
                                <p className="text-slate-900 dark:text-white font-medium">{new Date(selectedLead.created_at).toLocaleDateString()}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{new Date(selectedLead.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Requirement Details
                            </p>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5 italic text-slate-700 dark:text-slate-300">
                                {selectedLead.requirement || 'No specific requirement provided.'}
                            </div>
                        </div>

                        {selectedLead.notes && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase">Admin Notes</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLead.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Lead Details"
            >
                {selectedLead && (
                    <form onSubmit={handleEditLead} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                            <Input
                                required
                                value={selectedLead.name}
                                onChange={(e) => setSelectedLead({ ...selectedLead, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                                <Input
                                    required
                                    value={selectedLead.mobile}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, mobile: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email (Optional)</label>
                                <Input
                                    value={selectedLead.email || ''}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Type</label>
                                <select
                                    value={selectedLead.type}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, type: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                                >
                                    {leadTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                                <select
                                    value={selectedLead.status}
                                    onChange={(e) => setSelectedLead({ ...selectedLead, status: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requirement Details</label>
                            <textarea
                                value={selectedLead.requirement || ''}
                                onChange={(e) => setSelectedLead({ ...selectedLead, requirement: e.target.value })}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin Notes</label>
                            <textarea
                                value={selectedLead.notes || ''}
                                onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                                placeholder="Add any private notes here..."
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
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                                        Saving...
                                    </>
                                ) : 'Update Lead'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">Are you sure?</h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            This action cannot be undone. You are about to delete the lead for <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedLead?.name}</span>.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={deleteLead}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Deleting...' : 'Delete Lead'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Lead Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Lead Entry"
            >
                <form onSubmit={handleAddLead} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                        <Input
                            required
                            value={newLead.name}
                            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                            placeholder="e.g. John Smith"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                            <Input
                                required
                                value={newLead.mobile}
                                onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })}
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email (Optional)</label>
                            <Input
                                value={newLead.email}
                                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                placeholder="e.g. john@example.com"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Type</label>
                            <select
                                value={newLead.type}
                                onChange={(e) => setNewLead({ ...newLead, type: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                {leadTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Status</label>
                            <select
                                value={newLead.status}
                                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requirement Details</label>
                        <textarea
                            value={newLead.requirement}
                            onChange={(e) => setNewLead({ ...newLead, requirement: e.target.value })}
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-slate-900 outline-none h-24 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"
                            placeholder="Details about what the lead is looking for..."
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
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                                    Saving...
                                </>
                            ) : 'Save Lead Entry'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default LeadsManager;