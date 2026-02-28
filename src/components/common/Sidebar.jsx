import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, LogOut, ShieldCheck, Activity, MessageSquare, Cake } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = user?.role === 'admin' ? [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/employees', name: 'Employees', icon: <Users size={20} /> },
        { path: '/admin/leaves', name: 'Leaves', icon: <FileText size={20} /> },
        { path: '/admin/attendance', name: 'Attendance', icon: <ClipboardList size={20} /> },
        { path: '/admin/tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
        { path: '/admin/learning-reports', name: 'Learning Logs', icon: <FileText size={20} /> },
        { path: '/admin/activity-monitoring', name: 'Screenshots', icon: <Activity size={20} /> },
        { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
        { path: '/admin/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
    ] : [
        { path: '/employee/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/employee/tasks', name: 'My Tasks', icon: <ClipboardList size={20} /> },
        { path: '/employee/attendance', name: 'Attendance', icon: <Activity size={20} /> },
        { path: '/employee/chat', name: 'Messages', icon: <MessageSquare size={20} /> },
        { path: '/employee/profile', name: 'Profile', icon: <Users size={20} /> },
        { path: '/employee/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
    ];

    return (
        <div className="h-screen w-72 bg-slate-900 text-white flex flex-col shadow-2xl font-sans">
            {/* Logo / Header */}
            <div className="p-8 flex items-center gap-4 border-b border-slate-800/50 bg-slate-950/30">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-brand-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <ShieldCheck size={26} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-white">
                        Admin<span className="text-brand-500">Core</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Control Center</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                        {isActive(item.path) && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Config / Logout */}
            <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'A'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.role || 'admin'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
