import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Phone,
    Mail,
    Briefcase,
    MessageSquare,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/Modal';

const STATUS_COLORS = {
    'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Cancelled': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
};

const BookingsManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const itemsPerPage = 10;

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter,
                search: searchTerm,
                date: dateFilter
            };
            const { data } = await api.get('/bookings', { params });
            setBookings(data.data);
            setTotalCount(data.count);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchTerm, dateFilter]);

    useEffect(() => {
        fetchBookings();

        // Real-time subscription - only if supabase is available
        if (!supabase) return;

        const channel = supabase
            .channel('bookings-changes')
            .on('postgres_changes', { event: '*', table: 'bookings', schema: 'public' }, () => {
                fetchBookings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchBookings]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { data } = await api.patch(`/bookings/${id}`, { status: newStatus });

            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(data);
            }
            setIsViewModalOpen(false);
            // fetchBookings() is called by real-time subscription, but we can call it manually for safety
            fetchBookings();

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };


    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            await api.delete(`/bookings/${id}`);
            alert('Booking deleted successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Failed to delete booking. Please try again.');
        }
    };


    const exportToCSV = () => {
        setExporting(true);
        try {
            const headers = ['ID', 'Name', 'Phone', 'Email', 'Date', 'Time', 'Service', 'Status', 'CreatedAt'];
            const rows = bookings.map(b => [
                b.id,
                b.name,
                b.phone,
                b.email || 'N/A',
                b.date,
                b.time,
                b.service_type,
                b.status,
                new Date(b.created_at).toLocaleString()
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export Error:', error);
        } finally {
            setExporting(false);
        }
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Bookings Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage consultancy sessions and appointments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={exportToCSV}
                        disabled={exporting || bookings.length === 0}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                    <Button
                        onClick={fetchBookings}
                        variant="ghost"
                        size="icon"
                        className="bg-slate-100 dark:bg-slate-800"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 transition-all"
            >
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search Name or Phone..."
                                className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="date"
                                className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'default' : 'outline'}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 sm:px-5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all h-9 sm:h-10 ${statusFilter === status
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                </div>
            </motion.div>


            {/* Main Content Area */}
            <Card className="border-slate-200 dark:border-white/10 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-6 h-16 bg-slate-50/50 dark:bg-slate-800/20" />
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
                                                    {booking.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white capitalize">{booking.name}</p>
                                                    <p className="text-xs text-slate-500">{booking.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {booking.time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-tight">
                                                {booking.service_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[booking.status]}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setSelectedBooking(booking); setIsViewModalOpen(true); }}
                                                    className="w-8 h-8 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="w-8 h-8 text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-4 space-y-4">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                        ))
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No bookings found.
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            {booking.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white capitalize text-sm">{booking.name}</h3>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Phone className="w-2.5 h-2.5" /> {booking.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${STATUS_COLORS[booking.status]}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-slate-100 dark:border-white/5">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Time & Date</p>
                                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-[10px] text-slate-500">{booking.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">Service</p>
                                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{booking.service_type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 rounded-xl text-[11px] font-bold"
                                        onClick={() => { setSelectedBooking(booking); setIsViewModalOpen(true); }}
                                    >
                                        Details / Actions
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 border-rose-100 text-rose-600 hover:bg-rose-50"
                                        onClick={() => handleDeleteBooking(booking.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 italic font-medium">
                        Showing {bookings.length} of {totalCount} bookings
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="h-7 w-7 p-0"
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </Button>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 px-1">
                            {currentPage} / {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || loading || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="h-7 w-7 p-0"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Card>


            {/* View/Action Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Booking Details"
            >
                {selectedBooking && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <User className="w-3 h-3" /> Client Name
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 capitalize">{selectedBooking.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Contact
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{selectedBooking.phone}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email Address
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{selectedBooking.email || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Schedule Info
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                        {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> Service Type
                                    </label>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{selectedBooking.service_type}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Message
                                    </label>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic leading-relaxed">
                                        "{selectedBooking.message || 'No additional message.'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-white/10">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-500" />
                                Update Booking Status
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-12 rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50"
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')}
                                    disabled={selectedBooking.status === 'Confirmed'}
                                >
                                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold uppercase tracking-tight text-[11px]">Confirm Booking</span>
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 h-12 rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50"
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Completed')}
                                    disabled={selectedBooking.status === 'Completed'}
                                >
                                    <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold uppercase tracking-tight text-[11px]">Mark Completed</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 h-12 rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50"
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                                    disabled={selectedBooking.status === 'Cancelled'}
                                >
                                    <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold uppercase tracking-tight text-[11px]">Cancel Session</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-amber-200 dark:border-amber-900/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 h-12 rounded-xl flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50"
                                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Pending')}
                                    disabled={selectedBooking.status === 'Pending'}
                                >
                                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="font-bold uppercase tracking-tight text-[11px]">Revert to Pending</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                )}
            </Modal>
        </div>

    );
};

export default BookingsManager;
