import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import {
    MessageSquare, X, Send, Search, Settings,
    MoreVertical, Eye, EyeOff, Layout, Volume2, VolumeX,
    Minus, Maximize2, Move
} from 'lucide-react';

const DesktopChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('chat'); // 'chat' or 'settings'
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipientTyping, setRecipientTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        alwaysOnTop: true,
        opacity: 1.0,
        sound: true,
        side: 'right'
    });

    const scrollRef = useRef();
    const socket = getSocket();

    useEffect(() => {
        // Request settings from Electron
        if (window.electron) {
            window.electron.send('get-chat-settings');
            window.electron.on('chat-settings-updated', (savedSettings) => {
                setSettings(prev => ({ ...prev, ...savedSettings }));
            });
        }
        fetchConversations();
    }, []);

    useEffect(() => {
        if (window.electron) {
            window.electron.send('save-chat-settings', settings);
        }
    }, [settings]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
        } catch (err) { console.error('Fetch conversations failed', err); }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;
        socket.emit('sendMessage', {
            recipientId: selectedUser.isGroup ? null : selectedUser._id,
            groupId: selectedUser.isGroup ? selectedUser._id : null,
            message: newMessage,
            isGroup: selectedUser.isGroup
        });
        setNewMessage('');
        if (!selectedUser.isGroup) socket.emit('stopTyping', { recipientId: selectedUser._id });
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-full h-screen bg-[#f8fafc] flex flex-col overflow-hidden border border-white/20 rounded-[32px] shadow-2xl select-none" style={{ opacity: settings.opacity }}>
            {/* Draggable Header */}
            <div className="bg-brand-600 p-4 flex items-center justify-between text-white shrink-0 cursor-move" style={{ WebkitAppRegion: 'drag' }}>
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Support Desktop</span>
                </div>
                <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
                    <button onClick={() => setView(view === 'chat' ? 'settings' : 'chat')} className="p-1.5 hover:bg-white/10 rounded-lg">
                        <Settings size={14} />
                    </button>
                    <button onClick={() => window.electron.send('chat-window-control', 'minimize')} className="p-1.5 hover:bg-white/10 rounded-lg">
                        <Minus size={14} />
                    </button>
                </div>
            </div>

            {view === 'settings' ? (
                <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white">
                    <h3 className="font-black text-slate-900 border-b pb-2">Widget Settings</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Layout size={18} className="text-brand-600" />
                                <span className="text-xs font-bold text-slate-700">Always on Top</span>
                            </div>
                            <button onClick={() => toggleSetting('alwaysOnTop')} className={`w-10 h-5 rounded-full transition-all relative ${settings.alwaysOnTop ? 'bg-brand-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.alwaysOnTop ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                {settings.sound ? <Volume2 size={18} className="text-brand-600" /> : <VolumeX size={18} className="text-slate-400" />}
                                <span className="text-xs font-bold text-slate-700">Sound Notifications</span>
                            </div>
                            <button onClick={() => toggleSetting('sound')} className={`w-10 h-5 rounded-full transition-all relative ${settings.sound ? 'bg-brand-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.sound ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                <span>Transparency</span>
                                <span>{Math.round(settings.opacity * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0.2" max="1.0" step="0.1"
                                value={settings.opacity}
                                onChange={(e) => setSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                                className="w-full accent-brand-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setSettings({ ...settings, side: 'left' })} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.side === 'left' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Left Side</button>
                            <button onClick={() => setSettings({ ...settings, side: 'right' })} className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.side === 'right' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Right Side</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col bg-white">
                            <div className="p-4 bg-slate-50/50">
                                <div className="relative">
                                    <input
                                        type="text" placeholder="Search..."
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/10"
                                    />
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {conversations.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(conv => (
                                    <div key={conv._id} onClick={() => setSelectedUser(conv)} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                                        <div className="relative">
                                            <img src={`https://ui-avatars.com/api/?name=${conv.name}&background=6366f1&color=fff`} className="w-10 h-10 rounded-xl" alt="" />
                                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${conv.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-black text-slate-900 truncate">{conv.name}</h4>
                                            <p className="text-[10px] text-slate-400 truncate font-semibold">{conv.lastMessage || conv.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col bg-white">
                            <div className="p-3 border-b flex items-center gap-3">
                                <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"><X size={14} /></button>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-black text-slate-900">{selectedUser.name}</h4>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.sender._id === user._id ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs shadow-sm ${msg.sender._id === user._id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t">
                                <div className="flex gap-2">
                                    <input
                                        type="text" value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-slate-100 border-none rounded-xl text-xs p-2.5 outline-none"
                                    />
                                    <button className="bg-brand-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DesktopChatWidget;
