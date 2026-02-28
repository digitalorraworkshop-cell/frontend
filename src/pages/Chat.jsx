import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import { Send, Image, Paperclip, Check, CheckCheck, MoreVertical, Search, Smile } from 'lucide-react';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [recipientTyping, setRecipientTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGroupMode, setIsGroupMode] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const scrollRef = useRef();
    const socket = getSocket();

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
            api.post('/chat/mark-read', {
                senderId: selectedUser.isGroup ? null : selectedUser._id,
                groupId: selectedUser.isGroup ? selectedUser._id : null
            }).catch(console.error);
        }
    }, [selectedUser, page]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        fetchConversations();

        if (socket) {
            socket.on('receiveMessage', (message) => {
                if (selectedUser && (message.sender._id === selectedUser._id || message.recipient?._id === selectedUser._id)) {
                    setMessages(prev => [...prev, message]);
                    if (message.sender._id === selectedUser._id) {
                        socket.emit('messageSeen', { messageId: message._id, senderId: message.sender._id });
                    }
                }
                // Update conversation list
                fetchConversations();
            });

            socket.on('typing', (data) => {
                if (selectedUser && data.userId === selectedUser._id) {
                    setRecipientTyping(true);
                }
            });

            socket.on('stopTyping', (data) => {
                if (selectedUser && data.userId === selectedUser._id) {
                    setRecipientTyping(false);
                }
            });

            return () => {
                socket.off('receiveMessage');
                socket.off('typing');
                socket.off('stopTyping');
            };
        }
    }, [selectedUser, socket]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Fetch conversations failed:', err);
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

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const messageData = {
            recipientId: selectedUser.isGroup ? null : selectedUser._id,
            groupId: selectedUser.isGroup ? selectedUser._id : null,
            message: newMessage,
            isGroup: selectedUser.isGroup
        };

        socket.emit('sendMessage', messageData);
        setNewMessage('');
        if (!selectedUser.isGroup) {
            socket.emit('stopTyping', { recipientId: selectedUser._id });
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!selectedUser.isGroup) {
            if (!isTyping) {
                setIsTyping(true);
                socket.emit('typing', { recipientId: selectedUser._id });
            }

            // De-bounce stop typing
            clearTimeout(window.typingTimeout);
            window.typingTimeout = setTimeout(() => {
                setIsTyping(false);
                socket.emit('stopTyping', { recipientId: selectedUser._id });
            }, 2000);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-500">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex gap-2 p-4 bg-white sticky top-0 z-10">
                        <button
                            onClick={() => setIsGroupMode(false)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${!isGroupMode ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            Private
                        </button>
                        <button
                            onClick={() => setIsGroupMode(true)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${isGroupMode ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            Groups
                        </button>
                    </div>
                    {conversations.filter(c => isGroupMode ? c.isGroup : !c.isGroup)
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(conv => (
                            <div
                                key={conv._id}
                                onClick={() => setSelectedUser(conv)}
                                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white transition-all border-l-4 ${selectedUser?._id === conv._id ? 'border-brand-500 bg-white shadow-sm' : 'border-transparent'}`}
                            >
                                <div className="relative">
                                    <img src={conv.profilePicture ? (conv.profilePicture.startsWith('http') ? conv.profilePicture : `http://localhost:5001${conv.profilePicture}`) : `https://ui-avatars.com/api/?name=${conv.name}`} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                                    {!conv.isGroup && (
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conv.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{conv.name}</h4>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {conv.lastMessage || conv.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Chat Window */}
            {selectedUser ? (
                <div className="flex-1 flex flex-col bg-white">
                    {/* Top Bar */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.name}`} className="w-10 h-10 rounded-xl" alt="" />
                            <div>
                                <h4 className="font-black text-slate-900 leading-tight">{selectedUser.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {recipientTyping ? 'Typing...' : (selectedUser.isOnline ? 'Online' : 'Offline')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <Search size={20} className="cursor-pointer hover:text-brand-500" />
                            <MoreVertical size={20} className="cursor-pointer hover:text-brand-500" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50"
                    >
                        {hasMore && (
                            <div className="text-center py-2">
                                <button onClick={() => setPage(p => p + 1)} className="text-[10px] text-brand-500 font-bold hover:underline">Load older messages</button>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-4 rounded-3xl text-sm shadow-sm ${msg.sender._id === user._id
                                    ? 'bg-brand-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                                    }`}>
                                    <p className="leading-relaxed">{msg.message}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender._id === user._id ? 'text-white/70' : 'text-slate-400'}`}>
                                        <span className="text-[10px] font-bold">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.sender._id === user._id && (
                                            msg.isSeen ? <CheckCheck size={14} /> : <Check size={14} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-3xl">
                            <button type="button" className="p-2 text-slate-400 hover:text-brand-500 transition-colors">
                                <Smile size={22} />
                            </button>
                            <button type="button" className="p-2 text-slate-400 hover:text-brand-500 transition-colors">
                                <Paperclip size={22} />
                            </button>
                            <input
                                value={newMessage}
                                onChange={handleTyping}
                                type="text"
                                placeholder="Type your message here..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
                            />
                            <button
                                type="submit"
                                className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-brand-600/30 transition-all active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Send size={40} className="text-slate-100" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs">Select a user to start chatting</p>
                </div>
            )}
        </div>
    );
};

export default Chat;
