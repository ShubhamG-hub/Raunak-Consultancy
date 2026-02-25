import { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Bot, MessageCircle, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const ChatManager = () => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 10000); // Pulse sessions every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let pollInterval;
        if (activeSession) {
            fetchMessages(activeSession.id);
            pollInterval = setInterval(() => fetchMessages(activeSession.id), 3000);
        }
        return () => clearInterval(pollInterval);
    }, [activeSession]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/chat/admin/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const response = await api.get(`/chat/messages/${sessionId}`);
            // Always update — comparing lengths misses edits/deletions with same count
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !activeSession) return;

        const text = replyText;
        setReplyText('');

        try {
            await api.post('/chat/messages', {
                session_id: activeSession.id,
                sender: 'admin',
                content: text
            });
            fetchMessages(activeSession.id);
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    };

    const handleBackToList = () => {
        setActiveSession(null);
        setMessages([]);
    };

    const filteredSessions = sessions.filter(s =>
        (s.user_name || 'Visitor').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.last_message || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sessions list component (shared between mobile and desktop)
    const SessionsList = () => (
        <>
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Live Chats
                </CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-y-auto">
                {loading ? (
                    <p className="p-4 text-center text-slate-500 text-sm">Loading sessions...</p>
                ) : filteredSessions.length === 0 ? (
                    <p className="p-4 text-center text-slate-500 text-sm">No chats found</p>
                ) : (
                    filteredSessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => setActiveSession(session)}
                            className={`w-full text-left p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 ${activeSession?.id === session.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm truncate">{session.user_name || 'Visitor'}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{session.last_message}</p>
                            </div>
                        </button>
                    ))
                )}
            </CardContent>
        </>
    );

    // Chat window component (shared between mobile and desktop)
    const ChatWindow = ({ showBackButton = false }) => (
        <>
            {activeSession ? (
                <>
                    <CardHeader className="p-4 border-b bg-white dark:bg-slate-900 rounded-t-xl flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            {showBackButton && (
                                <button
                                    onClick={handleBackToList}
                                    className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{activeSession.user_name || 'Visitor'}</CardTitle>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Active Session</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end text-[10px] text-slate-400 font-mono">
                            <span>ID: {activeSession.id.split('-')[0]}</span>
                            <span>Started: {new Date(activeSession.created_at).toLocaleDateString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                            >
                                {msg.sender !== 'admin' && (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mb-1">
                                        {msg.sender === 'bot' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                                    </div>
                                )}
                                <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'admin'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : msg.sender === 'bot'
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-slate-900 dark:text-slate-100 border border-blue-100 dark:border-blue-800 rounded-bl-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {msg.sender === 'admin' && (
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-1">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </CardContent>
                    <form onSubmit={handleSendReply} className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t rounded-b-xl flex gap-2">
                        <Input
                            className="flex-grow"
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <Button type="submit" disabled={!replyText.trim()} size="sm" className="md:size-default">
                            <Send className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Send</span>
                        </Button>
                    </form>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 p-8">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <MessageCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Select a chat to join</h3>
                    <p className="text-sm max-w-xs text-center">Monitor active sessions and reply to clients in real-time.</p>
                </div>
            )}
        </>
    );

    return (
        <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)]">
            {/* Desktop Layout: Side-by-side */}
            <div className="hidden md:flex gap-6 h-full">
                <Card className="w-80 flex flex-col">
                    <SessionsList />
                </Card>
                <Card className="flex-grow flex flex-col border-none shadow-lg">
                    <ChatWindow />
                </Card>
            </div>

            {/* Mobile Layout: Stacked with toggle */}
            <div className="md:hidden h-full">
                {activeSession ? (
                    <Card className="h-full flex flex-col border-none shadow-lg">
                        <ChatWindow showBackButton={true} />
                    </Card>
                ) : (
                    <Card className="h-full flex flex-col">
                        <SessionsList />
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ChatManager;