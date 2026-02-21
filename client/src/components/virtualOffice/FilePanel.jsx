import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Download, FileImage, FileText, FileArchive, Loader2, Paperclip } from 'lucide-react';
import api from '@/lib/api';

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <FileImage className="w-4 h-4 text-purple-500" />;
    if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="w-4 h-4 text-yellow-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
}

export default function FilePanel({ meetingId, uploadedBy, bookingToken }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!meetingId) return;
        fetchFiles();
        const interval = setInterval(fetchFiles, 5000);
        return () => clearInterval(interval);
    }, [meetingId]);

    async function fetchFiles() {
        try {
            const headers = bookingToken ? { 'x-booking-token': bookingToken } : {};
            const { data } = await api.get(`/virtual-office/files/${meetingId}`, { headers });
            if (data.success) setFiles(data.files);
        } catch { /* silent */ }
    }

    async function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file || !meetingId) return;
        setUploading(true);

        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const headers = bookingToken ? { 'x-booking-token': bookingToken } : {};
            await api.post('/virtual-office/files/upload', {
                meetingId,
                fileName: file.name,
                fileBase64: base64,
                mimeType: file.type || 'application/octet-stream',
                uploadedBy,
            }, { headers });

            await fetchFiles();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Files</span>
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">{files.length}</span>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {files.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 text-center">
                        <Paperclip className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-xs">No files shared yet.</p>
                    </div>
                )}
                {files.map((file) => (
                    <div key={file.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm flex-shrink-0">
                            {getFileIcon(file.file_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.file_name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{file.uploaded_by} · {new Date(file.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <a href={file.file_url} target="_blank" rel="noreferrer"
                            className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors opacity-0 group-hover:opacity-100">
                            <Download className="w-3.5 h-3.5" />
                        </a>
                    </div>
                ))}
            </div>

            {/* Upload Button */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Share a File'}
                </button>
            </div>
        </div>
    );
}
