import React, { useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import AuthContext from '../../context/AuthContext';
import { Menu, Activity } from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import { initSocket, disconnectSocket } from '../../utils/socket';
import BirthdayNotificationBanner from '../common/BirthdayNotificationBanner';

const AdminLayout = () => {
    const { user } = useContext(AuthContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (user && user.token) {
            initSocket(user.token);
        }

        return () => {
            disconnectSocket();
        };
    }, [user]);

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-[60] transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onMobileClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Global Admin Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 hidden sm:block">Dashboard Overview</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mt-1">
                                {user?.role || 'Admin'}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/20">
                            {user?.name?.charAt(0) || 'A'}
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
