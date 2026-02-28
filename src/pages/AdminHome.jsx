import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Users, Clock, AlertCircle, TrendingUp, Activity, CheckCircle, XCircle, Cake } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const AdminHome = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeNow: 0,
        presentToday: 0,
        absentToday: 0,
        totalWorkingMinutes: 0,
        workingEmployees: 0,
        onlineEmployees: 0
    });
    const [employees, setEmployees] = useState([]);
    const [birthdays, setBirthdays] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [notebookStats, setNotebookStats] = useState({ total: 0, completed: 0 });
    const socketRef = useRef(null);

    const fetchDashboardData = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const [statsRes, employeesRes, tasksRes, birthdaysRes] = await Promise.all([
                api.get('/attendance/stats'),
                api.get('/activity/live-status'),
                api.get(`/tasks?date=${todayStr}`),
                api.get('/birthdays/upcoming?days=7')
            ]);

            const todayTasks = tasksRes.data;
            const completed = todayTasks.filter(t => t.status === 'Completed').length;
            setNotebookStats({ total: todayTasks.length, completed });

            const s = statsRes.data;
            setStats({
                totalEmployees: s.totalEmployees,
                onlineEmployees: s.onlineEmployees,
                workingEmployees: s.workingEmployees,
                todayPresent: s.todayPresent,
                todayAbsent: s.todayAbsent,
                totalWorkHours: s.totalWorkHours
            });

            setEmployees(employeesRes.data || []);
            setBirthdays(birthdaysRes.data || []);

            setChartData([
                { name: 'Mon', hours: 42 },
                { name: 'Tue', hours: 38 },
                { name: 'Wed', hours: 45 },
                { name: 'Thu', hours: 40 },
                { name: 'Fri', hours: 48 },
                { name: 'Today', hours: parseInt(s.totalWorkHours) || 0 },
            ]);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Socket for real-time updates
        const socket = getSocket();
        if (socket) {
            socket.on('statusUpdate', () => {
                fetchDashboardData(); // Refresh all stats on any status change
            });
            socketRef.current = socket;
        }

        const interval = setInterval(fetchDashboardData, 30000); // Polling fallback

        return () => {
            if (socketRef.current) socketRef.current.off('statusUpdate');
            clearInterval(interval);
        };
    }, []);

    const formatMinsToHHMM = (totalMinutes) => {
        if (!totalMinutes && totalMinutes !== 0) return '0h 0m';
        const h = Math.floor(totalMinutes / 60);
        const m = Math.floor(totalMinutes % 60);
        return `${h}h ${m}m`;
    };

    const StatCard = ({ title, value, icon: Icon, gradient, textColor = "text-white" }) => (
        <div className={`relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-700 bg-gradient-to-br ${gradient}`}></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-current/20`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-tight text-slate-400">
                <TrendingUp size={12} className="mr-1 text-emerald-500" />
                Updated just now
            </div>
        </div>
    );

    return (
        <div className="p-10 space-y-10 bg-white dark:bg-slate-900 transition-colors">
            {/* Modern Stats Grid */}
            {/* Modern Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Workforce"
                    value={stats.totalEmployees}
                    icon={Users}
                    gradient="from-blue-600 to-indigo-600"
                />
                <StatCard
                    title="Live Presence"
                    value={stats.onlineEmployees}
                    icon={Activity}
                    gradient="from-emerald-500 to-teal-500"
                />
                <StatCard
                    title="Present (Today)"
                    value={stats.todayPresent}
                    icon={CheckCircle}
                    gradient="from-violet-600 to-purple-600"
                />
                <StatCard
                    title="Total Work Hours"
                    value={stats.totalWorkHours || "00h 00m"}
                    icon={Clock}
                    gradient="from-rose-500 to-pink-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Activity Visualization */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col h-[450px]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Productivity Metrics</h3>
                                <p className="text-xs text-slate-400 font-medium">Cumulative working hours across the organization</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase">Weekly</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '24px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '15px'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#premiumGradient)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] text-white shadow-2xl">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">System Health</h4>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-slate-300">API Latency</span>
                                <span className="text-sm font-black text-emerald-400">24ms</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-8 overflow-hidden">
                                <div className="bg-emerald-400 h-full w-[95%]"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-300">Uptime</span>
                                <span className="text-sm font-black text-blue-400">99.9%</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100 flex flex-col justify-center text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-amber-500" size={32} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900">{stats.todayAbsent} Absent Today</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-2">Requires Review</p>
                        </div>

                        {/* Birthday Widget */}
                        <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Cake className="text-pink-500" size={20} />
                                    Birthdays
                                </h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next 7 Days</span>
                            </div>
                            <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {birthdays.length > 0 ? (
                                    birthdays.map(b => (
                                        <div key={b._id} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white text-xs font-black">
                                                {b.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate">{b.name}</p>
                                                <p className="text-[10px] text-pink-500 font-bold">{b.isToday ? '🎉 Today!' : b.daysLeft === 1 ? 'Tomorrow' : `In ${b.daysLeft} days`}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                                        <Cake size={24} className="opacity-20 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No upcoming</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/admin/birthdays')}
                                className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                View Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col h-[750px]">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Live Pulse</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Live
                        </div>
                    </div>
                    <div className="space-y-8 overflow-y-auto pr-4 custom-scrollbar flex-1 pb-4">
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <div key={emp._id} className="group flex gap-5 transform hover:-translate-x-1 transition-all duration-300 bg-slate-50/30 p-4 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white">
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-1 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                            {emp.profilePicture ? (
                                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${emp.profilePicture}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase rounded-xl">
                                                    {emp.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-lg shadow-sm ${emp.currentStatus === 'Working' ? 'bg-emerald-500' :
                                            emp.currentStatus === 'Online' ? 'bg-blue-500' :
                                                emp.currentStatus === 'Idle' ? 'bg-amber-400' :
                                                    'bg-slate-300'
                                            }`}></div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{emp.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${emp.currentStatus === 'Working' ? 'bg-emerald-50 text-emerald-600' :
                                                        emp.currentStatus === 'Idle' ? 'bg-amber-50 text-amber-600' :
                                                            emp.currentStatus === 'Offline' ? 'bg-rose-50 text-rose-500' :
                                                                'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {emp.currentStatus || 'Offline'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-tighter">{emp.formattedTotalHours} today</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${emp.productivityPercent > 70 ? 'text-emerald-500' : emp.productivityPercent > 40 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {emp.productivityPercent}%
                                                </p>
                                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Productivity</p>
                                            </div>
                                        </div>
                                        {/* Mini Productivity Bar */}
                                        <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${emp.productivityPercent > 70 ? 'bg-emerald-500' :
                                                    emp.productivityPercent > 40 ? 'bg-amber-500' : 'bg-slate-300'
                                                    }`}
                                                style={{ width: `${emp.productivityPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10 grayscale opacity-40">
                                <Activity size={48} className="mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest leading-loose">No dynamic activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
