import React from 'react';
import { Users, User, Mic, MicOff, Video, VideoOff } from 'lucide-react';

/**
 * ParticipantList — simple display of meeting participants.
 * In the Zoom Web SDK the participant list is managed by Zoom itself inside the meeting.
 * This component shows a supplementary list from the waiting room & admitted users.
 */
export default function ParticipantList({ participants = [] }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Participants ({participants.length})</span>
            </div>

            {participants.length === 0 && (
                <div className="text-center py-6 text-slate-400 dark:text-slate-600">
                    <User className="w-7 h-7 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No participants yet</p>
                </div>
            )}

            {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${p.role === 'admin'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        }`}>
                        {p.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                            {p.role === 'admin' && <span className="ml-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">Host</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">{p.status || 'In meeting'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {p.audioMuted !== false ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
                        {p.videoOff !== false ? <VideoOff className="w-3.5 h-3.5 text-red-400" /> : <Video className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                </div>
            ))}
        </div>
    );
}
