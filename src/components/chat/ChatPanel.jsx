import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../../context/AuthContext';
import { getSocket } from '../../utils/socket';
import api from '../../utils/api';

import {
    MessageSquare, X, Send, Search, Image as ImageIcon,
    MoreVertical, Check, CheckCheck, Smile, Minus,
    Wheat, RefreshCw
} from 'lucide-react';

const ChatPanel = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipientTyping, setRecipientTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [side, setSide] = useState('right'); // 'left' or 'right'
    const scrollRef = useRef();
    const chatContainerRef = useRef();
    const notificationSoundRef = useRef(new Audio('/sounds/new-message.mp3'));
    const socket = getSocket();

    useEffect(() => {
        const savedSide = localStorage.getItem('chatSide');
        if (savedSide) setSide(savedSide);
    }, []);

    const toggleSide = () => {
        const newSide = side === 'right' ? 'left' : 'right';
        setSide(newSide);
        localStorage.setItem('chatSide', newSide);
    };

    useEffect(() => {
        fetchUnreadCount();
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/chat/unread-count');
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error('Fetch unread count failed:', err);
        }
    };

    useEffect(() => {
        if (socket) {
            const handleMessage = (message) => {
                const isRelevant = selectedUser && (
                    (message.isGroup && message.groupId === selectedUser._id) ||
                    (!message.isGroup && (message.sender._id === selectedUser._id || message.recipient?._id === selectedUser._id))
                );

                if (isRelevant) {
                    setMessages(prev => [...prev, message]);
                    if (message.sender._id !== user._id) {
                        socket.emit('messageSeen', { messageId: message._id, senderId: message.sender._id });
                        api.post('/chat/mark-read', {
                            senderId: message.isGroup ? null : message.sender._id,
                            groupId: message.isGroup ? message.groupId : null
                        }).catch(console.error);
                    }
                } else {
                    if (!isOpen || !isRelevant) {
                        setUnreadCount(prev => prev + 1);
                        notificationSoundRef.current.play().catch(() => { });
                    }
                    fetchConversations();
                }
            };

            socket.on('receiveMessage', handleMessage);
            socket.on('typing', (data) => {
                if (selectedUser && (data.userId === selectedUser._id || data.groupId === selectedUser._id)) {
                    setRecipientTyping(true);
                }
            });
            socket.on('stopTyping', (data) => {
                if (selectedUser && (data.userId === selectedUser._id || data.groupId === selectedUser._id)) {
                    setRecipientTyping(false);
                }
            });
            socket.on('messageDeliveredUpdate', ({ messageId }) => {
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deliveredStatus: true } : m));
            });
            socket.on('messageSeenUpdate', ({ messageId }) => {
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isSeen: true } : m));
            });

            return () => {
                socket.off('receiveMessage');
                socket.off('typing');
                socket.off('stopTyping');
            };
        }
    }, [selectedUser, socket, isOpen]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
            api.post('/chat/mark-read', { senderId: selectedUser._id })
                .then(() => fetchUnreadCount())
                .catch(console.error);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Fetch conversations failed:', err);
        }
    };

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const fetchMessages = async (isNewPage = false) => {
        try {
            const endpoint = selectedUser.isGroup
                ? `/chat/group/${selectedUser._id}?page=${page}`
                : `/chat/messages/${selectedUser._id}?page=${page}`;

            const res = await api.get(endpoint);
            if (res.data.length < 20) setHasMore(false);

            if (isNewPage) {
                setMessages(prev => [...res.data, ...prev]);
            } else {
                setMessages(res.data);
            }
        } catch (err) {
            console.error('Fetch messages failed:', err);
        }
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
        if (!selectedUser.isGroup) {
            socket.emit('stopTyping', { recipientId: selectedUser._id });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');

        try {
            const res = await api.post('/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            socket.emit('sendMessage', {
                recipientId: selectedUser.isGroup ? null : selectedUser._id,
                groupId: selectedUser.isGroup ? selectedUser._id : null,
                imageUrl: res.data.url,
                isGroup: selectedUser.isGroup
            });
        } catch (err) {
            console.error('Image upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`fixed bottom-6 ${side === 'right' ? 'right-6' : 'left-6'} z-[9999] flex flex-col items-${side === 'right' ? 'end' : 'start'}`}>
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[380px] h-[600px] bg-[#f8fafc] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                    {/* Premium Header */}
                    <div className="bg-brand-600 p-6 relative text-white shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Wheat size={20} className="text-white/80" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Support Center</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={toggleSide} title="Change side" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <RefreshCw size={14} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <Minus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-black tracking-tight leading-tight mb-2">Fastest Support for any issues</h3>
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!selectedUser ? (
                            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded-t-[40px] p-2">
                                <div className="p-4 space-y-3">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Search team..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-brand-500/10 transition-all outline-none"
                                        />
                                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsGroupMode(false)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isGroupMode ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Direct</button>
                                        <button onClick={() => setIsGroupMode(true)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isGroupMode ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Groups</button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                                    {filteredConversations.filter(c => isGroupMode ? c.isGroup : !c.isGroup).map(conv => (
                                        <div
                                            key={conv._id}
                                            onClick={() => setSelectedUser(conv)}
                                            className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all group active:scale-[0.98]"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={conv.profilePicture ? (conv.profilePicture.startsWith('http') ? conv.profilePicture : `${import.meta.env.VITE_API_URL}${conv.profilePicture}`) : `https://ui-avatars.com/api/?name=${conv.name}&background=6366f1&color=fff`}
                                                    className="w-12 h-12 rounded-[18px] object-cover border-2 border-white shadow-sm"
                                                    alt=""
                                                />
                                                {!conv.isGroup && (
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${conv.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className="text-sm font-black text-slate-900 truncate">{conv.name}</h4>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full ring-4 ring-white shadow-lg">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 truncate font-semibold">{conv.lastMessage || conv.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col bg-white rounded-t-[40px] overflow-hidden">
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                                            <X size={16} />
                                        </button>
                                        <div className="flex items-center gap-2.5">
                                            <img src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.name}`} className="w-9 h-9 rounded-2xl" alt="" />
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-900">{selectedUser.name}</h4>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                                                    {recipientTyping ? 'Typing...' : (selectedUser.isOnline ? 'Active Now' : 'Last seen 5m')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><MoreVertical size={16} /></button>
                                </div>
                                <div
                                    ref={chatContainerRef}
                                    onScroll={handleScroll}
                                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
                                >
                                    {messages.map((msg, i) => (
                                        <div key={msg._id || i} className={`flex flex-col ${msg.sender._id === user._id ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.sender._id === user._id ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold mt-2 mx-1 uppercase">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>
                                <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-50">
                                    <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-[24px] relative ring-2 ring-transparent focus-within:ring-brand-500/10 transition-all">
                                        <input
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value);
                                                if (!selectedUser.isGroup) socket.emit('typing', { recipientId: selectedUser._id });
                                            }}
                                            type="text"
                                            placeholder="Write a message..."
                                            className="flex-1 bg-transparent border-none text-sm p-3 focus:ring-0 font-medium placeholder:text-slate-400"
                                        />
                                        <button className="w-11 h-11 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg active:scale-95">
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Premium Bubble */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setUnreadCount(0);
                }}
                className={`w-16 h-16 rounded-full shadow-[0_15px_40px_rgba(99,102,241,0.3)] flex items-center justify-center transition-all duration-700 hover:scale-110 active:scale-95 relative group ${isOpen ? 'bg-slate-900 rotate-180' : 'bg-brand-600 hover:-translate-y-1'}`}
            >
                {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white fill-white/20" size={30} />}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white text-[11px] font-black rounded-full border-4 border-slate-50 flex items-center justify-center shadow-xl animate-bounce">
                        {unreadCount}
                    </span>
                )}
                <div className="absolute inset-0 rounded-[28px] bg-white/20 scale-0 group-hover:scale-100 transition-all duration-700"></div>
            </button>
        </div>
    );
};

export default ChatPanel;
