import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, User, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function WaitingRoomQueue({ meetingId, onQueueUpdate }) {
    const [queue, setQueue] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        if (!meetingId) return;
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingId]);

    async function fetchQueue() {
        try {
            const { data } = await api.get(`/virtual-office/waiting-room/${meetingId}`);
            if (data.success) {
                setQueue(data.queue);
                onQueueUpdate?.(data.queue.filter(e => e.status === 'waiting').length);
            }
        } catch { /* silent */ }
    }

    async function handleAdmit(id) {
        setProcessing(id);
        try {
            await api.post(`/virtual-office/admit/${id}`);
            await fetchQueue();
        } catch { /* silent */ } finally { setProcessing(null); }
    }

    async function handleReject(id) {
        setProcessing(id);
        try {
            await api.post(`/virtual-office/reject/${id}`);
            await fetchQueue();
        } catch { /* silent */ } finally { setProcessing(null); }
    }

    const waiting = queue.filter(e => e.status === 'waiting');
    const others = queue.filter(e => e.status !== 'waiting');

    return (
        <div className="space-y-4">
            {/* Waiting */}
            {waiting.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Waiting ({waiting.length})</h4>
                    </div>
                    <div className="space-y-2">
                        {waiting.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{entry.user_name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{entry.user_email}</p>
                                    <p className="text-[10px] text-amber-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(entry.join_requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button onClick={() => handleAdmit(entry.id)} disabled={!!processing}
                                        className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                                        {processing === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleReject(entry.id)} disabled={!!processing}
                                        className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Admitted / Rejected */}
            {others.length > 0 && (
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">History</h4>
                    <div className="space-y-2">
                        {others.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 opacity-70">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    {entry.status === 'admitted'
                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        : <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{entry.user_name}</p>
                                    <p className="text-[10px] text-slate-400 capitalize">{entry.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {queue.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No users in waiting room</p>
                </div>
            )}
        </div>
    );
}
