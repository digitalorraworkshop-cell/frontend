import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    Search,
    Filter,
    Calendar,
    User,
    Clock,
    AlertCircle,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';

import { getSocket } from '../utils/socket';

const AdminActivityMonitoring = () => {
    const [screenshots, setScreenshots] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchInitialData();

        // Listen for real-time screenshots
        const socket = getSocket();
        if (socket) {
            socket.on('new-screenshot', (newShot) => {
                // Only add if it matches current date filter
                const today = new Date().toISOString().split('T')[0];
                if (filters.date === today) {
                    setScreenshots(prev => [newShot, ...prev]);
                    // toast.success(`New activity from ${newShot.user?.name}`); 
                }
            });
        }

        return () => {
            if (socket) socket.off('new-screenshot');
        };
    }, [filters.date]);

    const fetchInitialData = async () => {
        try {
            const employeesRes = await api.get('/employees');
            setEmployees(employeesRes.data);
            fetchScreenshots();
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const fetchScreenshots = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/screenshots', { params: filters });
            setScreenshots(data);
        } catch (error) {
            toast.error("Failed to fetch activity screenshots");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Activity Screenshots</h2>
                    <p className="text-sm text-slate-500">View employee screenshots and idle alerts</p>
                </div>
                <button
                    onClick={fetchScreenshots}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            name="userId"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all appearance-none"
                            value={filters.userId}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="date"
                            name="date"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all"
                            value={filters.date}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={fetchScreenshots}
                        className="w-full py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-100 rounded-3xl aspect-video animate-pulse" />
                    ))
                ) : screenshots.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <AlertCircle size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No activity found</h3>
                        <p className="text-slate-500">No screenshots recorded for the selected criteria.</p>
                    </div>
                ) : (
                    screenshots.map((shot) => (
                        <div key={shot._id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="relative aspect-video overflow-hidden bg-slate-100">
                                <img
                                    src={shot.imageUrl.startsWith('http') ? shot.imageUrl : `http://localhost:5001${shot.imageUrl}`}
                                    alt="Activity"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${shot.status === 'Idle'
                                        ? 'bg-amber-500 text-white border-amber-600'
                                        : 'bg-emerald-500 text-white border-emerald-600'
                                        }`}>
                                        {shot.status || 'Active'}
                                    </span>
                                    {shot.activityPercentage > 0 && (
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white border border-white/20">
                                            {shot.activityPercentage}% Activity
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => window.open(shot.imageUrl.startsWith('http') ? shot.imageUrl : `http://localhost:5001${shot.imageUrl}`, '_blank')}
                                        className="p-3 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-sm">
                                        {shot.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-900 truncate leading-none mb-1">{shot.user?.name || 'Unknown User'}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-full">
                                            {shot.activeApp || 'Operating System'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-slate-300" />
                                        <span>{new Date(shot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-slate-300" />
                                        <span>{new Date(shot.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminActivityMonitoring;
