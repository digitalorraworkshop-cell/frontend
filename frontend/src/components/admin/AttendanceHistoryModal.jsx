import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { X, Calendar, Search, Download, Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

const AttendanceHistoryModal = ({ isOpen, onClose, employee }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString()
    });

    useEffect(() => {
        if (isOpen && employee?._id) {
            fetchHistory();
        }
    }, [isOpen, employee, filters]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/attendance/history`, {
                params: {
                    userId: employee._id,
                    month: filters.month,
                    year: filters.year
                }
            });
            setHistory(data);
        } catch (error) {
            toast.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatMins = (minutes) => {
        if (!minutes && minutes !== 0) return '0h 0m';
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">Attendance History</h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{employee?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Month</label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20"
                            >
                                {[2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No records found for this period</td>
                                    </tr>
                                ) : (
                                    history.map((record) => (
                                        <tr key={record._id} className="hover:bg-white transition-colors">
                                            <td className="px-6 py-4 text-sm font-black text-slate-900">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900">
                                                {record.formattedTotalHours || formatMins(record.totalMinutes)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-600' :
                                                        record.status === 'Late' ? 'bg-amber-100 text-amber-600' :
                                                            record.status === 'Half Day' ? 'bg-rose-100 text-rose-600' :
                                                                'bg-slate-200 text-slate-600'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Check In Location */}
                                                        {(record.checkInLatitude || record.latitude) ? (
                                                            <div className="relative group/modal-loc inline-block">
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${record.checkInLatitude || record.latitude},${record.checkInLongitude || record.longitude}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100/50 w-8 h-8"
                                                                    title="View Check-in Location"
                                                                >
                                                                    <MapPin size={13} />
                                                                </a>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/modal-loc:opacity-100 transition-opacity z-50 text-center font-medium leading-normal">
                                                                    <span className="font-black text-emerald-400 block mb-0.5">CHECK-IN LOCATION:</span>
                                                                    {record.checkInLocation || `Coordinates: ${(record.checkInLatitude || record.latitude).toFixed(4)}, ${(record.checkInLongitude || record.longitude).toFixed(4)}`}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-200" title="Check-in location not captured"><MapPin size={13} /></span>
                                                        )}

                                                        {/* Check Out Location */}
                                                        {record.checkOutLatitude ? (
                                                            <div className="relative group/modal-checkout-loc inline-block">
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${record.checkOutLatitude},${record.checkOutLongitude}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all shadow-sm border border-rose-100/50 w-8 h-8"
                                                                    title="View Check-out Location"
                                                                >
                                                                    <MapPin size={13} className="rotate-180" />
                                                                </a>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/modal-checkout-loc:opacity-100 transition-opacity z-50 text-center font-medium leading-normal">
                                                                    <span className="font-black text-rose-400 block mb-0.5">CHECK-OUT LOCATION:</span>
                                                                    {record.checkOutLocation || `Coordinates: ${record.checkOutLatitude.toFixed(4)}, ${record.checkOutLongitude.toFixed(4)}`}
                                                                </div>
                                                            </div>
                                                        ) : record.checkOutTime ? (
                                                            <span className="text-slate-200" title="Check-out location not captured"><MapPin size={13} className="rotate-180" /></span>
                                                        ) : null}
                                                    </div>

                                                    {/* Short Address Display */}
                                                    <div className="text-[10px] text-slate-400 font-semibold max-w-[130px] truncate text-center" title={record.checkInLocation || ""}>
                                                        {formatShortLocation(record.checkInLatitude || record.latitude, record.checkInLongitude || record.longitude, record.checkInLocation) || '---'}
                                                        {record.checkOutLatitude && (
                                                            <span className="block text-[8px] text-slate-300 font-bold uppercase mt-0.5">
                                                                Out: {formatShortLocation(record.checkOutLatitude, record.checkOutLongitude, record.checkOutLocation)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all">
                        <Download size={18} />
                        Export Period
                    </button>
                    <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistoryModal;
