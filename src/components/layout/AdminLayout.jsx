import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import AuthContext from '../../context/AuthContext';
import { Bell, Search, Settings, HelpCircle, Menu, X } from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import { initSocket, disconnectSocket } from '../../utils/socket';
import { useEffect } from 'react';
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
        <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar with mobile toggle logic */}
            <div className={`fixed inset-y-0 left-0 z-[60] transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onMobileClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Global Admin Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-50">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <button className="hidden sm:flex p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
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
                        <div className="h-8 w-px bg-slate-200 mx-1 sm:mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mt-1">
                                    {user?.role === 'seo-manager' ? 'SEO Admin' : user?.role === 'assets-manager' ? 'Assets Admin' : user?.role === 'manager' ? 'Sr. Manager' : 'Super Admin'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-black shadow-lg shadow-brand-600/20 ring-2 ring-white">
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

