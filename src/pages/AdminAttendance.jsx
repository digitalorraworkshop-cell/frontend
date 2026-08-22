import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, Search, RefreshCw, Calendar, User as UserIcon, Loader2, History, Save, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AttendanceHistoryModal from '../components/admin/AttendanceHistoryModal';
import ManageAttendanceRow from '../components/admin/ManageAttendanceRow';

const formatMins = (minutes) => {
    if (!minutes && minutes !== 0) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
};

const formatShortLocation = (lat, lon, address) => {
    if (address) {
        const parts = address.split(',').map(p => p.trim());
        const filtered = parts.filter(p => !/^\d{5,6}$/.test(p) && p.toLowerCase() !== 'india');
        return filtered.slice(0, 2).join(', ');
    }
    if (lat && lon) {
        return `${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)}`;
    }
    return '';
};

const AdminAttendance = () => {
    const [activeTab, setActiveTab] = useState('live'); // 'live' or 'manage'
    const [attendance, setAttendance] = useState([]);
    const [manageData, setManageData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

    const fetchByDate = async (date) => {
        try {
            setLoading(true);
            const res = await api.get(`/attendance/by-date?date=${date}`);
            setManageData(res.data || []);
        } catch (error) {
            toast.error("Failed to load records for " + date);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'live') {
            fetchAttendance();
        } else {
            fetchByDate(selectedDate);
        }
    }, [activeTab, selectedDate]);

    const handleUpdateRow = (userId, updatedAttendance) => {
        setManageData(prev => prev.map(item =>
            item.employee._id === userId
                ? { ...item, attendance: updatedAttendance }
                : item
        ));
    };

    const handleBulkSave = async () => {
        try {
            setSaving(true);
            const recordsToSave = manageData.map(item => ({
                userId: item.employee._id,
                ...item.attendance
            }));

            await api.post('/attendance/bulk-update', {
                date: selectedDate,
                records: recordsToSave
            });

            toast.success("Attendance saved successfully!");
            fetchByDate(selectedDate);
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const filteredAttendance = attendance.filter(record =>
        record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredManageData = manageData.filter(item =>
        item.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance System</h1>
                    <div className="flex items-center gap-1 mt-2">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            Live Monitor
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manage' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                            Manage Attendance
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === 'manage' && (
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
                            <Calendar size={16} className="ml-2 text-slate-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border-none bg-transparent text-sm font-black text-slate-700 focus:ring-0 p-0 pr-2"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all w-48 lg:w-64"
                        />
                    </div>
                    {activeTab === 'live' ? (
                        <button
                            onClick={fetchAttendance}
                            disabled={refreshing}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    ) : (
                        <button
                            onClick={handleBulkSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-sm font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save All Changes
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
                </div>
            ) : activeTab === 'live' ? (
                /* LIVE ATTENDANCE TAB */
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <tr>
                                    <th className="px-8 py-6">Employee</th>
                                    <th className="px-8 py-6">Check In</th>
                                    <th className="px-8 py-6">Check Out</th>
                                    <th className="px-8 py-6">Work Duration</th>
                                    <th className="px-8 py-6">Break Time</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-center">Location</th>
                                    <th className="px-8 py-6 text-center">History</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAttendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black">
                                                    {record.user?.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none">{record.user?.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{record.user?.department || 'Employee'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600 font-mono">
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600 font-mono">
                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (record.status === 'Working' || record.status === 'On Break' ? 'Active' : '---')}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-900">{record.formattedTotalHours || formatMins(record.totalMinutes)}</span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-400 text-xs">
                                            {formatMins(record.breakMinutes || 0)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${record.status === 'Working' ? 'bg-emerald-50 text-emerald-600' :
                                                record.status === 'On Break' ? 'bg-amber-50 text-amber-600' :
                                                    record.status === 'Late' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-slate-100 text-slate-500'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Check In Location */}
                                                    {(record.checkInLatitude || record.latitude) ? (
                                                        <div className="relative group/loc inline-block">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${record.checkInLatitude || record.latitude},${record.checkInLongitude || record.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl transition-all hover:bg-emerald-100 flex items-center justify-center w-8.5 h-8.5"
                                                                title="View Check-in Location"
                                                            >
                                                                <MapPin size={15} />
                                                            </a>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/loc:opacity-100 transition-opacity z-50 text-center font-medium leading-normal">
                                                                <span className="font-black text-emerald-400 block mb-0.5">CHECK-IN LOCATION:</span>
                                                                {record.checkInLocation || `Coordinates: ${(record.checkInLatitude || record.latitude).toFixed(4)}, ${(record.checkInLongitude || record.longitude).toFixed(4)}`}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-200" title="Check-in location not captured"><MapPin size={15} /></span>
                                                    )}

                                                    {/* Check Out Location */}
                                                    {record.checkOutLatitude ? (
                                                        <div className="relative group/loc inline-block">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${record.checkOutLatitude},${record.checkOutLongitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-rose-50 text-rose-600 rounded-xl transition-all hover:bg-rose-100 flex items-center justify-center w-8.5 h-8.5"
                                                                title="View Check-out Location"
                                                            >
                                                                <MapPin size={15} className="rotate-180" />
                                                            </a>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/loc:opacity-100 transition-opacity z-50 text-center font-medium leading-normal">
                                                                <span className="font-black text-rose-400 block mb-0.5">CHECK-OUT LOCATION:</span>
                                                                {record.checkOutLocation || `Coordinates: ${record.checkOutLatitude.toFixed(4)}, ${record.checkOutLongitude.toFixed(4)}`}
                                                            </div>
                                                        </div>
                                                    ) : record.checkOutTime ? (
                                                        <span className="text-slate-200" title="Check-out location not captured"><MapPin size={15} className="rotate-180" /></span>
                                                    ) : null}
                                                </div>

                                                {/* Short Address Display */}
                                                <div className="text-[10px] text-slate-400 font-semibold max-w-[150px] truncate text-center" title={record.checkInLocation || ""}>
                                                    {formatShortLocation(record.checkInLatitude || record.latitude, record.checkInLongitude || record.longitude, record.checkInLocation) || '---'}
                                                    {record.checkOutLatitude && (
                                                        <span className="block text-[8px] text-slate-300 font-bold uppercase mt-0.5">
                                                            Out: {formatShortLocation(record.checkOutLatitude, record.checkOutLongitude, record.checkOutLocation)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button
                                                onClick={() => { setSelectedEmployee(record.user); setIsHistoryOpen(true); }}
                                                className="p-2.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-all text-slate-400"
                                            >
                                                <History size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* MANAGE ATTENDANCE TAB */
                <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <tr>
                                    <th className="px-8 py-6">Employee</th>
                                    <th className="px-6 py-6">Check In</th>
                                    <th className="px-6 py-6">Check Out</th>
                                    <th className="px-6 py-6">Break (Mins)</th>
                                    <th className="px-6 py-6">Work Hours</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-6 py-6 w-48">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredManageData.map((item) => (
                                    <ManageAttendanceRow
                                        key={item.employee._id}
                                        record={item}
                                        onUpdate={handleUpdateRow}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AttendanceHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
};

export default AdminAttendance;
