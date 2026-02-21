import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, User } from 'lucide-react';
import api from '@/lib/api';

export default function ChatPanel({ meetingId, senderName, senderRole, bookingToken }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!meetingId) return;
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [meetingId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchMessages() {
        try {
            const headers = bookingToken ? { 'x-booking-token': bookingToken } : {};
            const { data } = await api.get(`/virtual-office/chat/${meetingId}`, { headers });
            if (data.success) setMessages(data.chat);
        } catch { /* silent */ }
    }

    async function sendMessage(e) {
        e.preventDefault();
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            const headers = bookingToken ? { 'x-booking-token': bookingToken } : {};
            await api.post('/virtual-office/chat', {
                meetingId,
                senderName,
                senderRole,
                message: input.trim(),
            }, { headers });
            setInput('');
            await fetchMessages();
        } catch { /* silent */ } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Meeting Chat</span>
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{messages.length}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-center">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs">No messages yet. Say hello!</p>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_name === senderName;
                    return (
                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender_role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                {msg.sender_role === 'admin'
                                    ? <Bot className="w-4 h-4 text-blue-600" />
                                    : <User className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
                                    {msg.sender_name}
                                </span>
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                                    }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[9px] text-slate-300 dark:text-slate-600 px-1">
                                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-slate-100 dark:border-slate-800">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    disabled={sending}
                />
                <button type="submit" disabled={sending || !input.trim()}
                    className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
