import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { initSocket, disconnectSocket, getSocket } from '../../utils/socket';
import { toast } from 'react-hot-toast';
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
    Cake,
    CheckCircle2,
    AlertCircle,
    Info,
    Check,
    Trash2,
    ExternalLink
} from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import useInactivity from '../../hooks/useInactivity';
import BirthdayNotificationBanner from '../common/BirthdayNotificationBanner';

const playNotificationChime = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.30); // G5
        
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.5);
    } catch (e) {
        console.error("Chime audio error:", e);
    }
};

const EmployeeLayout = () => {
    const { user, logout } = useContext(AuthContext);
    useInactivity(60000); // 1 minute rule
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setDarkMode] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem(`emp_notifications_${user?._id}`);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            const socket = initSocket(user.token);
            
            const handleTaskUpdate = (payload) => {
                const { type, task } = payload;
                if (!task) return;

                // Check if task is assigned to logged-in user
                const assignedId = typeof task.assignedTo === 'object' ? task.assignedTo?._id : task.assignedTo;
                const isAssigned = assignedId && String(assignedId) === String(user._id);

                if (type === 'CREATED' && isAssigned) {
                    playNotificationChime();
                    const assigner = task.assignedBy?.name || 'Admin';
                    const newNotif = {
                        id: Date.now(),
                        type: 'TASK_ASSIGNED',
                        title: 'New Task Assigned!',
                        message: `"${task.title}" assigned by ${assigner}`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date().toLocaleDateString(),
                        read: false,
                        priority: task.priority || 'Medium',
                        taskId: task._id
                    };

                    setNotifications(prev => {
                        const updated = [newNotif, ...prev].slice(0, 30);
                        if (user?._id) {
                            localStorage.setItem(`emp_notifications_${user._id}`, JSON.stringify(updated));
                        }
                        return updated;
                    });

                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-brand-600 p-4`}>
                            <div className="flex-1 w-0 flex items-center">
                                <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-600 mr-3">
                                    <ClipboardList size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-brand-600 uppercase tracking-widest">New Directive</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Assigned by {assigner} • Priority: {task.priority || 'Medium'}</p>
                                </div>
                            </div>
                            <div className="flex border-l border-slate-100 dark:border-slate-700 pl-3 ml-3 items-center">
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        navigate('/employee/dashboard');
                                    }}
                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 p-2"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ), { duration: 6000 });
                } else if (type === 'UPDATED' && isAssigned) {
                    const newNotif = {
                        id: Date.now(),
                        type: 'TASK_UPDATED',
                        title: 'Task Updated',
                        message: `"${task.title}" status is now ${task.status}`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        date: new Date().toLocaleDateString(),
                        read: false,
                        taskId: task._id
                    };
                    setNotifications(prev => {
                        const updated = [newNotif, ...prev].slice(0, 30);
                        if (user?._id) {
                            localStorage.setItem(`emp_notifications_${user._id}`, JSON.stringify(updated));
                        }
                        return updated;
                    });
                }
            };

            socket.on('taskUpdate', handleTaskUpdate);

            return () => {
                socket.off('taskUpdate', handleTaskUpdate);
                disconnectSocket();
            };
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        if (user?._id) {
            localStorage.setItem(`emp_notifications_${user._id}`, JSON.stringify(updated));
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        if (user?._id) {
            localStorage.removeItem(`emp_notifications_${user._id}`);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

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
                                    <img src={`${user.profilePicture?.startsWith('http') ? user.profilePicture : import.meta.env.VITE_API_URL + user.profilePicture}`} alt="Avatar" className="h-full w-full object-cover" />
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

                    <div className="flex items-center gap-2 sm:gap-4 relative">
                        <button
                            onClick={() => setDarkMode(!isDarkMode)}
                            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        {/* Notification Bell with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 h-4 w-4 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown Drawer */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Bell size={18} className="text-brand-600" />
                                            <h4 className="font-black text-sm text-slate-800 dark:text-white">Task Reminders</h4>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-black rounded-full">
                                                    {unreadCount} New
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {notifications.length > 0 && (
                                                <>
                                                    <button
                                                        onClick={markAllAsRead}
                                                        title="Mark all read"
                                                        className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={clearNotifications}
                                                        title="Clear all"
                                                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto py-3 space-y-3 custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-8 text-center text-slate-400">
                                                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                                <p className="text-xs font-bold">No notifications yet</p>
                                                <p className="text-[10px] opacity-60">Admin task assignments will show here</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        const updated = notifications.map(item => item.id === n.id ? { ...item, read: true } : item);
                                                        setNotifications(updated);
                                                        if (user?._id) localStorage.setItem(`emp_notifications_${user._id}`, JSON.stringify(updated));
                                                        setIsNotificationOpen(false);
                                                        navigate('/employee/dashboard');
                                                    }}
                                                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${!n.read 
                                                        ? 'bg-brand-50/50 dark:bg-brand-500/10 border-brand-100 dark:border-brand-500/20' 
                                                        : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50 opacity-80'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-snug">{n.title}</p>
                                                        <span className="text-[9px] font-bold text-slate-400 shrink-0">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{n.message}</p>
                                                    {n.priority && (
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                                n.priority === 'High' ? 'bg-rose-100 text-rose-600' :
                                                                n.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                                {n.priority} Priority
                                                            </span>
                                                            <span className="text-[10px] text-brand-600 font-bold flex items-center gap-1">
                                                                Open Dashboard <ExternalLink size={10} />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

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
