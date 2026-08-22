import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { Users, Clock, AlertCircle, TrendingUp, Activity, RefreshCw, Video, Plus, Calendar, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ScheduleMeetingModal from '../components/meetings/ScheduleMeetingModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        workingEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        lateEmployees: 0,
        avgWorkHours: '0h 0m'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const socketRef = useRef(null);

    const [chartData, setChartData] = useState([
        { name: 'Mon', hours: 40 },
        { name: 'Tue', hours: 35 },
        { name: 'Wed', hours: 42 },
        { name: 'Thu', hours: 38 },
        { name: 'Fri', hours: 45 },
        { name: 'Sat', hours: 10 },
        { name: 'Sun', hours: 5 },
    ]);

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const fetchDashboardData = async () => {
        try {
            // Fetch stats, recent activity, live status, and upcoming meetings in parallel
            const [statsRes, activityRes, liveRes, meetingsRes] = await Promise.all([
                api.get('/attendance/stats').catch(() => ({ data: {} })),
                api.get('/activity/recent').catch(() => ({ data: [] })),
                api.get('/activity/live-status').catch(() => ({ data: [] })),
                api.get('/meetings/today-timeline').catch(() => ({ data: [] }))
            ]);

            const attendanceStats = statsRes.data || {};
            setStats({
                totalEmployees: attendanceStats.totalEmployees || 0,
                workingEmployees: attendanceStats.workingEmployees || 0,
                todayPresent: attendanceStats.todayPresent || 0,
                todayAbsent: attendanceStats.todayAbsent || 0,
                lateEmployees: attendanceStats.lateEmployees || 0,
                avgWorkHours: attendanceStats.avgWorkHours || attendanceStats.totalWorkHours || '7.5h'
            });

            // Process Activity Logs
            const logs = Array.isArray(activityRes.data) ? activityRes.data : [];
            const liveEmployees = Array.isArray(liveRes.data) ? liveRes.data : [];
            setUpcomingMeetings(Array.isArray(meetingsRes.data) ? meetingsRes.data.slice(0, 4) : []);

            let formattedList = [];

            if (logs.length > 0) {
                formattedList = logs.map(l => ({
                    id: l._id || Math.random(),
                    userName: l.user?.name || 'Employee',
                    profilePicture: l.user?.profilePicture || null,
                    status: l.status || 'Active',
                    windowTitle: l.activeWindowTitle || '',
                    time: formatTimeAgo(l.createdAt || l.startTime)
                }));
            } else if (liveEmployees.length > 0) {
                formattedList = liveEmployees.map(emp => ({
                    id: emp._id || Math.random(),
                    userName: emp.name || 'Employee',
                    profilePicture: emp.profilePicture || null,
                    status: emp.currentStatus || (emp.isOnline ? 'Online' : 'Offline'),
                    windowTitle: emp.role || 'Active Staff',
                    time: 'Live now'
                }));
            }

            setRecentActivity(formattedList.slice(0, 10));
            setLoadingActivity(false);

            const todayWorkNum = parseInt(attendanceStats.totalWorkHours) || 45;
            setChartData([
                { name: 'Mon', hours: 42 },
                { name: 'Tue', hours: 38 },
                { name: 'Wed', hours: 45 },
                { name: 'Thu', hours: 40 },
                { name: 'Fri', hours: 48 },
                { name: 'Today', hours: todayWorkNum }
            ]);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            setLoadingActivity(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const socket = getSocket();
        if (socket) {
            socketRef.current = socket;

            const handleStatusUpdate = (data) => {
                fetchDashboardData();
                if (data && (data.userName || data.name || data.userId)) {
                    const newLog = {
                        id: Date.now(),
                        userName: data.userName || data.name || 'Employee',
                        profilePicture: data.profilePicture || null,
                        status: data.status || 'Active',
                        windowTitle: data.activeWindowTitle || 'Status update',
                        time: 'Just now'
                    };
                    setRecentActivity(prev => [newLog, ...prev.filter(p => p.id !== newLog.id)].slice(0, 10));
                }
            };

            socket.on('statusUpdate', handleStatusUpdate);
            socket.on('new-screenshot', handleStatusUpdate);
            socket.on('newMeeting', fetchDashboardData);

            return () => {
                socket.off('statusUpdate', handleStatusUpdate);
                socket.off('new-screenshot', handleStatusUpdate);
                socket.off('newMeeting', fetchDashboardData);
            };
        }

        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className="text-emerald-600 font-bold flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {trend}
                    </span>
                    <span className="text-slate-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Top Bar with Schedule Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time personnel metrics, live attendance & video meetings</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
                    >
                        <Video size={16} /> + Schedule Meeting
                    </button>
                    <button
                        onClick={fetchDashboardData}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                        title="Refresh Stats"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Present"
                    value={stats.todayPresent}
                    icon={Users}
                    color="bg-emerald-500 shadow-emerald-500/40"
                    trend="+12%"
                />
                <StatCard
                    title="Total Absent"
                    value={stats.todayAbsent}
                    icon={Activity}
                    color="bg-rose-500 shadow-rose-500/40"
                />
                <StatCard
                    title="Late Employees"
                    value={stats.lateEmployees}
                    icon={AlertCircle}
                    color="bg-amber-500 shadow-amber-500/40"
                />
                <StatCard
                    title="Avg. Work Hours"
                    value={stats.avgWorkHours}
                    icon={Clock}
                    color="bg-indigo-500 shadow-indigo-500/40"
                />
            </div>

            {/* Upcoming Meetings & Google Meet Widget */}
            {upcomingMeetings.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                                <Video size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Today's Scheduled Meetings</h3>
                                <p className="text-xs text-slate-500">Google Meet & Video Conferences for Today</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/admin/meetings')}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                            View All Meetings <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {upcomingMeetings.map((m) => (
                            <div key={m._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-300 transition-all flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center justify-between text-[10px] font-black text-brand-600 uppercase mb-1">
                                        <span>{m.startTime} - {m.endTime}</span>
                                        <span className="bg-brand-50 px-2 py-0.5 rounded text-brand-700 border border-brand-100">{m.meetingType}</span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 truncate">{m.title}</h4>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                                        {m.relatedClient ? `Client: ${m.relatedClient}` : `Host: ${m.organizer?.name || 'Admin'}`}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                                    {m.meetingLink ? (
                                        <a
                                            href={m.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm"
                                        >
                                            <Video size={12} /> JOIN MEET
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 font-bold">Physical Room</span>
                                    )}

                                    <button
                                        onClick={() => navigate('/admin/meetings')}
                                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900"
                                    >
                                        Details →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Activity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-96">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Weekly Activity</h3>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                            Cumulative Output
                        </span>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorHours)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-96">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                        <button 
                            onClick={fetchDashboardData}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Refresh Now"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {loadingActivity ? (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                                Loading activity feed...
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-semibold">
                                No recent activity logged today
                            </div>
                        ) : (
                            recentActivity.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-brand-100">
                                                {log.profilePicture ? (
                                                    <img src={`${log.profilePicture?.startsWith('http') ? log.profilePicture : import.meta.env.VITE_API_URL + log.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    log.userName?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${
                                                log.status === 'Working' ? 'bg-emerald-500' :
                                                log.status === 'Online' ? 'bg-blue-500' :
                                                log.status === 'On Break' || log.status === 'Idle' ? 'bg-amber-500' :
                                                'bg-slate-300'
                                            }`}></span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{log.userName}</p>
                                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                                                {log.windowTitle || log.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider block ${
                                            log.status === 'Working' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            log.status === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            log.status === 'On Break' || log.status === 'Idle' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                            {log.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">{log.time}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            <ScheduleMeetingModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onMeetingScheduled={fetchDashboardData}
            />
        </div>
    );
};

export default AdminDashboard;
