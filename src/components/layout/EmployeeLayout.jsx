import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { initSocket, disconnectSocket } from '../../utils/socket';
import {
    LayoutDashboard,
    ClipboardList,
    CalendarCheck,
    CalendarPlus,
    Clock,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    Moon,
    Sun,
    Cake
} from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import useInactivity from '../../hooks/useInactivity';
import BirthdayNotificationBanner from '../common/BirthdayNotificationBanner';

const EmployeeLayout = () => {
    const { user, logout } = useContext(AuthContext);
    useInactivity(60000); // 1 minute rule
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setDarkMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            initSocket(user.token);
        }
        return () => {
            disconnectSocket();
        };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/employee/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/employee/tasks', icon: <ClipboardList size={20} />, label: 'My Tasks' },
        { path: '/employee/todo', icon: <CalendarCheck size={20} />, label: 'Daily To-Do' },
        { path: '/employee/attendance', icon: <Clock size={20} />, label: 'Attendance' },
        { path: '/employee/apply-leave', icon: <CalendarPlus size={20} />, label: 'Apply Leave' },
        { path: '/employee/profile', icon: <User size={20} />, label: 'Profile' },
        { path: '/employee/birthdays', icon: <Cake size={20} />, label: 'Birthdays' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20 ring-2 ring-white">
                                <Clock size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                Emp<span className="text-brand-600">Portal</span>
                            </span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${isActive(item.path)
                                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={isActive(item.path) ? 'scale-110' : ''}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile Summary */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-100 to-white flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                {user?.profilePicture ? (
                                    <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={20} className="text-brand-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                {menuItems.find(i => isActive(i.path))?.label || 'Dashboard'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setDarkMode(!isDarkMode)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-brand-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                        <div className="hidden sm:flex items-center gap-3 pl-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-brand-600/20 ring-2 ring-white">
                                {user?.name?.charAt(0) ?? '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 sm:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
                <ChatPanel />

                {/* Footer */}
                <footer className="py-8 px-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} TimeTracker Core • Version 2.0.0
                    </p>
                </footer>
            </div>
            <BirthdayNotificationBanner />
        </div>
    );
};


export default EmployeeLayout;
