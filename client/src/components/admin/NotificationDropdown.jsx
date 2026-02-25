import { useState, useEffect, useRef } from 'react';
import { Bell, Users, MessageCircle, Star, FileText, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const ICON_MAP = {
    new_lead: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    new_chat: { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/50' },
    new_testimonial: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/50' },
    claim_update: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/50' },
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Poll unread count every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count || 0);
        } catch {
            // silently fail - notifications are non-critical
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications');
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-white dark:ring-slate-900"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed sm:absolute inset-x-4 sm:inset-auto sm:right-0 mt-2 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden z-50 top-16 sm:top-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const iconConfig = ICON_MAP[notification.type] || ICON_MAP.new_lead;
                                    const Icon = iconConfig.icon;

                                    return (
                                        <button
                                            key={notification.id}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${notification.read
                                                ? 'bg-white dark:bg-slate-900 opacity-60'
                                                : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon className={`w-4 h-4 ${iconConfig.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm ${notification.read ? 'font-normal text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-white'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{notification.message}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(notification.created_at)}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
