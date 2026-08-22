import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    LayoutDashboard, 
    Users, 
    ClipboardList, 
    FileText, 
    Activity, 
    MessageSquare, 
    ShieldCheck, 
    Cake, 
    Bot, 
    Briefcase, 
    DollarSign, 
    Settings, 
    X,
    Command
} from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    // Open modal
                    window.dispatchEvent(new CustomEvent('open-command-palette'));
                }
            } else if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const commands = [
        { name: 'Dashboard Overview', path: '/admin', icon: <LayoutDashboard size={18} />, group: 'Core Navigation' },
        { name: 'Employee Directory', path: '/admin/employees', icon: <Users size={18} />, group: 'HR & Personnel' },
        { name: 'Attendance Monitor', path: '/admin/attendance', icon: <ClipboardList size={18} />, group: 'HR & Personnel' },
        { name: 'Leave Management', path: '/admin/leaves', icon: <FileText size={18} />, group: 'HR & Personnel' },
        { name: 'Task Board & Directives', path: '/admin/tasks', icon: <ClipboardList size={18} />, group: 'Operations' },
        { name: 'Projects & Kanban Board', path: '/admin/projects', icon: <Briefcase size={18} />, group: 'Operations' },
        { name: 'Screenshots & Activity', path: '/admin/activity-monitoring', icon: <Activity size={18} />, group: 'Productivity' },
        { name: 'AI Insights & HR Assistant', path: '/admin/ai-insights', icon: <Bot size={18} />, group: 'Intelligence' },
        { name: 'Payroll & Payslips', path: '/admin/payroll', icon: <DollarSign size={18} />, group: 'Finance' },
        { name: 'Team Chat & Messaging', path: '/admin/chat', icon: <MessageSquare size={18} />, group: 'Communication' },
        { name: 'Assets & Hardware Management', path: '/admin/assets', icon: <ShieldCheck size={18} />, group: 'Inventory' },
        { name: 'Birthdays & Celebrations', path: '/admin/birthdays', icon: <Cake size={18} />, group: 'HR & Personnel' },
        { name: 'Enterprise System Settings', path: '/admin/settings', icon: <Settings size={18} />, group: 'System' },
    ];

    const filtered = commands.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.group.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path) => {
        navigate(path);
        onClose();
        setQuery('');
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Search Input Bar */}
                <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
                    <Search size={22} className="text-brand-500" />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Type a command or search modules... (Esc to cancel)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-white placeholder:text-slate-500 border-none outline-none font-bold text-sm"
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg text-[10px] text-slate-400 font-mono">
                        <Command size={12} /> K
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <Search size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-bold">No commands found for "{query}"</p>
                        </div>
                    ) : (
                        filtered.map((cmd) => (
                            <button
                                key={cmd.path}
                                onClick={() => handleSelect(cmd.path)}
                                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-brand-600/20 hover:border-brand-500/30 border border-transparent transition-all group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-brand-600 text-slate-400 group-hover:text-white transition-colors">
                                        {cmd.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-white leading-tight">{cmd.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cmd.group}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-brand-400 uppercase tracking-widest">Jump to →</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer Bar */}
                <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>ProTip: Press Ctrl+K anywhere to open</span>
                    <span>Antigravity HRMS Enterprise v2.5</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
