import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    ClipboardList, 
    LogOut, 
    ShieldCheck, 
    Activity, 
    MessageSquare, 
    Cake, 
    X, 
    Bot, 
    Briefcase, 
    DollarSign, 
    Settings as SettingsIcon,
    ChevronDown,
    ChevronRight,
    Search,
    Pin,
    Calendar,
    Award,
    Sparkles,
    FolderKanban,
    Clock,
    BookOpen
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ onMobileClose }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategories, setOpenCategories] = useState({
        employees: true,
        hr: true,
        projects: true,
        productivity: true,
        payroll: false,
        communication: false,
        learning: false,
        assets: false
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleCategory = (cat) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname === path) return true;
        return false;
    };

    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminRole = ['admin', 'seo-manager', 'assets-manager', 'manager'].includes(role);

    // Enterprise Navigation Structure
    const navCategories = [
        {
            title: 'Overview',
            items: [
                { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                { path: '/admin/ai-insights', name: 'AI Insights & HR Bot', icon: <Bot size={18} />, badge: 'AI' }
            ]
        },
        {
            id: 'employees',
            title: '👥 Employees',
            items: [
                { path: '/admin/employees', name: 'Employee List', icon: <Users size={18} /> },
                { path: '/admin/birthdays', name: 'Birthdays & Events', icon: <Cake size={18} /> }
            ]
        },
        {
            id: 'hr',
            title: '⏰ HR & Workforce',
            items: [
                { path: '/admin/attendance', name: 'Attendance & GPS', icon: <Clock size={18} /> },
                { path: '/admin/leaves', name: 'Leave Management', icon: <FileText size={18} /> }
            ]
        },
        {
            id: 'projects',
            title: '📁 Projects & Tasks',
            items: [
                { path: '/admin/tasks', name: 'Tasks & Directives', icon: <ClipboardList size={18} /> },
                { path: '/admin/projects', name: 'Projects & Kanban', icon: <FolderKanban size={18} />, badge: 'New' }
            ]
        },
        {
            id: 'productivity',
            title: '📊 Productivity',
            items: [
                { path: '/admin/activity-monitoring', name: 'Screenshots & Activity', icon: <Activity size={18} /> }
            ]
        },
        {
            id: 'payroll',
            title: '💰 Payroll & Finance',
            items: [
                { path: '/admin/payroll', name: 'Salary & Payslips', icon: <DollarSign size={18} /> }
            ]
        },
        {
            id: 'communication',
            title: '💬 Communication',
            items: [
                { path: '/admin/chat', name: 'Team Chat & Hub', icon: <MessageSquare size={18} /> }
            ]
        },
        {
            id: 'learning',
            title: '🎓 Learning & Assets',
            items: [
                { path: '/admin/learning-reports', name: 'Learning Logs', icon: <BookOpen size={18} /> },
                { path: '/admin/assets', name: 'Assets & Hardware', icon: <ShieldCheck size={18} /> }
            ]
        },
        {
            title: 'System',
            items: [
                { path: '/admin/settings', name: 'Settings & Roles', icon: <SettingsIcon size={18} /> }
            ]
        }
    ];

    // Employee specific layout if role is basic employee
    const employeeNav = [
        { path: '/employee/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/employee/tasks', name: 'My Tasks', icon: <ClipboardList size={18} /> },
        { path: '/employee/attendance', name: 'Attendance', icon: <Clock size={18} /> },
        { path: '/employee/apply-leave', name: 'Apply Leave', icon: <FileText size={18} /> },
        { path: '/employee/chat', name: 'Team Chat', icon: <MessageSquare size={18} /> },
        { path: '/employee/profile', name: 'My Profile', icon: <Users size={18} /> },
        { path: '/employee/birthdays', name: 'Birthdays', icon: <Cake size={18} /> }
    ];

    return (
        <div className="h-full w-72 bg-slate-950 text-slate-100 flex flex-col shadow-2xl font-sans relative border-r border-slate-800/60 select-none">
            {/* Mobile Close */}
            <button
                onClick={onMobileClose}
                className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-white"
            >
                <X size={24} />
            </button>

            {/* Brand Header */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/80 bg-slate-900/40">
                <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 ring-2 ring-white/10">
                    <ShieldCheck size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                        TimeTracker <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-400 font-bold rounded-md border border-brand-500/30">PRO</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise SaaS v2.5</p>
                </div>
            </div>

            {/* Quick Menu Search */}
            {isAdminRole && (
                <div className="px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5 rounded-2xl border border-slate-800 focus-within:border-brand-500/50 transition-colors">
                        <Search size={14} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter navigation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-xs text-white placeholder:text-slate-500 border-none outline-none font-bold w-full"
                        />
                    </div>
                </div>
            )}

            {/* Navigation Body */}
            <nav className="flex-1 px-4 py-3 space-y-4 overflow-y-auto custom-scrollbar">
                {isAdminRole ? (
                    navCategories.map((group, idx) => {
                        const filteredItems = group.items.filter(i => 
                            i.name.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (searchQuery && filteredItems.length === 0) return null;

                        const isCollapsible = !!group.id;
                        const isOpen = isCollapsible ? openCategories[group.id] : true;

                        return (
                            <div key={idx} className="space-y-1">
                                {group.title && (
                                    <div 
                                        onClick={() => isCollapsible && toggleCategory(group.id)}
                                        className={`flex items-center justify-between px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 ${isCollapsible ? 'cursor-pointer hover:text-slate-200' : ''}`}
                                    >
                                        <span>{group.title}</span>
                                        {isCollapsible && (
                                            isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                                        )}
                                    </div>
                                )}

                                {isOpen && (searchQuery ? filteredItems : group.items).map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onMobileClose}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 group font-bold text-xs ${isActive(item.path)
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                                            : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                        </div>

                                        {item.badge && (
                                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest ${
                                                isActive(item.path) ? 'bg-white text-brand-600' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-1 pt-2">
                        <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Employee Portal</p>
                        {employeeNav.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onMobileClose}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 font-bold text-xs ${isActive(item.path)
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
                                    }`}
                            >
                                <span className={isActive(item.path) ? 'text-white' : 'text-slate-400 hover:text-white'}>
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer Profile & Logout */}
            <div className="p-4 m-3 bg-slate-900/90 rounded-3xl border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black overflow-hidden shadow-md">
                        {user?.profilePicture ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate leading-tight">{user?.name || 'User'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {user?.role || 'Employee'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-rose-500/20"
                >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
