import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Sidebar from '../common/Sidebar';
import { initSocket, disconnectSocket } from '../utils/socket';
import { Users, Clock, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeNow: 0,
        pendingLeaves: 0,
        avgWorkHours: 7.5
    });
    const [recentActivity, setRecentActivity] = useState([]);

    // Mock data for the chart
    const data = [
        { name: 'Mon', hours: 40 },
        { name: 'Tue', hours: 35 },
        { name: 'Wed', hours: 42 },
        { name: 'Thu', hours: 38 },
        { name: 'Fri', hours: 45 },
        { name: 'Sat', hours: 10 },
        { name: 'Sun', hours: 5 },
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data: employees } = await api.get('/employees');
                const activeCount = employees.filter(e => e.currentStatus !== 'Offline').length;

                setStats(prev => ({
                    ...prev,
                    totalEmployees: employees.length,
                    activeNow: activeCount
                }));

                // Fetch initial activity logs for the feed
                // const { data: logs } = await api.get('/activity/recent'); // If exists
                // setRecentActivity(logs);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchInitialData();

        // Use Global Socket
        const socket = getSocket();
        if (socket) {
            const handleUpdate = (data) => {
                console.log('[AdminDashboard] Received live update:', data);
                // Refresh counts
                fetchInitialData();

                // Add to feed
                const newLog = {
                    id: Date.now(),
                    user: data.userId,
                    status: data.status,
                    time: 'Just now'
                };
                setRecentActivity(prev => [newLog, ...prev].slice(0, 10));
            };

            socket.on('statusUpdate', handleUpdate);

            return () => {
                socket.off('statusUpdate', handleUpdate);
            };
        }
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
                    <span className="text-green-500 font-medium flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {trend}
                    </span>
                    <span className="text-slate-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">Dashboard Overview</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                            <Activity size={20} />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs">
                            AD
                        </div>
                    </div>
                </header>

                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Employees"
                            value={stats.totalEmployees}
                            icon={Users}
                            color="bg-blue-500 shadow-blue-500/40"
                            trend="+12%"
                        />
                        <StatCard
                            title="Active Now"
                            value={stats.activeNow}
                            icon={Activity}
                            color="bg-emerald-500 shadow-emerald-500/40"
                        />
                        <StatCard
                            title="Pending Leaves"
                            value={stats.pendingLeaves}
                            icon={AlertCircle}
                            color="bg-amber-500 shadow-amber-500/40"
                        />
                        <StatCard
                            title="Avg. Work Hours"
                            value={`${stats.avgWorkHours}h`}
                            icon={Clock}
                            color="bg-indigo-500 shadow-indigo-500/40"
                            trend="+5%"
                        />
                    </div>

                    {/* Charts & Activity Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-96">
                        {/* Weekly Activity Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Activity</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
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
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
                            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-10">Waiting for live updates...</p>
                                ) : (
                                    recentActivity.map((log) => (
                                        <div key={log.id} className="flex gap-4 animate-in slide-in-from-right duration-300">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                                                    <Activity size={18} className="text-brand-500" />
                                                </div>
                                                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${log.status === 'Working' ? 'bg-emerald-500' :
                                                    log.status === 'Online' ? 'bg-blue-500' :
                                                        'bg-slate-300'
                                                    }`}></span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">Status Changed</p>
                                                <p className="text-xs text-slate-500 mt-0.5">User transition to {log.status}</p>
                                                <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
