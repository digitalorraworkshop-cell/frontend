import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    Plus,
    ClipboardList,
    User,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    Trash2,
    Edit3,
    ArrowUpDown,
    CheckSquare
} from 'lucide-react';
import { getSocket } from '../utils/socket';

const AdminTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        employeeId: '',
        status: '',
        assignType: ''
    });

    const [formData, setFormData] = useState({
        assignedTo: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium'
    });

    useEffect(() => {
        fetchInitialData();

        const socket = getSocket();
        if (socket) {
            socket.on('taskUpdate', () => {
                fetchInitialData();
            });
            return () => socket.off('taskUpdate');
        }
    }, [filters]); // Refetch when filters change

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.assignType) queryParams.append('assignType', filters.assignType);

            const [tasksRes, employeesRes] = await Promise.all([
                api.get(`/tasks?${queryParams.toString()}`),
                api.get('/employees')
            ]);
            setTasks(tasksRes.data);
            setEmployees(employeesRes.data);
        } catch (error) {
            toast.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, formData);
                toast.success("Task updated successfully");
            } else {
                await api.post('/tasks', formData);
                toast.success("Task assigned successfully");
            }
            setIsModalOpen(false);
            setEditingTask(null);
            setFormData({ assignedTo: '', title: '', description: '', dueDate: '', priority: 'Medium' });
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success("Task deleted");
            fetchInitialData();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            assignedTo: task.assignedTo?._id || '',
            title: task.title,
            description: task.description,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority || 'Medium'
        });
        setIsModalOpen(true);
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
            case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="p-10 space-y-10 bg-slate-50/30 min-h-screen animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mission <span className="text-brand-600">Control</span></h2>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Enterprise Task Management</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setFormData({ assignedTo: '', title: '', description: '', dueDate: '', priority: 'Medium' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-[20px] font-black text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Assign New Objective
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Filters Sidebar */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Filter size={20} className="text-brand-600" />
                            <h3 className="text-lg font-black text-slate-900">Refine Search</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Assignee</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                                    value={filters.employeeId}
                                    onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                                >
                                    <option value="">Global (All Staff)</option>
                                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Status</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['All', 'Pending', 'In Progress', 'Completed'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilters({ ...filters, status: s === 'All' ? '' : s })}
                                            className={`text-left px-5 py-3 rounded-xl text-xs font-black transition-all ${(filters.status === s || (s === 'All' && !filters.status))
                                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assignment Source</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters({ ...filters, assignType: '' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${!filters.assignType ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                                    >Any</button>
                                    <button
                                        onClick={() => setFilters({ ...filters, assignType: 'ADMIN' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${filters.assignType === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                                    >Admin</button>
                                    <button
                                        onClick={() => setFilters({ ...filters, assignType: 'SELF' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${filters.assignType === 'SELF' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                                    >Self</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] text-white shadow-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Execution Overview</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-4xl font-black">{tasks.length}</h3>
                                <p className="text-xs text-slate-400 font-bold">Active Objectives</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-400">
                                <CheckSquare size={24} />
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Completion Rate</span>
                                <span>{tasks.length ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-500 transition-all duration-1000"
                                    style={{ width: `${tasks.length ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List Table */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee & Objective</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Source</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan="6" className="px-8 py-6 h-20 bg-slate-50/30"></td>
                                            </tr>
                                        ))
                                    ) : tasks.length === 0 ? (
                                        <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No objectives synchronized</td></tr>
                                    ) : (
                                        tasks.map((task) => (
                                            <tr key={task._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                                <td className="px-8 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                                {task.assignedTo?.profilePicture ? (
                                                                    <img src={`http://localhost:5000${task.assignedTo.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User size={20} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${task.assignedTo?.currentStatus === 'Working' ? 'bg-emerald-500' :
                                                                    task.assignedTo?.currentStatus === 'Online' ? 'bg-blue-500' :
                                                                        'bg-slate-300'
                                                                }`}></div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-black text-slate-900 truncate leading-tight">{task.title}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{task.assignedTo?.name || 'Unassigned'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-7 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority || 'Medium'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-7 text-center">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${task.assignType === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {task.assignType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-7">
                                                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-600">
                                                        <Calendar size={14} className="text-slate-300" />
                                                        {new Date(task.dueDate || task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-7">
                                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-center border ${getStatusStyle(task.status)} shadow-sm`}>
                                                        {task.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-7 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(task)}
                                                            className="p-2.5 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(task._id)}
                                                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
                    <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTask ? 'Modify Mission' : 'Assign New Mission'}</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Operational Directive</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingTask(null); }} className="p-4 bg-white text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm hover:shadow-md">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Personnel</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 appearance-none focus:ring-4 focus:ring-brand-500/5 cursor-pointer"
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        disabled={!!editingTask}
                                    >
                                        <option value="">Select Professional</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-500/5 cursor-pointer"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Directive Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter operational title..."
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-500/5"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Priority Level</label>
                                    <div className="flex gap-4">
                                        {['Low', 'Medium', 'High'].map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase transition-all border-2 ${formData.priority === p
                                                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                                                    : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operational Details</label>
                                    <textarea
                                        rows="4"
                                        required
                                        placeholder="Specify goals, requirements, and constraints..."
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-brand-500/5 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-brand-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                <CheckSquare size={24} className="group-hover:scale-110 transition-transform" />
                                {editingTask ? 'Update Directive' : 'Deploy Mission'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTasks;
