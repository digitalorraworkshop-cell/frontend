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
        onlineEmployees: 0,
        workingEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        totalWorkHours: '0h 0m'
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
                totalEmployees: s.totalEmployees || 0,
                onlineEmployees: s.onlineEmployees || 0,
                workingEmployees: s.workingEmployees || 0,
                todayPresent: s.todayPresent || 0,
                todayAbsent: s.todayAbsent || 0,
                totalWorkHours: s.totalWorkHours || '0h 0m'
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

    const StatCard = ({ title, value, icon: Icon, gradient }) => (
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-[32px] premium-shadow border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 bg-gradient-to-br ${gradient}`}></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-current/20 transform group-hover:rotate-6 transition-transform`}>
                    <Icon size={22} className="text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Updated Live
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
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
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] premium-shadow border border-slate-100 dark:border-slate-700 flex flex-col h-[450px]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Productivity Metrics</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Global performance tracking</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">Weekly</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0e93e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0e93e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ stroke: '#0e93e9', strokeWidth: 2 }}
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
                                        stroke="#0e93e9"
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
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-500/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 relative z-10">System Integrity</h4>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-sm font-bold text-slate-300">API Health</span>
                                <span className="text-sm font-black text-emerald-400 font-mono">24ms</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-8 overflow-hidden relative z-10">
                                <div className="bg-emerald-400 h-full w-[95%] shadow-[0_0_10px_#34d399]"></div>
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-sm font-bold text-slate-300">Live Uptime</span>
                                <span className="text-sm font-black text-brand-400 font-mono">99.9%</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] premium-shadow border border-slate-100 dark:border-slate-700 flex flex-col justify-center text-center">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-rose-500" size={32} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.todayAbsent} Absent</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Requires Review</p>
                        </div>

                        {/* Birthday Widget */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] premium-shadow border border-slate-100 dark:border-slate-700 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Cake className="text-pink-500" size={20} />
                                    Celebrations
                                </h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next 7 Days</span>
                            </div>
                            <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {birthdays.length > 0 ? (
                                    birthdays.map(b => (
                                        <div key={b._id} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white text-sm font-black shadow-sm">
                                                {b.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{b.name}</p>
                                                <p className="text-[10px] text-pink-500 font-bold uppercase tracking-tighter">{b.isToday ? '🎉 Today!' : b.daysLeft === 1 ? 'Tomorrow' : `In ${b.daysLeft} days`}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                                        <Cake size={24} className="opacity-20 mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">All caught up</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/admin/birthdays')}
                                className="mt-6 w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-slate-600 transition-all shadow-lg"
                            >
                                Open Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Activity Feed */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] premium-shadow border border-slate-100 dark:border-slate-700 flex flex-col h-[750px]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Real-time Pulse</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live updates from the field</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-100 dark:border-emerald-500/20 shadow-sm animate-pulse">
                            Live
                        </div>
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1 pb-4 px-1">
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <div key={emp._id} className="group flex gap-5 p-5 rounded-[32px] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none">
                                    <div className="relative shrink-0">
                                        <div className="w-16 h-16 rounded-[20px] bg-slate-50 dark:bg-slate-900 p-1 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 ring-4 ring-white dark:ring-slate-800 shadow-sm transition-transform group-hover:scale-105">
                                            {emp.profilePicture ? (
                                                <img src={`${import.meta.env.VITE_API_URL}${emp.profilePicture}`} alt="" className="w-full h-full object-cover rounded-[15px]" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xl uppercase rounded-[15px]">
                                                    {emp.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-[5px] border-white dark:border-slate-800 rounded-xl shadow-md ${emp.currentStatus === 'Working' ? 'bg-emerald-500' :
                                            emp.currentStatus === 'Online' ? 'bg-blue-500' :
                                                emp.currentStatus === 'Idle' ? 'bg-amber-400' :
                                                    'bg-slate-300'
                                            }`}></div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight mb-1">{emp.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${emp.currentStatus === 'Working' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                        emp.currentStatus === 'Idle' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            emp.currentStatus === 'Offline' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' :
                                                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                                        }`}>
                                                        {emp.currentStatus || 'Offline'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{emp.formattedTotalHours} Worked</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-base font-black tracking-tight ${emp.productivityPercent > 70 ? 'text-emerald-500' : emp.productivityPercent > 40 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {emp.productivityPercent}%
                                                </p>
                                                <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Efficiency</p>
                                            </div>
                                        </div>
                                        {/* Mini Efficiency Bar */}
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden shadow-inner">
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
