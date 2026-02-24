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
    Sun
} from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import useInactivity from '../../hooks/useInactivity';

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
        { path: '/employee/attendance', icon: <Clock size={20} />, label: 'Attendance' },
        { path: '/employee/apply-leave', icon: <CalendarPlus size={20} />, label: 'Apply Leave' },
        { path: '/employee/leaves', icon: <CalendarCheck size={20} />, label: 'My Leaves' },
        { path: '/employee/profile', icon: <User size={20} />, label: 'Profile' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
                                <Clock size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                EmpPortal
                            </span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive(item.path)
                                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile Summary */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm">
                                {user?.profilePicture ? (
                                    <img src={`http://localhost:5000${user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={20} className="text-brand-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                {menuItems.find(i => isActive(i.path))?.label || 'Dashboard'}
                            </h2>
                            <p className="text-xs text-slate-500">Welcome back, {user?.name?.split(' ')?.[0] || 'User'}!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setDarkMode(!isDarkMode)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                        <div className="hidden sm:flex items-center gap-3 pl-2">
                            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-600/20">
                                {user?.name?.charAt(0) ?? '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 sm:p-8">
                    <Outlet />
                </main>
                <ChatPanel />

                {/* Footer */}
                <footer className="py-6 px-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} TimeTracker Corp. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default EmployeeLayout;
