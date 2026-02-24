import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, Search, RefreshCw, Calendar, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const formatMins = (minutes) => {
    if (!minutes && minutes !== 0) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
};

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAttendance = async () => {
        try {
            setRefreshing(true);
            const res = await api.get('/attendance');
            setAttendance(res.data || []);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const filteredAttendance = attendance.filter(record =>
        record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Real-time presence monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={fetchAttendance}
                        disabled={refreshing}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-black">
                            <tr>
                                <th className="px-8 py-5">Employee</th>
                                <th className="px-8 py-5">Check In</th>
                                <th className="px-8 py-5">Check Out</th>
                                <th className="px-8 py-5">Work Duration</th>
                                <th className="px-8 py-5">Break Time</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black">
                                                    {record.user?.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none">{record.user?.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{record.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (record.status === 'Working' || record.status === 'On Break' ? 'Active' : '---')}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-900">{record.formattedTotalHours || formatMins(record.totalMinutes)}</span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-600">
                                            {formatMins(record.breakMinutes || 0)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${record.status === 'Working' ? 'bg-emerald-50 text-emerald-600' :
                                                    record.status === 'On Break' ? 'bg-amber-50 text-amber-600' :
                                                        record.status === 'Completed' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-slate-100 text-slate-500'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-10 text-center text-slate-400 font-medium italic">
                                        No attendance records found for today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendance;
