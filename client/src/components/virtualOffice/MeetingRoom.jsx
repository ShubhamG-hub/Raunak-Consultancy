import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Video, VideoOff, AlertCircle } from 'lucide-react';

/**
 * MeetingRoom — embeds Zoom using the Web SDK CDN approach (ZoomMtg standalone).
 * This works without npm install by loading Zoom's hosted SDK.
 *
 * Props:
 *   meetingNumber  string — Zoom meeting ID
 *   signature      string — server-generated SDK signature
 *   sdkKey         string — Zoom SDK Key (client ID from Meeting SDK app)
 *   password       string — meeting password
 *   userName       string — display name in meeting
 *   userEmail      string — user's email
 *   role           number — 0=attendee, 1=host
 *   onLeave        function — called when user leaves
 */
export default function MeetingRoom({ meetingNumber, signature, sdkKey, password, userName, userEmail, role = 0, onLeave }) {
    const containerRef = useRef(null);
    const [status, setStatus] = useState('loading'); // loading | joining | joined | error
    const [error, setError] = useState('');
    const sdkLoadedRef = useRef(false);

    async function loadAndJoin() {
        try {
            // Inject Zoom SDK stylesheet
            if (!document.getElementById('zoom-sdk-css')) {
                const link = document.createElement('link');
                link.id = 'zoom-sdk-css';
                link.rel = 'stylesheet';
                link.href = 'https://source.zoom.us/3.9.8/css/bootstrap.css';
                document.head.appendChild(link);

                const link2 = document.createElement('link');
                link2.id = 'zoom-sdk-css2';
                link2.rel = 'stylesheet';
                link2.href = 'https://source.zoom.us/3.9.8/css/react-select.css';
                document.head.appendChild(link2);
            }

            // Inject Zoom SDK JS
            if (!window.ZoomMtg) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://source.zoom.us/3.9.8/lib/vendor/react.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://source.zoom.us/3.9.8/lib/vendor/react-dom.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://source.zoom.us/3.9.8/lib/vendor/redux.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://source.zoom.us/3.9.8/lib/vendor/redux-thunk.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://source.zoom.us/3.9.8/zoom-meeting-embedded-3.9.8.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            setStatus('joining');

            const ZoomMtgEmbedded = window.ZoomMtgEmbedded;
            const client = ZoomMtgEmbedded.createClient();

            const meetingSDKElement = containerRef.current;
            if (!meetingSDKElement) return;

            client.init({
                debug: false,
                zoomAppRoot: meetingSDKElement,
                language: 'en-US',
                customize: {
                    meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
                    toolbar: {
                        buttons: [
                            { text: 'Leave', className: 'LeaveButton', onClick: () => { client.leaveMeeting(); onLeave?.(); } },
                        ],
                    },
                },
            });

            await client.join({
                signature,
                sdkKey,
                meetingNumber: String(meetingNumber),
                password: password || '',
                userName,
                userEmail,
                role,
            });

            setStatus('joined');
        } catch (err) {
            console.error('Zoom join error:', err);
            setError(err?.reason || err?.message || 'Failed to join meeting');
            setStatus('error');
        }
    }

    useEffect(() => {
        if (!meetingNumber || !signature || !sdkKey) return;
        if (sdkLoadedRef.current) return;
        sdkLoadedRef.current = true;

        loadAndJoin();

        return () => {
            // Cleanup: leave meeting if component unmounts
            try {
                if (window.ZoomMtg) {
                    window.ZoomMtg.leaveMeeting({});
                }
            } catch { /* ignore */ }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingNumber, signature, sdkKey]);


    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Failed to Join Meeting</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{error}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-4">
                    Ensure your Zoom SDK credentials are configured in the server .env file and that HTTPS is enabled.
                </p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden">
            {(status === 'loading' || status === 'joining') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary-theme/20 flex items-center justify-center mb-4 animate-pulse">
                        <Video className="w-8 h-8 text-primary-theme" />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{status === 'loading' ? 'Loading Zoom SDK...' : 'Joining meeting...'}</span>
                    </div>
                </div>
            )}
            {/* Zoom SDK renders into this div */}
            <div ref={containerRef} id="meetingSDKElement" className="w-full h-full" />
        </div>
    );
}
