import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Clock, CheckCircle2, Timer, AlertCircle, Calendar, Briefcase, Zap, Star, TrendingUp } from 'lucide-react';
import TrackWidget from '../components/employee/TrackWidget';
import api from '../utils/api';

const EmployeeHome = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState({
        todayHours: "00:00",
        activeMinutes: 0,
        attendancePercent: 0,
        pendingTasks: 0,
        productivityPercent: 0
    });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        if (!authLoading && user?._id) {
            fetchStats();
            const interval = setInterval(fetchStats, 30000);
            return () => {
                clearInterval(timer);
                clearInterval(interval);
            };
        }

        return () => clearInterval(timer);
    }, [user, authLoading]);

    const fetchStats = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                api.get(`/activity/stats/${user._id}`),
                api.get('/tasks')
            ]);

            const tasks = tasksRes.data || [];
            const pending = tasks.filter(t => t.status !== 'Completed').length;

            setStats({
                todayHours: statsRes.data.totalHours || "00:00",
                activeMinutes: statsRes.data.activeMinutes || 0,
                attendancePercent: statsRes.data.attendancePercent || 0,
                productivityPercent: statsRes.data.productivityPercent || 0,
                pendingTasks: pending
            });
        } catch (error) {
            console.error("Stats fetch error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 p-8 space-y-10 animate-in fade-in duration-700">
            {/* Professional Welcome Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Welcome, <span className="text-brand-600">{user?.name?.split(' ')[0]}</span>.
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Calendar size={14} className="text-brand-500" />
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <p className="text-brand-600 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                            <Zap size={14} />
                            Today's Progress
                        </p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-[30px] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Standard Time</p>
                        <p className="text-3xl font-black text-slate-900 tabular-nums">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left: Tracker & Primary Stats */}
                <div className="lg:col-span-4 space-y-10">
                    <TrackWidget />

                    {/* Performance Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <Star className="text-amber-400 mb-4 animate-pulse" size={32} />
                            <h3 className="text-xl font-black tracking-tight mb-2">Daily Performance</h3>
                            <p className="text-indigo-100 text-sm font-medium mb-6 leading-relaxed">Your current productivity stands at {stats.productivityPercent}%. Keep focused to reach your goals!</p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                                    <span>Productivity</span>
                                    <span>{stats.productivityPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                        style={{ width: `${stats.productivityPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Task Flow & Analytics */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Horizontal Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
                                <Timer className="text-brand-600" size={24} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Worked</p>
                            <h4 className="text-3xl font-black text-slate-900 tabular-nums">{stats.todayHours}</h4>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                                <CheckCircle2 className="text-emerald-600" size={24} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                            <h4 className="text-3xl font-black text-slate-900 tabular-nums">{stats.attendancePercent}%</h4>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                                <TrendingUp className="text-indigo-600" size={24} />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Productivity</p>
                            <h4 className="text-3xl font-black text-slate-900 tabular-nums">{stats.productivityPercent}%</h4>
                        </div>
                    </div>

                    {/* Work Journal Simulation (Visual placeholder) */}
                    <div className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-200/30 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Timeline Journal</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Today's Activity Flow</p>
                            </div>
                            <div className="px-4 py-2 rounded-2xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                                Detailed View
                            </div>
                        </div>

                        <div className="space-y-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            <div className="relative pl-12">
                                <div className="absolute left-[23px] top-2 bottom-0 w-px bg-slate-100"></div>
                                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-emerald-50 border-4 border-white flex items-center justify-center shadow-sm">
                                    <CheckCircle2 className="text-emerald-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Task Completed: System Refactor</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">10:45 AM • Production Sync</p>
                                </div>
                            </div>

                            <div className="relative pl-12">
                                <div className="absolute left-[23px] top-2 bottom-0 w-px bg-slate-100"></div>
                                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-brand-50 border-4 border-white flex items-center justify-center shadow-sm">
                                    <Zap className="text-brand-500" size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Started Deep Work Session</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">09:15 AM • Sprint 4</p>
                                </div>
                            </div>

                            <div className="relative pl-12 opacity-50">
                                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl bg-slate-50 border-4 border-white flex items-center justify-center shadow-sm">
                                    <Clock className="text-slate-300" size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Checked In</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">09:00 AM • Main Office</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHome;
