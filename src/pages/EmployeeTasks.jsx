import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Plus,
    Calendar,
    X,
    Filter
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { getSocket } from '../utils/socket';

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium'
    });

    useEffect(() => {
        fetchTasks();

        const socket = getSocket();
        if (socket) {
            socket.on('taskUpdate', (payload) => {
                fetchTasks(); // Simple reload for now to ensure consistency
            });
            return () => socket.off('taskUpdate');
        }
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            toast.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            toast.success("Task self-assigned successfully");
            setIsModalOpen(false);
            setFormData({ title: '', description: '', dueDate: '', priority: 'Medium' });
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create task");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            toast.success(`Status updated to ${status}`);
            fetchTasks();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Workboard</h2>
                    <p className="text-xs text-slate-500 font-medium">Manage your assignments and self-created goals</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                >
                    <Plus size={18} />
                    Self-Assign Task
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-100 w-full lg:max-w-md shadow-sm">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-300"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                    {['All', 'Pending', 'In Progress', 'Completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${filter === f
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse"></div>
                    ))
                ) : filteredTasks.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ClipboardList size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No tasks found</h3>
                        <p className="text-sm text-slate-400">Time to relax or self-assign a new challenge!</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task._id} className="group bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(task.priority)}`}>
                                        {task.priority} Priority
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${task.assignType === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                                        {task.assignType === 'ADMIN' ? 'From Admin' : 'Self Assigned'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">{task.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{task.description}</p>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-slate-50">
                                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>

                                <select
                                    value={task.status}
                                    onChange={(e) => updateStatus(task._id, e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Self-Assign Task</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Boost your productivity</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="What are you working on?"
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-bold placeholder:text-slate-300"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Instructions / Details</label>
                                <textarea
                                    rows="4"
                                    placeholder="Add specific goals or steps..."
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-bold placeholder:text-slate-300 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-bold"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-bold appearance-none cursor-pointer"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-brand-600 text-white rounded-3xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Plus size={22} />
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeTasks;
