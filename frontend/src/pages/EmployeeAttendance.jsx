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
    const [summary, setSummary] = useState({
        totalWorkingDays: 0,
        lateDays: 0,
        halfDays: 0,
        totalHoursWorked: '0h 0m',
        totalAbsents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const [attendanceRes, summaryRes] = await Promise.all([
                api.get(`/attendance/history?userId=${user._id}`),
                api.get('/attendance/summary')
            ]);
            setAttendance(attendanceRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            toast.error("Failed to fetch attendance data");
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Working Days', value: summary.totalWorkingDays, icon: Calendar, color: 'text-brand-600', bg: 'bg-brand-50' },
                    { label: 'Hours Worked', value: summary.totalHoursWorked, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Late Days', value: summary.lateDays, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Absents', value: summary.totalAbsents, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Log</h2>
                    <p className="text-sm text-slate-400 font-medium italic mt-1">Detailed history of your check-ins</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} />
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
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 justify-center w-fit ml-auto ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                record.status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    record.status === 'Half Day' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-slate-50 text-slate-400'
                                                } border`}>
                                                {record.status === 'Present' && <CheckCircle2 size={12} />}
                                                {record.status === 'Late' && <Clock size={12} />}
                                                {record.status === 'Half Day' && <XCircle size={12} />}
                                                {record.status}
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
