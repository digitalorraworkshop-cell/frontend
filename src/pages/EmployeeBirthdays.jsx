import React, { useState, useEffect, useContext } from 'react';
import { Gift, Calendar, PartyPopper, Send, X, Star, Users, User, LayoutGrid, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Confetti animation component for birthday today
const ConfettiEffect = () => (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        {[...Array(40)].map((_, i) => {
            const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
            const color = colors[i % colors.length];
            const left = `${Math.random() * 100}%`;
            const animationDuration = `${2 + Math.random() * 3}s`;
            const animationDelay = `${Math.random() * 2}s`;
            const size = `${6 + Math.random() * 10}px`;
            return (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        left,
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: i % 3 === 0 ? '50%' : '2px',
                        animation: `confettiFall ${animationDuration} ${animationDelay} ease-in forwards`,
                        opacity: 0,
                    }}
                />
            );
        })}
        <style>{`
            @keyframes confettiFall {
                0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `}</style>
    </div>
);

// Wish popup modal
const WishModal = ({ employee, onClose, onSent }) => {
    const [message, setMessage] = useState(`Happy Birthday ${employee.name}! Wishing you a wonderful day filled with joy and success! 🎉`);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            await api.post('/birthdays/wish', {
                recipientId: employee._id,
                message
            });
            toast.success(`🎉 Wish sent to ${employee.name}!`);
            if (onSent) onSent();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send wish');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
                    <X size={16} />
                </button>

                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">✨</div>
                    <h2 className="text-xl font-black text-slate-900">Send Birthday Wish</h2>
                    <p className="text-slate-400 text-sm mt-1">to <span className="font-bold text-slate-700">{employee.name}</span></p>
                </div>

                <textarea
                    rows={4}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 outline-none resize-none focus:border-purple-400 transition-all mb-5"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={sending}
                />

                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={16} /> Send Wish 🎊
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const getDobDisplay = (dob) => {
    const d = new Date(dob);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

const EmployeeBirthdays = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'wishes'
    const [birthdays, setBirthdays] = useState([]);
    const [receivedWishes, setReceivedWishes] = useState([]);
    const [sentWishes, setSentWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishTarget, setWishTarget] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const fetchBirthdays = async () => {
        try {
            const { data } = await api.get('/birthdays/upcoming?days=30');
            setBirthdays(data);
            if (data.some(b => b.isToday && b._id === user?._id)) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000);
            }
        } catch (err) {
            toast.error('Failed to load birthdays');
        }
    };

    const fetchWishes = async () => {
        try {
            const [receivedRes, sentRes] = await Promise.all([
                api.get('/birthdays/received'),
                api.get('/birthdays/sent')
            ]);
            setReceivedWishes(receivedRes.data);
            setSentWishes(sentRes.data);
        } catch (err) {
            console.error('Failed to load wishes');
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchBirthdays(), fetchWishes()]);
            setLoading(false);
        };
        init();
    }, [user?._id]);

    const handleSendReply = async (wishId) => {
        if (!replyMessage.trim()) return;
        setSendingReply(true);
        try {
            await api.put(`/birthdays/wish/${wishId}/reply`, { reply: replyMessage });
            toast.success('Reply sent! 🚀');
            setReplyMessage('');
            setReplyingTo(null);
            fetchWishes();
        } catch (err) {
            toast.error('Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    const todayBirthdays = birthdays.filter(b => b.isToday);
    const upcomingBirthdays = birthdays.filter(b => !b.isToday);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 font-sans pb-20">
            {showConfetti && <ConfettiEffect />}
            {wishTarget && <WishModal employee={wishTarget} onClose={() => setWishTarget(null)} onSent={fetchWishes} />}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 px-8 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Gift size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Birthdays</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Celebrate your team</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shadow-inner border border-slate-200/50">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'upcoming'
                                ? 'bg-white text-violet-600 shadow-md ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-white/50'
                                }`}
                        >
                            <LayoutGrid size={14} /> Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('wishes')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'wishes'
                                ? 'bg-white text-violet-600 shadow-md ring-1 ring-slate-200'
                                : 'text-slate-500 hover:bg-white/50'
                                }`}
                        >
                            <MessageSquare size={14} /> Wishes Wall
                            {receivedWishes.length > 0 && (
                                <span className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">
                                    {receivedWishes.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-10">
                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold">Loading birthdays...</p>
                    </div>
                )}

                {!loading && activeTab === 'upcoming' && (
                    <>
                        {birthdays.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 gap-5">
                                <div className="text-8xl">✨</div>
                                <h2 className="text-2xl font-black text-slate-700">No Upcoming Birthdays</h2>
                                <p className="text-slate-400 font-medium">No birthdays in the next 30 days. Check back soon!</p>
                            </div>
                        )}

                        {/* Today's Birthdays */}
                        {todayBirthdays.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <PartyPopper size={22} className="text-yellow-500" />
                                    <h2 className="text-xl font-black text-slate-900">🎉 Today's Birthdays!</h2>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black border border-yellow-200">
                                        {todayBirthdays.length} {todayBirthdays.length > 1 ? 'people' : 'person'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {todayBirthdays.map((emp, idx) => {
                                        const isSelf = emp._id === user?._id;
                                        return (
                                            <div
                                                key={emp._id}
                                                className={`relative overflow-hidden rounded-[32px] p-6 text-white shadow-2xl transition-all hover:scale-[1.02] ${isSelf
                                                    ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 shadow-indigo-500/30'
                                                    : 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 shadow-violet-500/30'
                                                    }`}
                                                style={{ animationDelay: `${idx * 0.1}s` }}
                                            >
                                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                                                <div className="relative flex items-center gap-4 mb-4">
                                                    <div className="relative">
                                                        {emp.profilePicture ? (
                                                            <img
                                                                src={`http://localhost:5001${emp.profilePicture}`}
                                                                alt={emp.name}
                                                                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-2 -right-2 text-2xl">🎉</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-black leading-tight">{isSelf ? "Happy Birthday, You!" : emp.name}</h3>
                                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">{emp.position || 'Employee'}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-300 text-yellow-300" />)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black backdrop-blur-sm border border-white/20">
                                                            TODAY
                                                        </div>
                                                        <p className="text-white/70 text-[10px] mt-2 font-bold">Turning {emp.age + 1}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between relative">
                                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                                            <Calendar size={14} />
                                                            <span className="font-bold">{getDobDisplay(emp.dateOfBirth)}</span>
                                                        </div>

                                                        {!isSelf ? (
                                                            sentWishes.some(w => w.recipient === emp._id) ? (
                                                                <div className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/20 backdrop-blur-md flex items-center gap-1.5">
                                                                    <Star size={12} className="fill-yellow-300 text-yellow-300" /> Wish Sent
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setWishTarget(emp)}
                                                                    className="px-5 py-2.5 bg-white text-violet-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-violet-50 transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
                                                                >
                                                                    <PartyPopper size={14} /> Wish Now
                                                                </button>
                                                            )
                                                        ) : (
                                                            <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/20 backdrop-blur-md">
                                                                My Birthday ✨
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Birthdays Section */}
                        {upcomingBirthdays.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <Calendar size={20} className="text-violet-500" />
                                    <h2 className="text-xl font-black text-slate-900">Coming Up</h2>
                                </div>

                                <div className="space-y-3">
                                    {upcomingBirthdays.map((emp) => {
                                        const isSelf = emp._id === user?._id;
                                        return (
                                            <div
                                                key={emp._id}
                                                className={`bg-white rounded-[24px] p-5 border shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col gap-4 ${isSelf ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${emp.daysLeft <= 3
                                                        ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                                                        : emp.daysLeft <= 7
                                                            ? 'bg-amber-50 text-amber-600 border-2 border-amber-200'
                                                            : 'bg-violet-50 text-violet-600 border-2 border-violet-100'
                                                        }`}>
                                                        <span className="text-xl leading-none">{emp.daysLeft}</span>
                                                        <span className="text-[9px] uppercase tracking-wider mt-0.5">
                                                            {emp.daysLeft === 1 ? 'day' : 'days'}
                                                        </span>
                                                    </div>

                                                    {emp.profilePicture ? (
                                                        <img
                                                            src={`http://localhost:5001${emp.profilePicture}`}
                                                            alt={emp.name}
                                                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                                                            {isSelf ? "My Birthday" : emp.name}
                                                            {isSelf && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[8px] uppercase tracking-tighter">You</span>}
                                                        </p>
                                                        <p className="text-slate-400 text-xs font-bold truncate">{emp.position || 'Employee'}</p>
                                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
                                                            <Calendar size={11} />
                                                            <span>{getDobDisplay(emp.dateOfBirth)}</span>
                                                        </div>
                                                    </div>

                                                    {!isSelf ? (
                                                        sentWishes.some(w => w.recipient === emp._id) ? (
                                                            <div className="flex-shrink-0 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black flex items-center gap-1">
                                                                <Star size={10} className="fill-emerald-500" /> Sent
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setWishTarget(emp)}
                                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-[10px] font-black hover:bg-violet-100 flex items-center gap-1.5"
                                                            >
                                                                <PartyPopper size={12} /> Wish
                                                            </button>
                                                        )
                                                    ) : (
                                                        <div className="flex-shrink-0 text-slate-300">
                                                            <Gift size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {!loading && activeTab === 'wishes' && (
                    <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <MessageSquare size={22} className="text-violet-500" />
                                <h2 className="text-xl font-black text-slate-900">Received Wishes</h2>
                            </div>
                            <div className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-xs font-black ring-1 ring-violet-200">
                                {receivedWishes.length} Messages
                            </div>
                        </div>

                        {receivedWishes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-lg font-black text-slate-700">No Wishes Yet</h3>
                                <p className="text-slate-400 text-sm font-medium">When colleagues send you wishes, they will appear here!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {receivedWishes.map((wish, idx) => (
                                    <div
                                        key={wish._id}
                                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col gap-4 relative overflow-hidden group"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50" />

                                        <div className="flex items-center gap-4 relative">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shadow-sm ring-2 ring-white">
                                                {wish.sender.profilePicture ? (
                                                    <img
                                                        src={`http://localhost:5001${wish.sender.profilePicture}`}
                                                        alt={wish.sender.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-500 text-xs font-black">
                                                        {wish.sender.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-900 text-sm">{wish.sender.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(wish.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="text-violet-400">
                                                <Star size={16} className="fill-violet-100" />
                                            </div>
                                        </div>

                                        <div className="relative bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{wish.message}"</p>
                                        </div>

                                        {/* Reply Section */}
                                        {wish.reply ? (
                                            <div className="mt-2 bg-violet-50/50 p-4 rounded-2xl border border-violet-100 flex gap-3 animate-in fade-in zoom-in duration-300">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-violet-500 shadow-sm flex-shrink-0">
                                                    <MessageSquare size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">My Reply</p>
                                                    <p className="text-sm text-slate-600 font-medium italic">"{wish.reply}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-auto pt-2">
                                                {replyingTo === wish._id ? (
                                                    <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                                                        <textarea
                                                            placeholder="Type your thank you note..."
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-violet-400 transition-all resize-none"
                                                            rows={2}
                                                            value={replyMessage}
                                                            onChange={e => setReplyMessage(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                disabled={sendingReply}
                                                                onClick={() => handleSendReply(wish._id)}
                                                                className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20 disabled:opacity-50"
                                                            >
                                                                {sendingReply ? 'Sending...' : 'Send Reply 🚀'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setReplyingTo(wish._id)}
                                                        className="flex items-center gap-2 group/reply text-[10px] font-black text-violet-500 uppercase tracking-widest hover:text-violet-700 transition-all"
                                                    >
                                                        <MessageSquare size={12} className="group-hover/reply:scale-110 transition-transform" />
                                                        Reply to {wish.sender.name.split(' ')[0]}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default EmployeeBirthdays;
