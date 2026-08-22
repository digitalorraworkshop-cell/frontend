import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    ClipboardList, 
    LogOut, 
    Clock, 
    Activity, 
    MessageSquare, 
    Cake, 
    ShieldCheck, 
    BookOpen,
    Video,
    X 
} from 'lucide-react';
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
        if (path !== '/admin' && location.pathname === path) return true;
        return false;
    };

    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminRole = ['admin', 'seo-manager', 'assets-manager', 'manager'].includes(role);

    const adminNav = [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/employees', name: 'Employees', icon: <Users size={20} /> },
        { path: '/admin/meetings', name: 'Meetings', icon: <Video size={20} /> },
        { path: '/admin/attendance', name: 'Attendance', icon: <Clock size={20} /> },
        { path: '/admin/leaves', name: 'Leaves', icon: <FileText size={20} /> },
        { path: '/admin/tasks', name: 'Tasks', icon: <ClipboardList size={20} /> },
        { path: '/admin/activity-monitoring', name: 'Screenshots', icon: <Activity size={20} /> },
        { path: '/admin/learning-reports', name: 'Learning Logs', icon: <BookOpen size={20} /> },
        { path: '/admin/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
        { path: '/admin/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
        { path: '/admin/assets', name: 'Assets', icon: <ShieldCheck size={20} /> },
    ];

    const employeeNav = [
        { path: '/employee/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/employee/meetings', name: 'Meetings', icon: <Video size={20} /> },
        { path: '/employee/tasks', name: 'My Tasks', icon: <ClipboardList size={20} /> },
        { path: '/employee/todo', name: 'Todo List', icon: <ClipboardList size={20} /> },
        { path: '/employee/attendance', name: 'Attendance', icon: <Clock size={20} /> },
        { path: '/employee/apply-leave', name: 'Apply Leave', icon: <FileText size={20} /> },
        { path: '/employee/chat', name: 'Team Chat', icon: <MessageSquare size={20} /> },
        { path: '/employee/profile', name: 'My Profile', icon: <Users size={20} /> },
        { path: '/employee/birthdays', name: 'Birthdays', icon: <Cake size={20} /> },
    ];

    const navItems = isAdminRole ? adminNav : employeeNav;

    return (
        <div className="h-full w-64 bg-slate-900 text-white flex flex-col shadow-xl font-sans relative border-r border-slate-800">
            {/* Mobile Close Button */}
            <button
                onClick={onMobileClose}
                className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
                <X size={20} />
            </button>

            {/* Brand Header */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                    <ShieldCheck size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">TimeTracker</h1>
                    <p className="text-xs text-slate-400 font-medium">Control Portal</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onMobileClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                            isActive(item.path)
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <span className={isActive(item.path) ? 'text-white' : 'text-slate-400'}>
                            {item.icon}
                        </span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer Profile & Logout */}
            <div className="p-4 m-3 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                        {user?.profilePicture ? (
                            <img src={`${user.profilePicture?.startsWith('http') ? user.profilePicture : import.meta.env.VITE_API_URL + user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 font-medium capitalize truncate">
                            {user?.role || 'Employee'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors text-xs font-semibold"
                >
                    <LogOut size={14} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
