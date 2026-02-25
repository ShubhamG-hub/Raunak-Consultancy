import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Video, MessageSquare, Paperclip, Users, Loader2, Shield } from 'lucide-react';
import MeetingRoom from '@/components/virtualOffice/MeetingRoom';
import ChatPanel from '@/components/virtualOffice/ChatPanel';
import FilePanel from '@/components/virtualOffice/FilePanel';
import api from '@/lib/api';

// ─ States: validating → waiting → admitted → rejected ─────────────────────────
export default function VirtualOffice() {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking');
    const token = searchParams.get('token');

    const [state, setState] = useState('validating'); // validating | waiting | admitted | rejected | error
    const [error, setError] = useState('');
    const [meetingData, setMeetingData] = useState(null);    // { meetingId, zoomMeetingId, zoomPassword, signature, sdkKey }
    const [, setWaitingEntry] = useState(null);
    const [rightTab, setRightTab] = useState('chat');

    // User info — collected from URL or defaults
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [nameSubmitted, setNameSubmitted] = useState(false);

    // ── Step 1: Validate booking → get meeting ─────────────────────────────────
    const validateAndGetMeeting = useCallback(async () => {
        if (!bookingId || !token) return;
        try {
            const { data } = await api.get(`/virtual-office/join/${bookingId}`, {
                headers: { 'x-booking-token': token },
                params: { token },
            });

            if (data.success) {
                setMeetingData(data);
                // Enter waiting room
                const wrRes = await api.post(
                    `/virtual-office/enter-waiting/${data.meetingId}`,
                    { userName, userEmail, bookingId },
                    { headers: { 'x-booking-token': token }, params: { token } }
                );
                setWaitingEntry(wrRes.data.waitingEntry);
                setState('waiting');
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            if (msg.includes('No active meeting')) {
                setError('The advisor hasn\'t started the meeting yet. Please wait and try again shortly.');
            } else {
                setError(msg || 'Failed to join. Please check your booking link.');
            }
            setState('error');
        }
    }, [bookingId, token, userName, userEmail]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (nameSubmitted) validateAndGetMeeting();
    }, [nameSubmitted, validateAndGetMeeting]);

    // ── Step 2: Poll for admission status ─────────────────────────────────────
    useEffect(() => {
        if (state !== 'waiting' || !meetingData?.meetingId) return;
        const interval = setInterval(async () => {
            try {
                const { data } = await api.get(
                    `/virtual-office/admission-status/${meetingData.meetingId}`,
                    {
                        headers: { 'x-booking-token': token },
                        params: { token, email: userEmail },
                    }
                );
                if (data.status?.status === 'admitted') setState('admitted');
                if (data.status?.status === 'rejected') setState('rejected');
            } catch { /* silent */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [state, meetingData, token, userEmail]);

    // ─────────────────────────────────────────────────────────────────────────
    // SCREEN: Name / Email form (before joining)
    if (!nameSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-theme/20 to-slate-900 flex items-center justify-center p-6 pt-32">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary-theme flex items-center justify-center shadow-lg shadow-primary-theme/30">
                            <Video className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white text-center mb-1">Virtual Office</h1>
                    <p className="text-sm text-slate-400 text-center mb-8">Raunak Consultancy · Secure Meeting</p>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Your Name</label>
                            <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-theme/50 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Your Email</label>
                            <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" />
                        </div>
                        <button
                            onClick={() => { if (userName.trim() && userEmail.trim()) setNameSubmitted(true); }}
                            disabled={!userName.trim() || !userEmail.trim()}
                            className="w-full py-3 rounded-xl bg-primary-theme hover:opacity-90 text-white font-bold transition-colors disabled:opacity-40 mt-2">
                            Join Meeting →
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-xs text-slate-500 justify-center">
                        <Shield className="w-3.5 h-3.5" />
                        End-to-end encrypted · Zoom powered
                    </div>
                </motion.div>
            </div>
        );
    }

    // SCREEN: Validating
    if (state === 'validating') {
        return <FullScreenStatus icon={<Loader2 className="w-8 h-8 text-primary-theme animate-spin" />} title="Validating your access..." subtitle="Please wait while we verify your booking." />;
    }

    // SCREEN: Error
    if (state === 'error') {
        return <FullScreenStatus icon={<XCircle className="w-8 h-8 text-red-400" />} title="Cannot Join" subtitle={error} color="red" />;
    }

    // SCREEN: Rejected
    if (state === 'rejected') {
        return <FullScreenStatus icon={<XCircle className="w-8 h-8 text-red-400" />} title="Entry Declined" subtitle="The advisor has declined your meeting request. Please contact support." color="red" />;
    }

    // SCREEN: Waiting Room
    if (state === 'waiting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-theme/20 to-slate-900 flex items-center justify-center p-6 pt-32">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                    <div className="relative inline-flex mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Clock className="w-10 h-10 text-amber-400" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">You're in the Waiting Room</h2>
                    <p className="text-slate-400 text-sm mb-6">The advisor will admit you shortly. This page refreshes automatically.</p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Name</span><span className="text-white font-bold">{userName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Status</span><span className="text-amber-400 font-bold">Waiting</span></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />Checking for admission every 3 seconds…
                    </div>
                </motion.div>
            </div>
        );
    }

    // SCREEN: Admitted — Full Meeting Room
    return (
        <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="h-12 flex items-center justify-between px-4 bg-slate-950/80 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">Virtual Office · Live</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>{userName}</span>
                </div>
            </div>

            {/* Main layout: video left + right panel */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video */}
                <div className="flex-1 p-4 min-w-0">
                    <MeetingRoom
                        meetingNumber={meetingData?.zoomMeetingId}
                        signature={meetingData?.signature}
                        sdkKey={meetingData?.sdkKey}
                        password={meetingData?.zoomPassword}
                        userName={userName}
                        userEmail={userEmail}
                        role={0}
                        onLeave={() => window.location.href = '/'}
                    />
                </div>

                {/* Right Panel */}
                <div className="w-80 flex flex-col border-l border-white/10 bg-slate-950/50 flex-shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: 'chat', icon: MessageSquare, label: 'Chat' },
                            { id: 'files', icon: Paperclip, label: 'Files' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setRightTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors ${rightTab === tab.id ? 'text-primary-theme border-b-2 border-primary-theme' : 'text-slate-400 hover:text-slate-200'}`}>
                                <tab.icon className="w-3.5 h-3.5" />{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-hidden p-3">
                        {rightTab === 'chat' && (
                            <ChatPanel meetingId={meetingData?.meetingId} senderName={userName} senderRole="client" bookingToken={token} />
                        )}
                        {rightTab === 'files' && (
                            <FilePanel meetingId={meetingData?.meetingId} uploadedBy={userEmail} bookingToken={token} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─ Helper: Full-screen status card ───────────────────────────────────────────
function FullScreenStatus({ icon, title, subtitle, color = 'blue' }) {
    const colorMap = { blue: 'bg-primary-theme/20 border-primary-theme/30', red: 'bg-red-600/20 border-red-500/30' };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-theme/20 to-slate-900 flex items-center justify-center p-6 pt-32">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                className="text-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl max-w-sm w-full">
                <div className={`mx-auto w-20 h-20 rounded-2xl border ${colorMap[color]} flex items-center justify-center mb-6`}>{icon}</div>
                <h2 className="text-xl font-black text-white mb-2">{title}</h2>
                <p className="text-slate-400 text-sm">{subtitle}</p>
            </motion.div>
        </div>
    );
}