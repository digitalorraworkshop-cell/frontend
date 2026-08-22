import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    FolderKanban, 
    Plus, 
    Calendar, 
    User, 
    CheckSquare, 
    Clock, 
    AlertCircle, 
    MoreHorizontal,
    Briefcase,
    Filter
} from 'lucide-react';

const AdminProjects = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data || []);
        } catch (error) {
            toast.error("Failed to load projects & tasks");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { id: 'Pending', name: 'To Do / Pending', color: 'bg-amber-500' },
        { id: 'In Progress', name: 'In Progress', color: 'bg-blue-500' },
        { id: 'Completed', name: 'Completed / Done', color: 'bg-emerald-500' }
    ];

    const getColumnTasks = (status) => tasks.filter(t => t.status === status);

    return (
        <div className="p-6 sm:p-10 space-y-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FolderKanban className="text-brand-600" size={30} /> Enterprise Projects & Kanban Board
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Project Management • Sprint Columns • Resource Allocation</p>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {columns.map(col => {
                    const colTasks = getColumnTasks(col.id);
                    return (
                        <div key={col.id} className="bg-slate-100/70 p-6 rounded-[36px] border border-slate-200/60 space-y-6 flex flex-col min-h-[550px]">
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                                    <h3 className="font-black text-slate-800 text-base">{col.name}</h3>
                                </div>
                                <span className="px-3 py-1 bg-white rounded-full text-xs font-black text-slate-600 shadow-sm border border-slate-200">
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Task Cards */}
                            <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                {colTasks.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        No tasks in {col.name}
                                    </div>
                                ) : (
                                    colTasks.map(task => (
                                        <div key={task._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-lg transition-all space-y-4">
                                            <div className="flex justify-between items-start">
                                                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                                    task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                    {task.priority || 'Medium'} Priority
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {task.assignType}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-black text-slate-900 text-base leading-snug">{task.title}</h4>
                                                {task.description && (
                                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{task.description}</p>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-brand-600" />
                                                    <span className="text-slate-700 font-bold">{task.assignedTo?.name || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar size={12} />
                                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminProjects;
