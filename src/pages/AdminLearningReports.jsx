import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Calendar, Users, Search, Download, Filter,
    TrendingUp, Award, Brain, Target, AlertCircle,
    ChevronDown, Eye, FileText, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const AdminLearningReports = () => {
    const [employees, setEmployees] = useState([]);
    const [reports, setReports] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        employeeId: '',
        startDate: '',
        endDate: '',
        status: 'submitted'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const empRes = await api.get('/employees');
            setEmployees(empRes.data);

            // Default date range (last 7 days)
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 7);

            setFilters(prev => ({
                ...prev,
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            }));
        } catch (err) {
            toast.error('Failed to load initial data');
        }
    };

    const fetchReports = async () => {
        console.log('[DEBUG] Admin fetching reports with filters:', filters);
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await api.get(`/daily-updates/admin/reports?${query}`);
            setReports(data.reports || []);
            setAnalytics(data.analytics || null);
        } catch (err) {
            toast.error('Error loading reports');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ['Date', 'Employee', 'Work Done', 'Learning', 'Challenges', 'Rating', 'Completion %'];
        const csvData = reports.map(r => [
            new Date(r.date).toLocaleDateString(),
            r.employee?.name,
            r.newWork.replace(/,/g, ';'),
            r.learning.replace(/,/g, ';'),
            r.challenges.replace(/,/g, ';'),
            r.rating,
            r.completionPercentage
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="p-10 bg-white min-h-screen space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daily Learning Logs</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Organization performance insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-900/10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trend</span>
                    </div>
                    <p className="text-3xl font-black mb-1">{analytics?.avgRating || 0}/5</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Performance Rating</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                            <Brain size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Learning</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">{reports.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Updates Logged</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <Award size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consistency</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">{analytics?.topStreak || 0}d</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Highest Active Streak</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alerts</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">{analytics?.lowPerformers || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low Progress (Under 50%)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} /> Employee
                    </label>
                    <select
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 transition-all appearance-none"
                        value={filters.employeeId}
                        onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Start Date
                    </label>
                    <input
                        type="date"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 transition-all"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> End Date
                    </label>
                    <input
                        type="date"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-slate-900 transition-all"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={fetchReports}
                        className="flex-1 bg-slate-900 text-white rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <Search size={16} />
                        Filter
                    </button>
                    <button
                        onClick={() => setFilters({ employeeId: '', startDate: '', endDate: '', status: 'submitted' })}
                        className="bg-white border-2 border-slate-100 text-slate-400 p-3.5 rounded-2xl hover:text-slate-900 hover:border-slate-900 transition-all"
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Performance Trend</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics?.chartData || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} domain={[0, 5]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="rating" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a' }} />
                                <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Status Overview</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.statusData || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '700' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Update Logs</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reports.length} Logs Found</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Work & Learning</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rating</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progress</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin text-slate-200 mx-auto mb-4" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading reports...</p>
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <FileText className="text-slate-100 mx-auto mb-4" size={60} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No logs found for this period</p>
                                    </td>
                                </tr>
                            ) : reports.map((report) => (
                                <tr key={report._id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black">
                                                {report.employee?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{report.employee?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{report.employee?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-600">
                                            {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 max-w-md">
                                        <p className="text-sm font-bold text-slate-900 truncate mb-1">{report.newWork}</p>
                                        <p className="text-xs text-slate-400 font-bold italic truncate flex items-center gap-1">
                                            <Brain size={12} /> {report.learning}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-900 text-xs font-black">
                                            {['😫', '😐', '🙂', '😊', '🤩'][Math.max(0, report.rating - 1)]} {report.rating}/5
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`text-[10px] font-black ${report.completionPercentage === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                {report.completionPercentage}%
                                            </span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${report.completionPercentage > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${report.completionPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 group-hover:shadow-sm">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLearningReports;
