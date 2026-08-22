import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { Play, Square, Clock, Coffee, Zap, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSocket } from '../../utils/socket';

const TrackWidget = () => {
    const { user } = useContext(AuthContext);
    const [attendance, setAttendance] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [breakElapsedSeconds, setBreakElapsedSeconds] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isBreakLoading, setIsBreakLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [meetingElapsedSeconds, setMeetingElapsedSeconds] = useState(0);

    const timerRef = useRef(null);
    const breakTimerRef = useRef(null);
    const meetingTimerRef = useRef(null);
    const workStartTimestampRef = useRef(null);
    const breakStartTimestampRef = useRef(null);
    const meetingStartTimestampRef = useRef(null);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            setTimeout(() => {
                osc.stop();
                ctx.close();
            }, 300);
        } catch (e) {
            console.error('Audio beep failed', e);
        }
    };

    const fetchSync = async () => {
        try {
            const res = await api.get('/attendance/today');
            const data = res.data;
            setAttendance(data);

            const isOnBreak = data.onBreak || data.status === 'On Break';
            const isInMeeting = !!data.meetingStartTime;

            if (data.working && data.checkInTime) {
                let initialWorkSecs = 0;
                if (data.activeWorkingSeconds !== undefined) {
                    initialWorkSecs = data.activeWorkingSeconds;
                } else {
                    const start = new Date(data.checkInTime);
                    const elapsed = Math.floor((new Date() - start) / 1000);
                    initialWorkSecs = elapsed > 0 ? elapsed : 0;
                }

                if (!isOnBreak) {
                    startEngine(initialWorkSecs);
                    stopBreakEngine();
                    
                    if (isInMeeting) {
                        let initialMeetingSecs = 0;
                        if (data.meetingStartTime) {
                            const meetingElapsed = Math.floor((new Date() - new Date(data.meetingStartTime)) / 1000);
                            initialMeetingSecs = meetingElapsed > 0 ? meetingElapsed : 0;
                        }
                        startMeetingEngine(initialMeetingSecs);
                    } else {
                        stopMeetingEngine();
                    }
                } else {
                    // On break — start break timer from breakStartTime
                    stopEngine();
                    let initialBreakSecs = 0;
                    if (data.breakStartTime) {
                        const breakElapsed = Math.floor((new Date() - new Date(data.breakStartTime)) / 1000);
                        initialBreakSecs = breakElapsed > 0 ? breakElapsed : 0;
                    }
                    startBreakEngine(initialBreakSecs);
                }

                if (window.electron) {
                    const token = localStorage.getItem('token');
                    window.electron.send('set-token', token);
                    window.electron.send('start-monitoring', { sessionId: data.sessionId });
                }
            } else {
                stopEngine();
                stopBreakEngine();
                stopMeetingEngine();
                const totalSecs = data.activeWorkingSeconds !== undefined ? data.activeWorkingSeconds : (data.totalMinutes || 0) * 60;
                setElapsedSeconds(totalSecs);
                if (window.electron) window.electron.send('stop-monitoring');
            }
        } catch (err) {
            console.error("Sync error:", err);
            toast.error("Network synchronization failed");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Helper to get location with high accuracy falling back to low accuracy
    const getCoordinates = async () => {
        if (!("geolocation" in navigator)) {
            return {};
        }

        const getPosition = (options) => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        };

        try {
            // Try high accuracy first
            const position = await getPosition({
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (geoError) {
            console.warn('High accuracy geolocation failed, trying low accuracy fallback:', geoError);
            try {
                // Fallback to low accuracy
                const position = await getPosition({
                    enableHighAccuracy: false,
                    timeout: 8000,
                    maximumAge: 60000
                });
                return {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
            } catch (fallbackError) {
                console.warn('Fallback geolocation also failed:', fallbackError);
                toast.error('Location capture failed. Please check browser permissions.');
                return {};
            }
        }
    };

    useEffect(() => {
        fetchSync();

        // Listen for visibility & window focus changes to update timer instantly when user returns to tab
        const handleSyncOnReturn = () => {
            fetchSync();
        };

        document.addEventListener('visibilitychange', handleSyncOnReturn);
        window.addEventListener('focus', handleSyncOnReturn);

        const socket = getSocket();
        let hb;
        if (socket) {
            hb = setInterval(() => socket.emit('heartbeat'), 30000);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleSyncOnReturn);
            window.removeEventListener('focus', handleSyncOnReturn);
            if (hb) clearInterval(hb);
            stopEngine();
            stopBreakEngine();
            stopMeetingEngine();
        };
    }, []);

    const startEngine = (initialSecs) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (initialSecs !== undefined) {
            workStartTimestampRef.current = Date.now() - (initialSecs * 1000);
        }

        const tickWork = () => {
            if (workStartTimestampRef.current) {
                const sec = Math.max(0, Math.floor((Date.now() - workStartTimestampRef.current) / 1000));
                setElapsedSeconds(sec);
            }
        };

        tickWork();
        timerRef.current = setInterval(tickWork, 1000);
    };

    const stopEngine = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startBreakEngine = (initialBreakSecs) => {
        if (breakTimerRef.current) clearInterval(breakTimerRef.current);
        if (initialBreakSecs !== undefined) {
            breakStartTimestampRef.current = Date.now() - (initialBreakSecs * 1000);
        }

        const tickBreak = () => {
            if (breakStartTimestampRef.current) {
                const sec = Math.max(0, Math.floor((Date.now() - breakStartTimestampRef.current) / 1000));
                setBreakElapsedSeconds(sec);
            }
        };

        tickBreak();
        breakTimerRef.current = setInterval(tickBreak, 1000);
    };

    const stopBreakEngine = () => {
        if (breakTimerRef.current) clearInterval(breakTimerRef.current);
        setBreakElapsedSeconds(0);
    };

    const startMeetingEngine = (initialMeetingSecs) => {
        if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
        if (initialMeetingSecs !== undefined) {
            meetingStartTimestampRef.current = Date.now() - (initialMeetingSecs * 1000);
        }

        const tickMeeting = () => {
            if (meetingStartTimestampRef.current) {
                const sec = Math.max(0, Math.floor((Date.now() - meetingStartTimestampRef.current) / 1000));
                setMeetingElapsedSeconds(sec);
            }
        };

        tickMeeting();
        meetingTimerRef.current = setInterval(tickMeeting, 1000);
    };

    const stopMeetingEngine = () => {
        if (meetingTimerRef.current) clearInterval(meetingTimerRef.current);
        setMeetingElapsedSeconds(0);
    };

    const handleCheckIn = async () => {
        setIsRefreshing(true);
        try {
            const coords = await getCoordinates();

            await api.post('/attendance/check-in', coords);
            playBeep();
            toast.success('Check-in Successful');
            await fetchSync();
            if (window.electron) {
                const token = localStorage.getItem('token');
                window.electron.send('set-token', token);
                window.electron.send('start-monitoring', { sessionId: attendance?.sessionId || '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCheckOut = async () => {
        if (!window.confirm("Complete your shift and check out?")) return;
        setIsRefreshing(true);
        try {
            const coords = await getCoordinates();

            await api.post('/attendance/checkout', coords);
            playBeep();
            toast.success('Check-out Successful');
            stopBreakEngine();
            stopMeetingEngine();
            await fetchSync();
            if (window.electron) window.electron.send('stop-monitoring');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleBreakStart = async () => {
        setIsBreakLoading(true);
        try {
            await api.post('/attendance/break-start');
            playBeep();
            toast.success('Break started — timer paused');
            stopEngine();
            setBreakElapsedSeconds(0);
            startBreakEngine(0);
            setAttendance(prev => ({ ...prev, onBreak: true, breakStartTime: new Date().toISOString() }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not start break');
        } finally {
            setIsBreakLoading(false);
        }
    };

    const handleBreakEnd = async () => {
        setIsBreakLoading(true);
        try {
            await api.post('/attendance/break-end');
            playBeep();
            toast.success('Break ended — back to work!');
            stopBreakEngine();
            const res = await api.get('/attendance/today');
            setAttendance(res.data);
            startEngine(res.data.activeWorkingSeconds || 0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not end break');
        } finally {
            setIsBreakLoading(false);
        }
    };
    const handleMeetingStart = async () => {
        setIsRefreshing(true);
        try {
            await api.post('/attendance/meeting-start');
            playBeep();
            toast.success('Meeting started');
            stopEngine();
            setMeetingElapsedSeconds(0);
            startMeetingEngine(0);
            setAttendance(prev => ({ ...prev, meetingStartTime: new Date().toISOString(), status: 'In Meeting' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not start meeting');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleMeetingEnd = async () => {
        setIsRefreshing(true);
        try {
            await api.post('/attendance/meeting-end');
            playBeep();
            toast.success('Meeting ended');
            stopMeetingEngine();
            const res = await api.get('/attendance/today');
            setAttendance(res.data);
            startEngine(res.data.activeWorkingSeconds || 0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not end meeting');
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatLong = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const formatMinutes = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const isWorking = attendance?.working;
    const isOnBreak = attendance?.onBreak || attendance?.status === 'On Break';
    const isInMeeting = !!attendance?.meetingStartTime;

    return (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center relative overflow-hidden group">
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-all duration-1000 ${isOnBreak ? 'bg-amber-400/15' : isWorking ? 'bg-brand-500/10' : 'bg-slate-200/20'}`}></div>

            <div className="flex items-center justify-between w-full mb-10">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isOnBreak ? 'bg-amber-50 text-amber-600' : isWorking ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'}`}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">Time Tracker</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Accurate</p>
                    </div>
                </div>
                {isWorking && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${isOnBreak
                        ? 'bg-amber-50 text-amber-600'
                        : isInMeeting ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnBreak ? 'bg-amber-500' : isInMeeting ? 'bg-indigo-500' : 'bg-emerald-600'}`}></span>
                        {isOnBreak ? 'On Break' : isInMeeting ? 'In Meeting' : 'Working'}
                    </div>
                )}
            </div>

            {/* Main Timer */}
            <div className="relative mb-4 text-center">
                <div className={`text-7xl font-black tracking-tighter tabular-nums transition-colors duration-500 ${isOnBreak ? 'text-amber-400' : isWorking ? 'text-slate-900' : 'text-slate-200'}`}>
                    {formatLong(elapsedSeconds)}
                </div>
                <div className="mt-4 flex flex-col items-center gap-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Today Total: <span className="text-brand-600">{formatMinutes(attendance?.totalMinutes || 0)}</span></p>
                </div>
            </div>

            {/* Break / Meeting Timers */}
            {(isOnBreak || isInMeeting) && (
                <div className="mb-6 flex gap-3">
                    {isOnBreak && (
                        <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-2 text-amber-700">
                            <Coffee size={14} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Break: {formatLong(breakElapsedSeconds)}</span>
                        </div>
                    )}
                    {isInMeeting && (
                        <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-2 text-indigo-700">
                            <Zap size={14} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Meeting: {formatLong(meetingElapsedSeconds)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="w-full space-y-6">
                {!isWorking ? (
                    <button
                        onClick={handleCheckIn}
                        disabled={loading || isRefreshing}
                        className="w-full h-20 bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-[28px] font-black text-xl hover:shadow-2xl hover:shadow-brand-600/40 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 group"
                    >
                        {(loading || isRefreshing) ? <Loader2 className="animate-spin" /> : (
                            <>
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <Play size={20} fill="currentColor" />
                                </div>
                                Start Check-In
                            </>
                        )}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {/* On Break / Resume Button */}
                            {!isOnBreak ? (
                                <button
                                    onClick={handleBreakStart}
                                    disabled={isBreakLoading}
                                    className="h-24 rounded-[32px] bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center gap-2 hover:bg-amber-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                                >
                                    {isBreakLoading ? <Loader2 size={22} className="animate-spin" /> : <Coffee size={22} />}
                                    <span className="text-[10px] uppercase tracking-widest font-bold">On Break</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleBreakEnd}
                                    disabled={isBreakLoading}
                                    className="h-24 rounded-[32px] bg-emerald-50 border border-emerald-200 text-emerald-700 flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                                >
                                    {isBreakLoading ? <Loader2 size={22} className="animate-spin" /> : <RotateCcw size={22} />}
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Resume</span>
                                </button>
                            )}

                            {/* Meeting Button */}
                            {!isInMeeting ? (
                                <button
                                    onClick={handleMeetingStart}
                                    disabled={isRefreshing || isOnBreak}
                                    className={`h-24 rounded-[32px] border flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${isOnBreak ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:-translate-y-0.5 active:scale-95'}`}
                                >
                                    <Zap size={22} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Meeting</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleMeetingEnd}
                                    disabled={isRefreshing}
                                    className="h-24 rounded-[32px] bg-indigo-100 border border-indigo-300 text-indigo-800 flex flex-col items-center justify-center gap-2 hover:bg-indigo-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                                >
                                    <RotateCcw size={22} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">End Meet</span>
                                </button>
                            )}

                            {/* Tracking Live indicator */}
                            <div className={`h-24 rounded-[32px] border flex flex-col items-center justify-center gap-2 ${isOnBreak
                                ? 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'
                                : isInMeeting ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                                : 'bg-brand-50 border-brand-100 text-brand-700'
                                }`}>
                                <Clock size={24} className={!isOnBreak ? 'animate-pulse' : ''} />
                                <span className="text-[10px] uppercase tracking-widest font-black text-center leading-tight">
                                    {isOnBreak ? 'Paused' : isInMeeting ? 'Live Meet' : 'Live'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckOut}
                            disabled={loading || isRefreshing || isOnBreak || isInMeeting}
                            title={isOnBreak ? 'End your break before checking out' : isInMeeting ? 'End meeting before checking out' : ''}
                            className={`w-full h-20 rounded-[28px] font-black text-xl transition-all duration-300 flex items-center justify-center gap-4 group ${(isOnBreak || isInMeeting)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:shadow-2xl hover:shadow-slate-900/40 hover:-translate-y-1 active:scale-95'
                                }`}
                        >
                            {(loading || isRefreshing) ? <Loader2 className="animate-spin" /> : (
                                <>
                                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Square size={20} fill="currentColor" />
                                    </div>
                                    {isOnBreak ? 'End Break First' : 'Finish Check-Out'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnBreak ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : isWorking ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        {isOnBreak ? 'ON BREAK' : isWorking ? 'WORKING' : 'CHECKED-OUT'}
                    </span>
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                    {attendance?.date || 'NO SESSION'}
                </div>
            </div>
        </div>
    );
};

export default TrackWidget;
