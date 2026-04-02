import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, LogOut, ShieldCheck, Activity, MessageSquare, Cake, X } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ onMobileClose }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const getNavItems = () => {
        const role = user?.role?.toLowerCase();
        
        if (role === 'admin') {
            return [
                { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/admin/employees', name: 'Employees', icon: <Users size={20} /> },
                { path: '/admin/leaves', name: 'Leaves', icon: <FileText size={20} /> },
                { path: '/admin/attendance', name: 'Attendance', icon: <ClipboardList size={20} /> },
                { path: '/admin/tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
                { path: '/admin/learning-reports', name: 'Learning Logs', icon: <FileText size={20} /> },
                { path: '/admin/activity-monitoring', name: 'Screenshots', icon: <Activity size={20} /> },
                { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
                { path: '/admin/assets', name: 'Assets', icon: <ShieldCheck size={20} /> },
                { path: '/admin/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
            ];
        }

        if (role === 'seo-manager') {
            return [
                { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/admin/employees', name: 'Employees', icon: <Users size={20} /> },
                { path: '/admin/tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
                { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
            ];
        }

        if (role === 'assets-manager') {
            return [
                { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/admin/assets', name: 'Assets', icon: <ShieldCheck size={20} /> },
                { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
            ];
        }

        if (role === 'manager') {
            return [
                { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/admin/employees', name: 'Employees', icon: <Users size={20} /> },
                { path: '/admin/tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
                { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
            ];
        }

        // Default employee/seo-team view
        return [
            { path: '/employee/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/employee/tasks', name: 'My Tasks', icon: <ClipboardList size={20} /> },
            { path: '/employee/attendance', name: 'Attendance', icon: <Activity size={20} /> },
            { path: '/employee/chat', name: 'Messages', icon: <MessageSquare size={20} /> },
            { path: '/employee/profile', name: 'Profile', icon: <Users size={20} /> },
            { path: '/employee/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
        ];
    };

    const navItems = getNavItems();

    return (
        <div className="h-full w-72 bg-slate-900 text-white flex flex-col shadow-2xl font-sans relative">
            {/* Mobile Close Button */}
            <button
                onClick={onMobileClose}
                className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-white"
            >
                <X size={24} />
            </button>

            {/* Logo / Header */}
            <div className="p-8 flex items-center gap-4 border-b border-slate-800/50 bg-slate-950/30">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-brand-500/20 rotate-3 transition-transform duration-500">
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
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onMobileClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                            }`}
                    >
                        <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform'}`}>
                            {item.icon}
                        </span>
                        <span className="font-bold text-sm">{item.name}</span>
                        {isActive(item.path) && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Config / Logout */}
            <div className="p-4 m-4 glass-dark rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold overflow-hidden border border-white/10">
                        {user?.profilePicture ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'A'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate leading-tight">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {user?.role === 'seo-manager' ? 'SEO Admin' : user?.role === 'assets-manager' ? 'Assets Admin' : user?.role === 'manager' ? 'Sr. Manager' : (user?.role || 'admin')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

