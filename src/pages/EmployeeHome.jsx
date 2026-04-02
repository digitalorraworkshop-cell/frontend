import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Clock, CheckCircle2, Timer, AlertCircle, Calendar, Briefcase, Zap, Star, TrendingUp, Plus, Trash2, CheckCircle, ClipboardList, StickyNote, Cake } from 'lucide-react';
import TrackWidget from '../components/employee/TrackWidget';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const EmployeeHome = ({ scrollToTodo }) => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState({
        todayHours: "00:00",
        activeMinutes: 0,
        attendancePercent: 0,
        pendingTasks: 0,
        productivityPercent: 0
    });
    const [todos, setTodos] = useState([]);
    const [birthdays, setBirthdays] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [todoLoading, setTodoLoading] = useState(true);
    const todoRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        if (!authLoading && user?._id) {
            fetchStats();
            fetchTodos();
            const interval = setInterval(() => {
                fetchStats();
                fetchTodos();
            }, 30000);

            if (scrollToTodo && todoRef.current) {
                setTimeout(() => {
                    todoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }

            return () => {
                clearInterval(timer);
                clearInterval(interval);
            };
        }

        return () => clearInterval(timer);
    }, [user, authLoading, scrollToTodo]);

    const fetchStats = async () => {
        try {
            const [statsRes, tasksRes, birthdaysRes] = await Promise.all([
                api.get(`/activity/stats/${user._id}`),
                api.get('/tasks'),
                api.get('/birthdays/upcoming?days=7')
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
            setBirthdays(birthdaysRes.data || []);
        } catch (error) {
            console.error("Stats fetch error:", error);
        }
    };

    const fetchTodos = async () => {
        try {
            const { data } = await api.get('/tasks');
            const selfTasks = data.filter(t => t.assignType === 'SELF');
            setTodos(selfTasks);
        } catch (error) {
            console.error("Todo fetch error:", error);
        } finally {
            setTodoLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const taskData = {
                title: newTodo,
                description: 'Quick reminder added from dashboard',
                dueDate: new Date().toISOString(),
                priority: 'Medium'
            };
            const { data } = await api.post('/tasks', taskData);
            setTodos([data, ...todos]);
            setNewTodo('');
            toast.success("Sticky note added!");
            fetchStats();
        } catch (error) {
            toast.error("Failed to add reminder");
        }
    };

    const toggleTodo = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
            const { data } = await api.put(`/tasks/${id}`, { status: newStatus });
            setTodos(todos.map(t => t._id === id ? data : t));
            fetchStats();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const getNoteColor = (index) => {
        const colors = [
            'bg-amber-100 border-amber-200 text-amber-800',
            'bg-sky-100 border-sky-200 text-sky-800',
            'bg-emerald-100 border-emerald-200 text-emerald-800',
            'bg-violet-100 border-violet-200 text-violet-800',
            'bg-rose-100 border-rose-200 text-rose-800',
            'bg-orange-100 border-orange-200 text-orange-800'
        ];
        return colors[index % colors.length];
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

                    {/* Birthday Widget */}
                    <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Cake className="text-pink-500" size={20} />
                                Birthdays
                            </h4>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next 7 Days</span>
                        </div>
                        <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {birthdays.length > 0 ? (
                                birthdays.map(b => (
                                    <div key={b._id} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white text-sm font-black shadow-sm">
                                            {b.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{b.name}</p>
                                            <p className="text-[10px] text-pink-500 font-bold">{b.isToday ? 'Today!' : b.daysLeft === 1 ? 'Tomorrow' : `In ${b.daysLeft} days`}</p>
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
                            onClick={() => navigate('/employee/birthdays')}
                            className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:translate-y-0.5"
                        >
                            View All Birthdays
                        </button>
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

                    {/* Today's To-Do List Widget (Sticky Notes Style) */}
                    <div ref={todoRef} className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-200/30 flex flex-col min-h-[500px]">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-sm rotate-3">
                                    <StickyNote size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Working Sticky Notes</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Quick daily reminders</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] border border-brand-100">
                                    {todos.filter(t => t.status !== 'Completed').length} Pending Tasks
                                </span>
                            </div>
                        </div>

                        {/* Quick Add Form */}
                        <form onSubmit={addTodo} className="flex gap-4 mb-10">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="Got a quick task or thought? Write it down..."
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] px-8 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-brand-500/10 focus:bg-white focus:border-brand-100 transition-all shadow-inner"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-400 font-black">ENTER</kbd>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-8 bg-slate-900 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Stick It</span>
                            </button>
                        </form>

                        {/* Sticky Notes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-4 custom-scrollbar pb-6 content-start">
                            {todoLoading ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
                                    <Timer className="animate-spin mb-4" size={32} />
                                    <p className="text-xs font-black uppercase tracking-widest">Preparing your desk...</p>
                                </div>
                            ) : todos.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                                        <StickyNote size={48} className="opacity-20" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-500">No notes on your desk!</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-60">Add a quick note above to see it here</p>
                                </div>
                            ) : (
                                todos.map((todo, index) => (
                                    <div
                                        key={todo._id}
                                        onClick={() => toggleTodo(todo._id, todo.status)}
                                        className={`relative group p-8 rounded-[24px] border-2 transition-all duration-500 cursor-pointer shadow-md hover:shadow-2xl flex flex-col justify-between min-h-[160px] ${todo.status === 'Completed'
                                            ? 'bg-slate-50 border-transparent opacity-50 grayscale'
                                            : `${getNoteColor(index)} hover:-translate-y-2 hover:-rotate-1`
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className={`text-lg font-black leading-snug ${todo.status === 'Completed' ? 'line-through text-slate-400' : 'text-current'}`}>
                                                {todo.title}
                                            </p>
                                            <div className={`p-2 rounded-xl transition-all ${todo.status === 'Completed' ? 'bg-slate-200 text-slate-400' : 'bg-white/40 text-current shadow-sm'}`}>
                                                {todo.status === 'Completed' ? <CheckCircle size={20} /> : <Plus size={20} className="rotate-45" />}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${todo.status === 'Completed' ? 'bg-slate-300' : 'bg-current shadow-[0_0_8px_currentColor]'}`}></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    {todo.status === 'Completed' ? 'Finished' : 'Working'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full border border-current/10">Today</span>
                                        </div>

                                        {/* Pin visual effect */}
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/10 rounded-full blur-[2px]"></div>
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/20 rounded-full flex items-center justify-center">
                                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                        </div>

                                        {/* Fold effect */}
                                        <div className={`absolute bottom-0 right-0 w-10 h-10 transition-all duration-500 overflow-hidden rounded-br-[24px]`}>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black/5 rotate-45 transform origin-bottom-right"></div>
                                        </div>
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

export default EmployeeHome;
