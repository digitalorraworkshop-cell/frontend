import React, { useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import {
    Plus, CheckCircle2, Trash2, Edit2,
    X, Check, Clock, Loader2
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const EmployeeTodo = () => {
    const { user } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Today's date for display and filtering
    const todayStr = new Date().toISOString().split('T')[0];
    const displayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const fetchTodayEntries = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/tasks?date=${todayStr}`);
            // Ensure we only show self-assigned entries (work log style)
            setEntries(data);
        } catch (err) {
            toast.error('Failed to load work log');
        } finally {
            setLoading(false);
        }
    }, [todayStr]);

    useEffect(() => {
        fetchTodayEntries();
    }, [fetchTodayEntries]);

    const handleAddEntry = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || actionLoading) return;

        setActionLoading(true);
        try {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const { data } = await api.post('/tasks', {
                title: inputValue,
                dueDate: todayStr,
                dueTime: timeStr, // Using dueTime field to store "Time Added"
                assignType: 'SELF',
                assignedTo: user._id,
                assignedBy: user._id
            });

            setEntries(prev => [data, ...prev]);
            setInputValue('');
            toast.success('Log entry added');
        } catch (err) {
            toast.error('Failed to add entry');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (entry) => {
        const newStatus = entry.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            setEntries(prev => prev.map(e =>
                e._id === entry._id ? { ...e, status: newStatus } : e
            ));
            await api.put(`/tasks/${entry._id}`, { status: newStatus });
        } catch (err) {
            toast.error('Failed to update status');
            fetchTodayEntries();
        }
    };

    const startEditing = (entry) => {
        setEditingId(entry._id);
        setEditValue(entry.title);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (id) => {
        if (!editValue.trim()) return;
        try {
            setEntries(prev => prev.map(e =>
                e._id === id ? { ...e, title: editValue } : e
            ));
            await api.put(`/tasks/${id}`, { title: editValue });
            setEditingId(null);
            toast.success('Entry updated');
        } catch (err) {
            toast.error('Failed to update entry');
            fetchTodayEntries();
        }
    };

    const deleteEntry = async (id) => {
        try {
            setEntries(prev => prev.filter(e => e._id !== id));
            await api.delete(`/tasks/${id}`);
            toast.success('Entry removed');
        } catch (err) {
            toast.error('Failed to delete entry');
            fetchTodayEntries();
        }
    };

    return (
        <div className="min-h-screen bg-white py-12 px-4 selection:bg-slate-100 font-sans">
            {/* Centered Main Container (Max 700px) */}
            <div className="max-w-[700px] mx-auto">

                {/* Minimal Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Today's Work Log</h1>
                    <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">{displayDate}</p>
                </div>

                {/* Inline Work Entry System */}
                <div className="mb-12">
                    <form onSubmit={handleAddEntry} className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="What are you working on today?"
                            className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || actionLoading}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            <span>Add</span>
                        </button>
                    </form>
                </div>

                {/* Work Log List */}
                <div className="space-y-px bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-2">
                            <Loader2 className="animate-spin" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Log...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-medium">No work entries for today yet.</p>
                            <p className="text-xs text-slate-300 mt-1 italic">Start your day by logging your first task.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {entries.map((entry) => (
                                <div
                                    key={entry._id}
                                    className="group flex items-center gap-4 p-5 bg-white hover:bg-slate-50/50 transition-colors"
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleStatus(entry)}
                                        className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${entry.status === 'Completed'
                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                : 'border-slate-200 hover:border-slate-400 text-transparent'
                                            }`}
                                    >
                                        <Check size={14} strokeWidth={3} />
                                    </button>

                                    {/* Entry Content */}
                                    <div className="flex-1 min-w-0 flex items-center gap-4">
                                        {editingId === entry._id ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="flex-1 py-1 border-b border-slate-900 focus:outline-none font-medium text-slate-900"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(entry._id);
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                                <button onClick={() => saveEdit(entry._id)} className="text-slate-900 hover:bg-slate-100 p-1 rounded-md"><Check size={18} /></button>
                                                <button onClick={cancelEditing} className="text-slate-400 hover:bg-slate-100 p-1 rounded-md"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[15px] font-medium leading-tight transition-all ${entry.status === 'Completed' ? 'line-through text-slate-300' : 'text-slate-800'
                                                        }`}>
                                                        {entry.title}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        <Clock size={10} />
                                                        <span>Logged at {entry.dueTime || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {editingId !== entry._id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEditing(entry)}
                                                className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                                                title="Edit Entry"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteEntry(entry._id)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Remove Entry"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Minimal Footer Info */}
                <div className="mt-8 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            System Logged: {entries.length} entries
                        </p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                            Official Office Register
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeTodo;
