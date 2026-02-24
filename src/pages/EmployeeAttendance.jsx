import React, { useState, useEffect, useContext } from 'react';
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const EmployeeAttendance = () => {
    const { user } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get(`/attendance/${user._id}`);
            setAttendance(data);
        } catch (error) {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '---';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatMins = (minutes) => {
        if (!minutes && minutes !== 0) return '0h 0m';
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Attendance Journal</h2>
                    <p className="text-sm text-slate-500">View your daily check-in and check-out history</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={16} />
                    Export Log
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Check Out</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Total Hours</th>
                                <th className="px-8 py-5 text-xs text-right font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400">Loading records...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400">No attendance records found</td></tr>
                            ) : (
                                attendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                                                    <Calendar size={18} />
                                                </div>
                                                <span className="font-bold text-slate-900">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-sm text-slate-600">
                                            {formatTime(record.checkInTime)}
                                        </td>
                                        <td className="px-6 py-6 font-mono text-sm text-slate-600">
                                            {formatTime(record.checkOutTime)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="font-bold text-slate-800">{record.formattedTotalHours || formatMins(record.totalMinutes)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 justify-center w-fit ml-auto">
                                                <CheckCircle2 size={12} />
                                                Present
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAttendance;
