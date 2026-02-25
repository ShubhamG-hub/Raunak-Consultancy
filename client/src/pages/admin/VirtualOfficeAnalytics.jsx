import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Video, Clock, Award, Download, Play, ChevronRight, ExternalLink, Loader2
} from 'lucide-react';
import api from '@/lib/api';

export default function VirtualOfficeAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    async function fetchAll() {
        setLoading(true);
        try {
            const [analyticsRes, recordingsRes] = await Promise.all([
                api.get('/virtual-office/analytics'),
                api.get('/virtual-office/recordings'),
            ]);
            if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
            if (recordingsRes.data.success) setRecordings(recordingsRes.data.recordings);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Meetings',
            value: analytics?.totalMeetings ?? 0,
            icon: Video,
            color: 'blue',
            sub: `${analytics?.completedMeetings ?? 0} completed`,
        },
        {
            label: 'Total Duration',
            value: analytics?.totalDurationMinutes
                ? `${Math.round(analytics.totalDurationMinutes / 60)}h ${analytics.totalDurationMinutes % 60}m`
                : '0m',
            icon: Clock,
            color: 'emerald',
            sub: `Avg: ${analytics?.avgDurationMinutes ?? 0} min/session`,
        },
        {
            label: 'Recordings',
            value: analytics?.totalRecordings ?? 0,
            icon: Award,
            color: 'purple',
            sub: 'Cloud recordings',
        },
        {
            label: 'Avg Duration',
            value: `${analytics?.avgDurationMinutes ?? 0} min`,
            icon: ChevronRight,
            color: 'amber',
            sub: 'Per completed session',
        },
    ];

    const colorMap = {
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    };

    return (
        <div className="space-y-6 pt-4">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Meeting Analytics</h1>
                <p className="text-sm text-slate-500 mt-1">Virtual Office performance overview</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={stat.label}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">{stat.label}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            {analytics?.chartData?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                    <h2 className="text-base font-black text-slate-900 dark:text-white mb-6">Meetings Over Time</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={analytics.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' }}
                                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                            />
                            <Bar dataKey="count" name="Meetings" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Recordings table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Recordings</h2>
                    <p className="text-sm text-slate-500 mt-1">All cloud-recorded meeting sessions</p>
                </div>

                {recordings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Play className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-400">No recordings yet. Recordings appear here after meetings end.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    {['Client', 'Service', 'Date', 'Duration', 'Recording'].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {recordings.map(rec => (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{rec.bookings?.name || '—'}</p>
                                            <p className="text-xs text-slate-400">{rec.bookings?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{rec.bookings?.service || '—'}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                            {rec.started_at ? new Date(rec.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{rec.duration_minutes ? `${rec.duration_minutes} min` : '—'}</td>
                                        <td className="px-6 py-4">
                                            <a href={rec.recording_url} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">
                                                <ExternalLink className="w-3.5 h-3.5" />Watch
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
