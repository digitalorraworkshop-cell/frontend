import React, { useState, useEffect } from 'react';
import {
    Gift, Search, Calendar, Download, Filter,
    Users, TrendingUp, Star, FileText
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const getDobDisplay = (dob) => {
    const d = new Date(dob);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getBirthdayDisplay = (dob) => {
    const d = new Date(dob);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

const PERIODS = [
    { id: 'week', label: 'This Week', icon: '📅' },
    { id: 'month', label: 'This Month', icon: '🗓️' },
    { id: 'custom', label: 'Custom Range', icon: '🔍' },
];

const AdminBirthdays = () => {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const todayCount = birthdays.filter(b => b.isToday).length;
    const weekCount = birthdays.filter(b => b.daysLeft <= 7).length;

    const fetchBirthdays = async () => {
        setLoading(true);
        try {
            let url = `/birthdays/admin?period=${period}&search=${encodeURIComponent(search)}`;
            if (period === 'custom' && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const { data } = await api.get(url);
            setBirthdays(data);
        } catch (err) {
            toast.error('Failed to load birthday data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBirthdays();
    }, [period, search, startDate, endDate]);

    // CSV export
    const exportCSV = () => {
        const headers = ['Name', 'Position', 'Department', 'Date of Birth', 'Birthday', 'Age', 'Days Left', 'Status'];
        const rows = birthdays.map(b => [
            b.name,
            b.position || '',
            b.department || '',
            getDobDisplay(b.dateOfBirth),
            getBirthdayDisplay(b.dateOfBirth),
            b.age,
            b.daysLeft === 0 ? 'Today' : `${b.daysLeft} days`,
            b.isToday ? 'Today' : 'Upcoming',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `birthdays_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported!');
    };

    // PDF / Print
    const exportPDF = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Page Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Gift size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Employee Birthdays</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Birthday Tracker & Reports</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                        <button
                            onClick={exportPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all print:hidden"
                        >
                            <FileText size={16} /> PDF / Print
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8 print:py-4">

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {[
                        { label: 'Birthdays Today', value: todayCount, icon: '✨', color: 'from-violet-500 to-pink-500', shadow: 'shadow-violet-500/20' },
                        { label: 'This Week', value: weekCount, icon: '📅', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                        { label: 'In This View', value: birthdays.length, icon: '👥', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                    ].map(s => (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-[28px] p-6 shadow-xl ${s.shadow}`}>
                            <div className="text-3xl mb-1">{s.icon}</div>
                            <p className="text-4xl font-black">{s.value}</p>
                            <p className="text-white/70 text-xs font-black uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center print:hidden">
                    {/* Period tabs */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                        {PERIODS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${period === p.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {p.icon} {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom date range */}
                    {period === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-violet-300" />
                            <span className="text-slate-400 font-bold">to</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-violet-300" />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative ml-auto">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-violet-300 transition-all w-56"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : birthdays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="text-7xl">✨</div>
                        <h3 className="text-xl font-black text-slate-600">No birthdays found</h3>
                        <p className="text-slate-400 font-medium">Try changing the filter or date range</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Birthday</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {birthdays.map((emp, idx) => (
                                        <tr
                                            key={emp._id}
                                            className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${emp.isToday ? 'bg-violet-50/40' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {emp.profilePicture ? (
                                                        <img src={`${import.meta.env.VITE_API_URL}${emp.profilePicture}`} alt={emp.name} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-black">
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm">{emp.name}</p>
                                                        <p className="text-slate-400 text-xs">{emp.position || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{emp.department || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{getDobDisplay(emp.dateOfBirth)}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900">{getBirthdayDisplay(emp.dateOfBirth)}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-700">
                                                    {emp.age} yrs
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {emp.isToday ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full text-xs font-black w-fit shadow-sm">
                                                        Today!
                                                    </span>
                                                ) : (
                                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black w-fit ${emp.daysLeft <= 3
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                        : emp.daysLeft <= 7
                                                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        <Calendar size={11} /> {emp.daysLeft} days
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Print styles */}
                <style>{`
                    @media print {
                        header button, .print\\:hidden { display: none !important; }
                        body { background: white !important; }
                    }
                `}</style>
            </main>
        </div>
    );
};

export default AdminBirthdays;
