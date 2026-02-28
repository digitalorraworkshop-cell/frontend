import React, { useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import {
    Plus, CheckCircle2, Circle, Trash2, Calendar,
    ArrowRight, Loader2, ChevronLeft, ChevronRight,
    AlertCircle, Sparkles, Trophy, Target, Zap,
    Layout, CheckCircle, Clock
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const EmployeeTodo = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTask, setNewTask] = useState('');
    const [carryForwardTasks, setCarryForwardTasks] = useState([]);
    const [showCarryPrompt, setShowCarryPrompt] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // Format date for header
    const formatFullDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const fetchTasks = useCallback(async (date) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/tasks?date=${date}`);
            setTasks(data);
        } catch (err) {
            toast.error('Failed to load notebook');
        } finally {
            setLoading(false);
        }
    }, []);

    const checkYesterdayTasks = useCallback(async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        try {
            const { data } = await api.get(`/tasks?date=${yesterdayStr}`);
            const pending = data.filter(t => t.status !== 'Completed');
            if (pending.length > 0) {
                setCarryForwardTasks(pending);
                setShowCarryPrompt(true);
            }
        } catch (err) {
            console.error('Failed to check yesterday tasks');
        }
    }, []);

    useEffect(() => {
        fetchTasks(currentDate);
        if (currentDate === today) {
            checkYesterdayTasks();
        }
    }, [currentDate, fetchTasks, checkYesterdayTasks, today]);

    const handleAddTask = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newTask.trim() || currentDate !== today) return;

        setActionLoading(true);
        try {
            const { data } = await api.post('/tasks', {
                title: newTask,
                dueDate: currentDate,
                priority: 'Medium'
            });
            setTasks(prev => [data, ...prev]);
            setNewTask('');
            toast.success('Added to your plan 🚀');
        } catch (err) {
            toast.error('Failed to add task');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            setTasks(prev => prev.map(t =>
                t._id === task._id ? { ...t, status: newStatus } : t
            ));
            await api.put(`/tasks/${task._id}`, { status: newStatus });
            if (newStatus === 'Completed') {
                toast.success('Great job! 👏', { icon: '✨' });
            }
        } catch (err) {
            toast.error('Failed to update status');
            setTasks(prev => prev.map(t =>
                t._id === task._id ? { ...t, status: task.status } : t
            ));
        }
    };

    const deleteTask = async (id) => {
        try {
            setTasks(prev => prev.filter(t => t._id !== id));
            await api.delete(`/tasks/${id}`);
            toast.success('Task removed');
        } catch (err) {
            toast.error('Failed to delete task');
            fetchTasks(currentDate);
        }
    };

    const applyCarryForward = async (shouldCarry) => {
        if (shouldCarry) {
            setActionLoading(true);
            try {
                for (const task of carryForwardTasks) {
                    await api.put(`/tasks/${task._id}`, {
                        dueDate: today,
                        carriedOver: true
                    });
                }
                toast.success('Tasks carried forward! ➡️');
                fetchTasks(today);
            } catch (err) {
                toast.error('Failed to carry forward');
            } finally {
                setActionLoading(false);
            }
        }
        setShowCarryPrompt(false);
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans selection:bg-indigo-600 selection:text-white pb-24">
            {/* Subtle Gradient Background Blob */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10 blur-3xl" />

            {/* Main Content Container */}
            <div className="max-w-[900px] mx-auto px-6 pt-16">

                {/* Header Card */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Target size={120} className="text-indigo-900" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                                    {currentDate === today ? 'Today' : 'Archive'}
                                </span>
                                <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                                    <Zap size={14} className="text-amber-500" />
                                    Stay productive 🚀
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none group flex items-center gap-4">
                                {formatFullDate(currentDate)}
                            </h1>
                            <p className="text-slate-500 text-lg font-medium">✨ Plan your day, achieve your goals.</p>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 self-start md:self-end">
                            <button
                                onClick={() => {
                                    const d = new Date(currentDate); d.setDate(d.getDate() - 1);
                                    setCurrentDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-3 hover:bg-white hover:text-indigo-600 hover:shadow-xl rounded-xl transition-all text-slate-400"
                                title="Previous Day"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <button
                                disabled={currentDate === today}
                                onClick={() => {
                                    const d = new Date(currentDate); d.setDate(d.getDate() + 1);
                                    setCurrentDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-3 hover:bg-white hover:text-indigo-600 hover:shadow-xl rounded-xl transition-all text-slate-400 disabled:opacity-20"
                                title="Next Day"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Progress Visual */}
                    <div className="mt-12">
                        <div className="flex justify-between items-end mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Goal Progress</span>
                                {percentage === 100 && total > 0 && <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><Trophy size={14} /> Full Success </span>}
                            </div>
                            <span className="text-2xl font-black text-slate-900">{percentage}% <span className="text-sm text-slate-300">completed</span></span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Notebook Section */}
                <div className="relative group">

                    {/* Add Task Input */}
                    {currentDate === today && (
                        <div className="mb-10 transform transition-all duration-300 hover:-translate-y-1">
                            <form onSubmit={handleAddTask} className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                                    <Plus size={28} strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="What do you want to accomplish today?"
                                    className="w-full bg-white border border-slate-100 hover:border-indigo-100 rounded-3xl pl-16 pr-24 py-6 text-lg font-bold text-slate-900 placeholder:text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:shadow-[0_20px_40px_rgba(79,70,229,0.08)] focus:border-indigo-600 transition-all outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newTask.trim() || actionLoading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-0 disabled:scale-90"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add Task'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tasks List Container */}
                    <div className="space-y-4 min-h-[400px]">
                        {loading ? (
                            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                                <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                                <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">Loading your day...</p>
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="py-32 text-center animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-24 h-24 bg-indigo-50/50 text-indigo-400 rounded-[40px] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
                                    <Sparkles size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Clean Slate</h3>
                                <p className="text-slate-400 font-medium max-w-[280px] mx-auto leading-relaxed">No tasks for this day yet. Ready to plan some big goals?</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedTasks.map((task, index) => (
                                    <div
                                        key={task._id}
                                        className={`group relative bg-white flex items-center gap-5 p-6 rounded-[28px] border border-slate-50 transition-all duration-500 animate-in slide-in-from-bottom-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 overflow-hidden ${task.status === 'Completed' ? 'bg-[#F9FAFB]/80 shadow-none grayscale-[0.5]' : ''
                                            }`}
                                    >
                                        {/* Colored Accent Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${task.status === 'Completed' ? 'bg-slate-200' : 'bg-indigo-600'}`} />

                                        {/* Custom Checkbox */}
                                        <button
                                            onClick={() => toggleStatus(task)}
                                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-75 ${task.status === 'Completed'
                                                    ? 'bg-indigo-50 text-indigo-600 rotate-[360deg] shadow-inner'
                                                    : 'bg-slate-50 border-2 border-slate-100 text-transparent hover:border-indigo-400 hover:text-slate-200'
                                                }`}
                                        >
                                            <CheckCircle2 size={20} strokeWidth={3} />
                                        </button>

                                        {/* Task Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-slate-300 tabular-nums">#{(index + 1).toString().padStart(2, '0')}</span>
                                                {task.carriedOver && <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Carried Forward</span>}
                                            </div>
                                            <p className={`text-lg font-bold tracking-tight transition-all duration-700 truncate ${task.status === 'Completed' ? 'line-through text-slate-400 decoration-slate-300 decoration-2 italic opacity-60' : 'text-slate-900 group-hover:text-indigo-950'
                                                }`}>
                                                {task.title}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            {currentDate === today && (
                                                <button
                                                    onClick={() => deleteTask(task._id)}
                                                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Carry Forward Prompt - Premium Design */}
            {showCarryPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-[480px] rounded-[48px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 slide-in-from-bottom-20 duration-500">
                        <div className="p-12 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 translate-x-8 -translate-y-8">
                                <Zap size={150} className="text-amber-900" />
                            </div>

                            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10 rotate-3">
                                <Clock size={40} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Unfinished Goals?</h3>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed px-4">
                                You left <span className="text-slate-950 font-black">{carryForwardTasks.length} tasks</span> incomplete yesterday. Would you like to bring them into your plan for today?
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50/50 flex flex-col gap-3">
                            <button
                                onClick={() => applyCarryForward(true)}
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-5 rounded-[28px] text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-900/30 active:scale-95 transition-all hover:bg-black"
                            >
                                <Zap size={18} fill="currentColor" /> Yes, Bring Them Over
                            </button>
                            <button
                                onClick={() => applyCarryForward(false)}
                                className="w-full px-8 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                No, Let's Start Fresh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeTodo;
