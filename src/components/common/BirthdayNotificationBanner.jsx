import React, { useState, useEffect, useContext } from 'react';
import { X, PartyPopper } from 'lucide-react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

/**
 * BirthdayNotificationBanner
 * Shows a dismissible animated banner if ANY employee has a birthday today.
 * Also shows a "Your birthday is today!" confetti popup if it's the logged-in user's own birthday.
 */
const BirthdayNotificationBanner = () => {
    const { user } = useContext(AuthContext);
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [dismissed, setDismissed] = useState(false);
    const [isOwnBirthday, setIsOwnBirthday] = useState(false);

    useEffect(() => {
        const fetchTodayBirthdays = async () => {
            try {
                const { data } = await api.get('/birthdays/upcoming?days=0');
                const todays = data.filter(b => b.isToday);
                setTodayBirthdays(todays);

                // Check if logged-in user has birthday today
                if (user?.dateOfBirth) {
                    const now = new Date();
                    const dob = new Date(user.dateOfBirth);
                    if (dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate()) {
                        setIsOwnBirthday(true);
                    }
                }
            } catch {
                // silently fail
            }
        };
        fetchTodayBirthdays();
    }, [user]);

    if (dismissed || todayBirthdays.length === 0) return null;

    return (
        <>
            {/* Animated confetti dots if user's own birthday */}
            {isOwnBirthday && (
                <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
                    {[...Array(30)].map((_, i) => {
                        const colors = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
                        return (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: `${Math.random() * 100}%`,
                                    width: `${6 + Math.random() * 8}px`,
                                    height: `${6 + Math.random() * 8}px`,
                                    backgroundColor: colors[i % colors.length],
                                    borderRadius: i % 3 === 0 ? '50%' : '2px',
                                    animation: `confettiDrop ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-in forwards`,
                                    opacity: 0,
                                }}
                            />
                        );
                    })}
                    <style>{`@keyframes confettiDrop { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }`}</style>
                </div>
            )}

            {/* Banner */}
            <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
                <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-[24px] p-5 shadow-2xl shadow-violet-500/40 text-white animate-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-3 right-3 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                        <X size={14} />
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <PartyPopper size={24} />
                        <div>
                            <p className="font-black text-sm">
                                {isOwnBirthday ? '🎉 Happy Birthday to You!' : "🎉 Today's Birthdays!"}
                            </p>
                            <p className="text-white/70 text-xs font-medium">
                                {isOwnBirthday ? 'Wishing you a wonderful day!' : `${todayBirthdays.length} colleague${todayBirthdays.length > 1 ? 's' : ''} celebrating today`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {todayBirthdays.slice(0, 3).map(emp => (
                            <div key={emp._id} className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                                {emp.profilePicture ? (
                                    <img src={`${import.meta.env.VITE_API_URL}${emp.profilePicture}`} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black">
                                        {emp.name.charAt(0)}
                                    </div>
                                )}
                                <p className="text-xs font-black">{emp.name}</p>
                                <span className="ml-auto text-[10px] text-white/60">🎈 Today!</span>
                            </div>
                        ))}
                        {todayBirthdays.length > 3 && (
                            <p className="text-center text-white/60 text-xs">+{todayBirthdays.length - 3} more</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BirthdayNotificationBanner;
