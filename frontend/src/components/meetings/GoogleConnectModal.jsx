import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { X, Video, Calendar, CheckCircle2, AlertCircle, RefreshCw, LogOut, Shield, Globe } from 'lucide-react';

const GoogleConnectModal = ({ isOpen, onClose, onUpdated }) => {
    const [status, setStatus] = useState({
        isConfiguredOnServer: false,
        isConnected: false,
        googleEmail: '',
        googleName: '',
        lastSyncedAt: null,
        authUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStatus();
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/meetings/google-status');
            setStatus(data);
        } catch (e) {
            console.error('Failed to load Google status', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        if (status.authUrl) {
            window.location.href = status.authUrl;
        } else {
            toast.error('Google OAuth credentials not configured on server yet. Google Meet links will automatically generate with direct secure conference rooms.');
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await api.post('/meetings/google-disconnect');
            toast.success('Google Calendar disconnected');
            fetchStatus();
            if (onUpdated) onUpdated();
        } catch (e) {
            toast.error('Failed to disconnect Google account');
        } finally {
            setDisconnecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Google Calendar & Meet Integration</h3>
                            <p className="text-xs text-slate-500 font-medium">Enterprise Two-Way Calendar Synchronization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Card */}
                    <div className={`p-5 rounded-2xl border ${
                        status.isConnected 
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Connection Status</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                status.isConnected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                                {status.isConnected ? 'Connected ✓' : 'Not Connected'}
                            </span>
                        </div>

                        {status.isConnected ? (
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-emerald-900">{status.googleName || 'Google Workspace Account'}</p>
                                <p className="text-xs text-emerald-700 font-medium">{status.googleEmail}</p>
                                <p className="text-[10px] text-emerald-600 mt-2">
                                    ✓ Auto-syncs events • ✓ Creates actual Google Meet conference rooms
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Connect your Google Workspace or Gmail account to sync meetings automatically with Google Calendar and generate genuine Google Meet conferences for invitees.
                            </p>
                        )}
                    </div>

                    {/* Features overview */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Features Included:</p>
                        <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <Video size={14} className="text-brand-600" />
                                <span>Real Google Meet conference link creation on schedule</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <Calendar size={14} className="text-emerald-600" />
                                <span>Two-way Google Calendar event synchronization</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                <Globe size={14} className="text-indigo-600" />
                                <span>Automatic invite delivery to clients & internal participants</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                        Close
                    </button>

                    {status.isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            {disconnecting ? 'Disconnecting...' : 'Disconnect Account'}
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                        >
                            <Calendar size={16} />
                            Connect Google Calendar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoogleConnectModal;
