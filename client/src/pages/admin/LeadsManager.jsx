import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail, Calendar, Clock, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/ui/Modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        filterLeads();
    }, [searchTerm, statusFilter, leads]);

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

    const filterLeads = () => {
        let filtered = leads;

        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.mobile.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(lead => lead.status === statusFilter);
        }

        setFilteredLeads(filtered);
    };

    const handleAction = (lead, actionType) => {
        setSelectedLead(lead);
        if (actionType === 'view') setIsViewModalOpen(true);
        if (actionType === 'edit') setIsEditModalOpen(true);
        if (actionType === 'delete') setIsDeleteModalOpen(true);
    };

    const updateStatus = async (newStatus) => {
        setActionLoading(true);
        try {
            const { data } = await api.patch(`/leads/${selectedLead.id}`, { status: newStatus });
            setLeads(prev => prev.map(l => l.id === data.id ? data : l));
            setIsEditModalOpen(false);
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteLead = async () => {
        setActionLoading(true);
        try {
            await api.delete(`/leads/${selectedLead.id}`);
            setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            alert('Failed to delete lead');
        } finally {
            setActionLoading(false);
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Leads Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track all customer inquiries</p>
                </div>
                <Button
                    onClick={exportToCSV}
                    className="gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Controls */}
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 sticky top-24 z-10 transition-all">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search by name or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'New', 'Contacted', 'Closed'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${statusFilter === filter
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
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
                <div className="p-6 border-b border-slate-100 dark:border-white/10">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Leads</h2>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Loading leads...</p>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                            <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p>No leads found matching your criteria</p>
                        </div>
                    ) : (
                        <table className="w-full">
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
                                            className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                                        >
                                            <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                                <div className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-800">
                                                        {lead.name.charAt(0)}
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleAction(lead, 'view')}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction(lead, 'edit')}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleAction(lead, 'delete')}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
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
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold">
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
                title="Update Lead Status"
            >
                <div className="space-y-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400">Update status for <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedLead?.name}</span></p>
                    <div className="grid grid-cols-2 gap-3">
                        {['New', 'Contacted', 'Closed'].map((status) => (
                            <Button
                                key={status}
                                variant={selectedLead?.status === status ? 'default' : 'outline'}
                                onClick={() => updateStatus(status)}
                                disabled={actionLoading}
                                className={`h-12 border-2 ${selectedLead?.status === status ? 'border-blue-600' : 'border-slate-100 dark:border-slate-800'}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
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
        </motion.div>
    );
};

export default LeadsManager;
