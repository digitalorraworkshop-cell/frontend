import React, { useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import AuthContext from '../../context/AuthContext';
import { Bell, Search, Settings, HelpCircle, Menu, Command } from 'lucide-react';
import ChatPanel from '../chat/ChatPanel';
import { initSocket, disconnectSocket } from '../../utils/socket';
import BirthdayNotificationBanner from '../common/BirthdayNotificationBanner';
import CommandPalette from '../common/CommandPalette';

const AdminLayout = () => {
    const { user } = useContext(AuthContext);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.token) {
            initSocket(user.token);
        }

        const handleOpenPalette = () => setIsCommandPaletteOpen(true);
        window.addEventListener('open-command-palette', handleOpenPalette);

        return () => {
            disconnectSocket();
            window.removeEventListener('open-command-palette', handleOpenPalette);
        };
    }, [user]);

    return (
        <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden relative">
            {/* Command Palette Modal */}
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setIsCommandPaletteOpen(false)} 
            />

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
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-50">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <button
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="relative w-full max-w-md hidden sm:flex items-center justify-between px-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/60 rounded-2xl text-sm transition-all text-slate-400 font-bold group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Search className="text-slate-400 group-hover:text-brand-600 transition-colors" size={18} />
                                <span>Search modules, users, tasks...</span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-500 font-mono shadow-sm">
                                <Command size={10} /> K
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <button 
                                onClick={() => navigate('/admin/settings')}
                                className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <Settings size={20} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/ai-insights')}
                                className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white animate-ping"></span>
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
