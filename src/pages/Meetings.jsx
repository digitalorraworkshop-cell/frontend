import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';
import {
    Video,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Search,
    Filter,
    Users,
    Building,
    CheckCircle2,
    XCircle,
    X,
    Copy,
    ExternalLink,
    ChevronRight,
    Sparkles,
    CalendarCheck,
    Globe,
    Settings,
    MoreHorizontal,
    Tag,
    Briefcase,
    AlertCircle
} from 'lucide-react';
import ScheduleMeetingModal from '../components/meetings/ScheduleMeetingModal';
import MeetingDetailsModal from '../components/meetings/MeetingDetailsModal';
import GoogleConnectModal from '../components/meetings/GoogleConnectModal';

const Meetings = () => {
    const { user } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [timelineMeetings, setTimelineMeetings] = useState([]);
    const [stats, setStats] = useState({
        todayCount: 0,
        upcomingCount: 0,
        completedCount: 0,
        clientCount: 0,
        pendingInvites: 0
    });
    const [loading, setLoading] = useState(true);

    // View state: 'list', 'timeline', 'calendar'
    const [viewMode, setViewMode] = useState('list');
    const [activeTab, setActiveTab] = useState('all'); // all, today, upcoming, client, team, completed, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Calendar state
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    // Modals
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    // In-App Meeting State
    const [activeMeetingLink, setActiveMeetingLink] = useState(null);

    useEffect(() => {
        fetchMeetings();
        fetchStats();
        fetchTimeline();

        // High speed real-time meeting updates
        const socket = api.getSocket ? api.getSocket() : null;
        const handleRefresh = () => {
            fetchMeetings();
            fetchStats();
            fetchTimeline();
        };

        if (socket) {
            socket.on('newMeeting', handleRefresh);
            socket.on('meetingUpdated', handleRefresh);
            socket.on('meetingCancelled', handleRefresh);
            return () => {
                socket.off('newMeeting', handleRefresh);
                socket.off('meetingUpdated', handleRefresh);
                socket.off('meetingCancelled', handleRefresh);
            };
        }
    }, [activeTab, typeFilter]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (activeTab !== 'all') params.append('filter', activeTab);
            if (typeFilter !== 'all') params.append('meetingType', typeFilter);
            if (searchTerm.trim()) params.append('search', searchTerm.trim());

            const { data } = await api.get(`/meetings?${params.toString()}`);
            setMeetings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn('[MEETINGS-FETCH-WARN]', e.message);
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/meetings/stats');
            setStats(data || { todayCount: 0, upcomingCount: 0, completedCount: 0, clientCount: 0, pendingInvites: 0 });
        } catch (e) {
            console.warn('[MEETINGS-STATS-WARN]', e.message);
        }
    };

    const fetchTimeline = async () => {
        try {
            const { data } = await api.get('/meetings/today-timeline');
            setTimelineMeetings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn('[MEETINGS-TIMELINE-WARN]', e.message);
            setTimelineMeetings([]);
        }
    };

    const handleOpenDetails = (meetingId) => {
        setSelectedMeetingId(meetingId);
        setIsDetailsOpen(true);
    };

    const handleCopyLink = (e, link) => {
        e.stopPropagation();
        if (link) {
            navigator.clipboard.writeText(link);
            toast.success('Meeting link copied!');
        } else {
            toast.error('No meeting link available');
        }
    };

    const handleJoinMeeting = (e, m) => {
        e.stopPropagation();
        e.preventDefault();
        
        let link = m.meetingLink;
        if (!link) return;

        // Force all Google Meet links (including previously generated ones) to open as in-app Jitsi meetings
        if (link.includes('meet.google.com/')) {
            const code = link.split('meet.google.com/')[1].split('?')[0];
            link = `https://meet.jit.si/Tracker_${code.replace(/-/g, '')}`;
        }

        // Always open in the app
        setActiveMeetingLink(link);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchMeetings();
    };

    const getMeetingTypeBadgeColor = (type) => {
        switch (type) {
            case 'Client Meeting': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Employee Meeting':
            case 'One-to-One': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Team Meeting':
            case 'Department Meeting': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Interview': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Project Meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Completed</span>;
            case 'In Progress': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">In Progress</span>;
            case 'Cancelled': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Cancelled</span>;
            case 'Rescheduled': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Rescheduled</span>;
            default: return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Scheduled</span>;
        }
    };

    return (
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header Title & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
                            <Video size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Meetings & Google Meet</h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Enterprise Video Conferences • Real Google Meet Integration • Client & Team Sessions
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsGoogleModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                    >
                        <Settings size={16} className="text-slate-500" />
                        Google Calendar Settings
                    </button>

                    <button
                        onClick={() => setIsScheduleOpen(true)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                    >
                        <Plus size={16} /> Schedule Meeting
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div 
                    onClick={() => { setActiveTab('today'); setViewMode('list'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'today' ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-white border-slate-100 hover:shadow-md'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Today's Schedule</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{stats.todayCount || 0}</h3>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">Sessions Today</p>
                </div>

                <div 
                    onClick={() => { setActiveTab('upcoming'); setViewMode('list'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'upcoming' ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-white border-slate-100 hover:shadow-md'}`}
                >
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Upcoming</span>
                    <h3 className="text-2xl font-black text-slate-900">{stats.upcomingCount || 0}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Scheduled Ahead</p>
                </div>

                <div 
                    onClick={() => { setActiveTab('client'); setViewMode('list'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'client' ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-white border-slate-100 hover:shadow-md'}`}
                >
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Client Discussions</span>
                    <h3 className="text-2xl font-black text-emerald-700">{stats.clientCount || 0}</h3>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">External Guests</p>
                </div>

                <div 
                    onClick={() => { setActiveTab('completed'); setViewMode('list'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-white border-slate-100 hover:shadow-md'}`}
                >
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Completed</span>
                    <h3 className="text-2xl font-black text-indigo-700">{stats.completedCount || 0}</h3>
                    <p className="text-[11px] font-bold text-indigo-600 mt-1">Action Items Done</p>
                </div>

                <div 
                    onClick={() => { setActiveTab('invited'); setViewMode('list'); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'invited' ? 'bg-brand-50 border-brand-500 shadow-md ring-1 ring-brand-500' : 'bg-white border-slate-100 hover:shadow-md'}`}
                >
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Pending RSVPs</span>
                    <h3 className="text-2xl font-black text-amber-600">{stats.pendingInvites || 0}</h3>
                    <p className="text-[11px] font-bold text-amber-600 mt-1">Requires Response</p>
                </div>
            </div>

            {/* Navigation Switcher & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* View Mode Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        📋 List View
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        ⏱️ Today's Timeline ({timelineMeetings.length})
                    </button>
                </div>

                {/* Search & Category Filter */}
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search meetings, clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium w-60 focus:ring-2 focus:ring-brand-500/20"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    >
                        <option value="all">All Meeting Types</option>
                        <option value="Client Meeting">Client Meetings</option>
                        <option value="Team Meeting">Team Meetings</option>
                        <option value="Employee Meeting">Employee Meetings</option>
                        <option value="One-to-One">One-to-One</option>
                        <option value="Project Meeting">Project Meetings</option>
                        <option value="HR Meeting">HR & Interviews</option>
                    </select>
                </form>
            </div>

            {/* View Mode 1: TODAY'S TIMELINE */}
            {viewMode === 'timeline' && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Today's Chronological Schedule</h3>
                            <p className="text-xs text-slate-500 font-medium">Click Join Google Meet to launch your session directly in a new tab</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    {timelineMeetings.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-xs font-bold">
                            No meetings scheduled for today yet.
                            <button
                                onClick={() => setIsScheduleOpen(true)}
                                className="block mx-auto mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs"
                            >
                                + Schedule Today's Meeting
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
                            {timelineMeetings.map((m) => (
                                <div key={m._id} className="relative flex items-start gap-4 pl-12 group">
                                    <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-brand-600 border-4 border-white shadow-md"></div>
                                    <div 
                                        onClick={() => handleOpenDetails(m._id)}
                                        className="flex-1 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200 p-5 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-100">
                                                    {m.startTime} - {m.endTime}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMeetingTypeBadgeColor(m.meetingType)}`}>
                                                    {m.meetingType}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">{m.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {m.relatedClient ? `Client: ${m.relatedClient} • ` : ''}
                                                Organizer: {m.organizer?.name || 'Admin'} • {m.participants?.length || 1} Participants
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {m.meetingLink && (
                                                <button
                                                    onClick={(e) => handleJoinMeeting(e, m)}
                                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-brand-600/20 active:scale-95"
                                                >
                                                    <Video size={14} /> JOIN
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenDetails(m._id)}
                                                className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50"
                                            >
                                                Details →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* View Mode 2: LIST VIEW */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 custom-scrollbar">
                        {[
                            { id: 'all', label: 'All Sessions' },
                            { id: 'today', label: "Today" },
                            { id: 'upcoming', label: 'Upcoming' },
                            { id: 'client', label: 'Client Meetings' },
                            { id: 'team', label: 'Team Sessions' },
                            { id: 'completed', label: 'Completed' },
                            { id: 'cancelled', label: 'Cancelled' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                                    activeTab === tab.id
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Meetings List */}
                    {loading ? (
                        <div className="py-16 text-center text-slate-400 text-xs font-bold animate-pulse">
                            Loading meetings and Google Meet conferences...
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-xs font-bold">
                            No meetings found under this filter.
                            <button
                                onClick={() => setIsScheduleOpen(true)}
                                className="block mx-auto mt-3 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs"
                            >
                                + Schedule First Meeting
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {meetings.map(m => (
                                <div
                                    key={m._id}
                                    onClick={() => handleOpenDetails(m._id)}
                                    className="p-5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
                                >
                                    {/* Left: Meeting Info */}
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getMeetingTypeBadgeColor(m.meetingType)}`}>
                                                {m.meetingType}
                                            </span>
                                            {getStatusBadge(m.status)}
                                            {m.priority === 'Urgent' && (
                                                <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                                    🔥 Urgent
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                                            {m.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <CalendarIcon size={13} className="text-brand-600" />
                                                {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <Clock size={13} className="text-slate-400" />
                                                {m.startTime} - {m.endTime} ({m.timezone || 'IST'})
                                            </span>
                                            {m.relatedClient && (
                                                <span className="flex items-center gap-1.5 text-slate-700">
                                                    <Building size={13} className="text-emerald-600" />
                                                    Client: <span className="font-bold">{m.relatedClient}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Participant Avatars & Actions */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        {/* Avatars */}
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {m.participants?.slice(0, 4).map((p, i) => (
                                                <div
                                                    key={i}
                                                    title={p.user?.name || 'User'}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden"
                                                >
                                                    {p.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            ))}
                                            {(m.participants?.length > 4 || m.externalGuests?.length > 0) && (
                                                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                                                    +{((m.participants?.length || 0) + (m.externalGuests?.length || 0)) - 4}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {m.meetingLink && m.status !== 'Cancelled' && (
                                                <button
                                                    onClick={(e) => handleJoinMeeting(e, m)}
                                                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-brand-600/20 active:scale-95"
                                                >
                                                    <Video size={14} /> JOIN
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => handleCopyLink(e, m.meetingLink)}
                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleOpenDetails(m._id)}
                                                className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <ScheduleMeetingModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onMeetingScheduled={() => {
                    fetchMeetings();
                    fetchStats();
                    fetchTimeline();
                }}
            />

            <MeetingDetailsModal
                isOpen={isDetailsOpen}
                meetingId={selectedMeetingId}
                onJoinMeeting={handleJoinMeeting}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedMeetingId(null);
                }}
                onMeetingUpdated={() => {
                    fetchMeetings();
                    fetchStats();
                    fetchTimeline();
                }}
            />

            <GoogleConnectModal
                isOpen={isGoogleModalOpen}
                onClose={() => setIsGoogleModalOpen(false)}
                onConnected={() => {
                    toast.success('Google Calendar connected successfully!');
                    setIsGoogleModalOpen(false);
                }}
            />

            {/* In-App Meeting Overlay */}
            {activeMeetingLink && (
                <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
                                <Video size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">Secure In-App Video Call</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Powered by Jitsi Meet (End-to-End Encrypted)</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveMeetingLink(null)}
                            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 active:scale-95"
                        >
                            <X size={16} strokeWidth={3} /> Leave Call
                        </button>
                    </div>
                    <div className="flex-1 bg-[#1c1d22] relative">
                        <iframe 
                            src={`${activeMeetingLink}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(user?.name || '')}"`}
                            allow="camera; microphone; display-capture; autoplay; clipboard-write"
                            className="w-full h-full border-0 absolute inset-0"
                            title="Meeting Room"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;
