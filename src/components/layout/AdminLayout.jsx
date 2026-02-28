import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import AuthContext from '../../context/AuthContext';
import { Bell, Search, Settings, HelpCircle } from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import { initSocket, disconnectSocket } from '../../utils/socket';
import { useEffect } from 'react';
import BirthdayNotificationBanner from '../common/BirthdayNotificationBanner';

const AdminLayout = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.token) {
            initSocket(user.token);
        }
        return () => {
            disconnectSocket();
        };
    }, [user]);

    return (
        <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Global Admin Header */}
                <header className="h-20 bg-white border-b border-slate-200/60 px-8 flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employees, tasks, or reports..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                                <HelpCircle size={20} />
                            </button>
                            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                                <Settings size={20} />
                            </button>
                            <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl relative transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter mt-1">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white font-black shadow-lg shadow-brand-600/20">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </main>
                <ChatPanel />
            </div>
            <BirthdayNotificationBanner />
        </div>
    );
};

export default AdminLayout;
