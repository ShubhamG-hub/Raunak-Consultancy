import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, VideoOff, Users, Clock, Play, Square, Copy, CheckCircle2,
    MessageSquare, Paperclip, ChevronDown, RefreshCw, Loader2, AlertCircle, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaitingRoomQueue from '@/components/virtualOffice/WaitingRoomQueue';
import ChatPanel from '@/components/virtualOffice/ChatPanel';
import FilePanel from '@/components/virtualOffice/FilePanel';
import MeetingRoom from '@/components/virtualOffice/MeetingRoom';
import api from '@/lib/api';

const SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default function VirtualOfficeManager() {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [appState, setAppState] = useState('idle'); // idle | meeting
    const [rightTab, setRightTab] = useState('queue');
    const [waitingCount, setWaitingCount] = useState(0);
    const [sdkData, setSdkData] = useState(null);

    useEffect(() => { fetchBookings(); }, []);

    async function fetchBookings() {
        try {
            const { data } = await api.get('/virtual-office/scheduled-bookings');
            if (data.success) setBookings(data.bookings);
        } catch { /* silent */ }
    }

    async function handleStartMeeting() {
        if (!selectedBooking) return;
        setLoading(true);
        try {
            // Start meeting
            const { data } = await api.post('/virtual-office/start', { bookingId: selectedBooking.id });
            setActiveMeeting(data.meeting);

            // Generate booking access token for client
            const tokenRes = await api.post('/virtual-office/generate-booking-token', { bookingId: selectedBooking.id });

            // Build client meeting URL
            const clientUrl = `${window.location.origin}/virtual-office?booking=${selectedBooking.id}&token=${tokenRes.data.token}`;
            setMeetingLink(clientUrl);

            // Get admin SDK signature (role=1 = host)
            const sigRes = await api.post('/virtual-office/sdk-signature', {
                zoomMeetingId: data.meeting.zoom_meeting_id,
                role: 1,
            });
            setSdkData({
                ...sigRes.data,
                zoomMeetingId: data.meeting.zoom_meeting_id,
                zoomPassword: data.meeting.zoom_password,
            });

            setAppState('meeting');
        } catch (err) {
            alert('Failed to start meeting: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }

    async function handleEndMeeting() {
        if (!activeMeeting) return;
        if (!window.confirm('Are you sure you want to end this meeting?')) return;
        setLoading(true);
        try {
            await api.post(`/virtual-office/end/${activeMeeting.id}`);
            setAppState('idle');
            setActiveMeeting(null);
            setSdkData(null);
            setMeetingLink('');
            fetchBookings();
        } catch (err) {
            alert('Failed to end meeting: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(meetingLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    const adminName = 'Sudhir Gupta';

    // ── IDLE: Meeting Setup ────────────────────────────────────────────────────
    if (appState === 'idle') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Virtual Office</h1>
                        <p className="text-sm text-slate-500 mt-1">Select a booking and start a secure video consultation</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-2">
                        <RefreshCw className="w-4 h-4" />Refresh
                    </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending Bookings', value: bookings.length, icon: Clock, color: 'blue' },
                        { label: 'Active Meeting', value: appState === 'meeting' ? 'Live' : 'None', icon: Video, color: appState === 'meeting' ? 'green' : 'slate' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center mb-3`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Booking selector + Start */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Start a Meeting</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Select Booking</label>
                            <select
                                value={selectedBooking?.id || ''}
                                onChange={e => setSelectedBooking(bookings.find(b => b.id === e.target.value) || null)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                <option value="">— Choose a booking —</option>
                                {bookings.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} · {b.service} · {new Date(b.date || b.created_at).toLocaleDateString('en-IN')} {b.time || ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedBooking && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 space-y-2 text-sm">
                                {[
                                    ['Client', selectedBooking.name],
                                    ['Email', selectedBooking.email],
                                    ['Service', selectedBooking.service],
                                    ['Date', selectedBooking.date],
                                    ['Time', selectedBooking.time],
                                ].map(([k, v]) => v && (
                                    <div key={k} className="flex gap-3">
                                        <span className="font-bold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">{k}</span>
                                        <span className="text-slate-800 dark:text-slate-200">{v}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        <Button
                            onClick={handleStartMeeting}
                            disabled={!selectedBooking || loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl gap-2 shadow-lg shadow-blue-600/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {loading ? 'Starting...' : 'Start Meeting'}
                        </Button>
                    </div>
                </div>

                {/* Recent meetings */}
                <RecentMeetings />
            </div>
        );
    }

    // ── ACTIVE MEETING ─────────────────────────────────────────────────────────
    return (
        <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden -m-4 md:-m-8 p-4 md:p-6">
            {/* Meeting top bar */}
            <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-black text-slate-900 dark:text-white text-sm">LIVE · {selectedBooking?.name}</span>
                </div>
                <div className="flex-1" />

                {/* Client link */}
                {meetingLink && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 max-w-xs">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 truncate flex-1">{meetingLink.substring(0, 40)}…</span>
                        <button onClick={copyLink} className="flex-shrink-0">
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400 hover:text-blue-600" />}
                        </button>
                    </div>
                )}

                <Button variant="destructive" size="sm" onClick={handleEndMeeting} disabled={loading} className="gap-2 rounded-xl">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                    End Meeting
                </Button>
            </div>

            {/* Main: video + right panel */}
            <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
                {/* Video area */}
                <div className="flex-1 min-w-0">
                    {sdkData ? (
                        <MeetingRoom
                            meetingNumber={sdkData.zoomMeetingId}
                            signature={sdkData.signature}
                            sdkKey={sdkData.sdkKey}
                            password={sdkData.zoomPassword}
                            userName={adminName}
                            userEmail="ms.sudhirgupta@rediffmail.com"
                            role={1}
                            onLeave={handleEndMeeting}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Right panel */}
                <div className="w-72 xl:w-80 flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800">
                        {[
                            { id: 'queue', label: 'Waiting', badge: waitingCount },
                            { id: 'chat', label: 'Chat' },
                            { id: 'files', label: 'Files' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setRightTab(tab.id)}
                                className={`flex-1 relative py-3 text-xs font-bold transition-colors border-b-2 ${rightTab === tab.id ? 'text-blue-600 border-blue-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black rounded-full bg-amber-500 text-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 min-h-0">
                        {rightTab === 'queue' && (
                            <WaitingRoomQueue meetingId={activeMeeting?.id} onQueueUpdate={setWaitingCount} />
                        )}
                        {rightTab === 'chat' && (
                            <ChatPanel meetingId={activeMeeting?.id} senderName={adminName} senderRole="admin" />
                        )}
                        {rightTab === 'files' && (
                            <FilePanel meetingId={activeMeeting?.id} uploadedBy="admin" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─ Recent Meetings sub-component ─────────────────────────────────────────────
function RecentMeetings() {
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        api.get('/virtual-office/meetings').then(({ data }) => {
            if (data.success) setMeetings(data.meetings.slice(0, 5));
        }).catch(() => { });
    }, []);

    if (meetings.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-4">Recent Meetings</h2>
            <div className="space-y-3">
                {meetings.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'active' ? 'bg-emerald-500 animate-pulse' : m.status === 'ended' ? 'bg-slate-300 dark:bg-slate-600' : 'bg-amber-400'}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{m.bookings?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400">{m.bookings?.service} · {m.duration_minutes ? `${m.duration_minutes} min` : m.status}</p>
                        </div>
                        {m.recording_url && (
                            <a href={m.recording_url} target="_blank" rel="noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex-shrink-0">
                                Recording
                            </a>
                        )}
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${m.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                m.status === 'ended' ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' :
                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                            }`}>{m.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
