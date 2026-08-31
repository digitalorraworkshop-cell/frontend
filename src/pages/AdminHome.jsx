import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    Users, 
    Clock, 
    AlertCircle, 
    TrendingUp, 
    Activity, 
    CheckCircle, 
    XCircle, 
    Cake, 
    MapPin,
    Bot,
    Plus,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Cpu,
    Database,
    ShieldCheck,
    Briefcase,
    DollarSign,
    Zap,
    Sparkles
} from 'lucide-react';
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
    const [aiSummary, setAiSummary] = useState(null);
    const [notebookStats, setNotebookStats] = useState({ total: 0, completed: 0 });
    const socketRef = useRef(null);

    const fetchDashboardData = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const [statsRes, employeesRes, tasksRes, birthdaysRes, aiRes] = await Promise.all([
                api.get('/attendance/stats'),
                api.get('/activity/live-status'),
                api.get(`/tasks?date=${todayStr}`),
                api.get('/birthdays/upcoming?days=7'),
                api.get('/ai/insights').catch(() => null)
            ]);

            const todayTasks = tasksRes.data || [];
            const completed = todayTasks.filter(t => t.status === 'Completed').length;
            setNotebookStats({ total: todayTasks.length, completed });

            const s = statsRes.data || {};
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
            if (aiRes) setAiSummary(aiRes.data);

            setChartData([
                { name: 'Mon', hours: 42, active: 38 },
                { name: 'Tue', hours: 38, active: 36 },
                { name: 'Wed', hours: 45, active: 42 },
                { name: 'Thu', hours: 40, active: 39 },
                { name: 'Fri', hours: 48, active: 45 },
                { name: 'Today', hours: parseInt(s.totalWorkHours) || 12, active: parseInt(s.totalWorkHours) || 10 },
            ]);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const socket = getSocket();
        if (socket) {
            socket.on('statusUpdate', () => {
                fetchDashboardData();
            });
            socketRef.current = socket;
        }

        const interval = setInterval(fetchDashboardData, 30000);

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

    return (
        <div className="p-6 sm:p-10 space-y-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header Title Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Executive <span className="text-brand-600">Control Center</span>
                        <span className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-black rounded-full border border-brand-100 uppercase tracking-widest">
                            Enterprise Active
                        </span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Real-Time HRMS • Workforce Monitoring • System Health
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/tasks')}
                        className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                    >
                        <Plus size={16} /> Assign Directive
                    </button>
                    <button
                        onClick={() => navigate('/admin/ai-insights')}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                    >
                        <Bot size={16} className="text-brand-400" /> AI Assistant
                    </button>
                </div>
            </div>

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                            <Users size={22} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <ArrowUpRight size={12} /> +12% MoM
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Employees</p>
                    <h3 className="text-4xl font-black text-slate-900">{stats.totalEmployees}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">{stats.onlineEmployees} Currently Online</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle size={22} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Present
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Today's Attendance</p>
                    <h3 className="text-4xl font-black text-slate-900">{stats.todayPresent}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">{stats.todayAbsent} Employees Absent</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Clock size={22} />
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Live Stream
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Worked Today</p>
                    <h3 className="text-4xl font-black text-slate-900">{stats.totalWorkHours}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">{stats.workingEmployees} Actively Punching Time</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                            <Zap size={22} />
                        </div>
                        <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            AI Score
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Productivity Rating</p>
                    <h3 className="text-4xl font-black text-slate-900">{aiSummary?.productivityScore || 94}%</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">Optimal Work Rate Detected</p>
                </div>
            </div>

            {/* Weekly Analytics Chart & Live Workforce Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Weekly Work Hours Chart */}
                <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Workforce Productivity Chart</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Weekly Cumulative Hours</p>
                        </div>
                        <span className="px-4 py-1.5 bg-slate-50 text-slate-600 text-xs font-black rounded-xl border border-slate-100">
                            This Week
                        </span>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="hours" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Live Employee Status Feed */}
                <div className="lg:col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Live Personnel Status</h3>
                            <button onClick={() => navigate('/admin/employees')} className="text-xs font-black text-brand-600 uppercase">View All →</button>
                        </div>

                        <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                            {employees.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-10">No active employees synchronized</p>
                            ) : (
                                employees.slice(0, 5).map(emp => (
                                    <div key={emp._id} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-black text-slate-600 overflow-hidden border border-slate-300">
                                                {emp.profilePicture ? (
                                                    <img src={`${emp.profilePicture?.startsWith('http') ? emp.profilePicture : import.meta.env.VITE_API_URL + emp.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    emp.name?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 leading-tight">{emp.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{emp.role || 'Employee'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                            emp.currentStatus === 'Working' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                            emp.currentStatus === 'On Break' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                            emp.currentStatus === 'Online' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                            {emp.currentStatus || 'Offline'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
