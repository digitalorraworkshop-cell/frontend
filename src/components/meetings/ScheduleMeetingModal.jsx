import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import {
    X,
    Calendar,
    Clock,
    Video,
    Users,
    UserPlus,
    Trash2,
    Shield,
    FileText,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    Globe,
    Building,
    Briefcase,
    Tag
} from 'lucide-react';

const TIMEZONES = [
    { label: 'IST (UTC+5:30) - India', value: 'IST (UTC+5:30)' },
    { label: 'EST (UTC-5:00) - US East (New York)', value: 'EST (UTC-5:00)' },
    { label: 'PST (UTC-8:00) - US West (California)', value: 'PST (UTC-8:00)' },
    { label: 'CST (UTC-6:00) - US Central (Chicago)', value: 'CST (UTC-6:00)' },
    { label: 'GMT / BST (UTC+0/1:00) - United Kingdom', value: 'GMT (UTC+0:00)' },
    { label: 'CET (UTC+1:00) - Europe (Berlin/Paris)', value: 'CET (UTC+1:00)' },
    { label: 'AEST (UTC+10:00) - Australia (Sydney)', value: 'AEST (UTC+10:00)' },
    { label: 'SGT (UTC+8:00) - Singapore / Dubai (UTC+4)', value: 'SGT (UTC+8:00)' }
];

const MEETING_TYPES = [
    'Employee Meeting',
    'Client Meeting',
    'Team Meeting',
    'Project Meeting',
    'HR Meeting',
    'Interview',
    'One-to-One',
    'Department Meeting',
    'Management Meeting',
    'External Meeting',
    'Custom Meeting'
];

const PLATFORMS = [
    { id: 'Google Meet', name: 'Google Meet', icon: '📹', desc: 'Auto-generate Google Meet conference link' },
    { id: 'Microsoft Teams', name: 'Microsoft Teams', icon: '💼', desc: 'Teams conference room' },
    { id: 'Zoom', name: 'Zoom Meeting', icon: '🎥', desc: 'Zoom cloud video session' },
    { id: 'Custom Meeting Link', name: 'Custom URL', icon: '🔗', desc: 'Provide your own video link' },
    { id: 'In-Person / Physical Location', name: 'In-Person', icon: '🏢', desc: 'Office or physical conference room' }
];

const ScheduleMeetingModal = ({ isOpen, onClose, onMeetingScheduled, initialData = {} }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [meetingType, setMeetingType] = useState(initialData.meetingType || 'Team Meeting');
    const [description, setDescription] = useState(initialData.description || '');
    const [agenda, setAgenda] = useState(initialData.agenda || '');
    const [date, setDate] = useState(initialData.date || new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState(initialData.startTime || '11:00');
    const [endTime, setEndTime] = useState(initialData.endTime || '12:00');
    const [timezone, setTimezone] = useState(initialData.timezone || 'IST (UTC+5:30)');
    const [platform, setPlatform] = useState(initialData.platform || 'Google Meet');
    const [customLink, setCustomLink] = useState('');
    const [location, setLocation] = useState(initialData.location || 'Google Meet Virtual Room');
    const [priority, setPriority] = useState(initialData.priority || 'Medium');
    const [reminderMinutes, setReminderMinutes] = useState(15);

    // Relations
    const [relatedClient, setRelatedClient] = useState(initialData.relatedClient || '');
    const [clientEmail, setClientEmail] = useState(initialData.clientEmail || '');
    const [relatedProject, setRelatedProject] = useState(initialData.relatedProject || '');

    // Internal Participants Selection
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState(initialData.participants || []);
    const [employeeSearch, setEmployeeSearch] = useState('');

    // External Guests
    const [externalGuests, setExternalGuests] = useState(initialData.externalGuests || []);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestCompany, setGuestCompany] = useState('');

    // Google Calendar Status
    const [googleStatus, setGoogleStatus] = useState({ isConnected: false, isConfiguredOnServer: false });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEmployees();
            fetchGoogleStatus();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/employees');
            setEmployees(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load employees for meeting', e);
        }
    };

    const fetchGoogleStatus = async () => {
        try {
            const { data } = await api.get('/meetings/google-status');
            setGoogleStatus(data);
        } catch (e) {
            // non-blocking
        }
    };

    const handleAddGuest = (e) => {
        e.preventDefault();
        if (!guestEmail.trim()) {
            toast.error('Please enter a valid guest email');
            return;
        }
        setExternalGuests(prev => [
            ...prev,
            {
                name: guestName.trim() || guestEmail.split('@')[0],
                email: guestEmail.trim().toLowerCase(),
                company: guestCompany.trim()
            }
        ]);
        setGuestName('');
        setGuestEmail('');
        setGuestCompany('');
    };

    const handleRemoveGuest = (index) => {
        setExternalGuests(prev => prev.filter((_, i) => i !== index));
    };

    const toggleEmployeeSelect = (empId) => {
        setSelectedEmployees(prev => {
            if (prev.includes(empId)) {
                return prev.filter(id => id !== empId);
            } else {
                return [...prev, empId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Please enter a meeting title');
            return;
        }
        if (!date || !startTime || !endTime) {
            toast.error('Date, start time, and end time are required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                meetingType,
                description,
                agenda,
                date,
                startTime,
                endTime,
                timezone,
                platform,
                customLink,
                location,
                priority,
                reminderMinutes: Number(reminderMinutes),
                relatedProject,
                relatedClient,
                clientEmail,
                participants: selectedEmployees.map(empId => ({ user: empId, role: 'Participant' })),
                externalGuests
            };

            const { data } = await api.post('/meetings', payload);
            toast.success(data.message || 'Meeting scheduled successfully with Google Meet!');
            if (onMeetingScheduled) onMeetingScheduled(data.meeting);
            onClose();
        } catch (error) {
            console.error('Schedule meeting error', error);
            toast.error(error.response?.data?.message || 'Failed to schedule meeting');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.position?.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                            <Video size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Schedule New Meeting</h2>
                            <p className="text-xs text-slate-500 font-medium">Enterprise Google Meet & Client Video Conferences</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Form Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                    {/* Title & Meeting Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Meeting Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Q3 Sprint Planning / Client Project Kickoff"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Meeting Category *</label>
                            <select
                                value={meetingType}
                                onChange={(e) => setMeetingType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                            >
                                {MEETING_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Platform Selector */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">Meeting Platform</label>
                            {googleStatus.isConnected ? (
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 size={13} /> Google Calendar Connected ({googleStatus.googleEmail})
                                </span>
                            ) : (
                                <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                                    ⚡ Real Google Meet Links Active
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                            {PLATFORMS.map(p => {
                                const isSelected = platform === p.id;
                                return (
                                    <button
                                        type="button"
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            isSelected
                                                ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-sm ring-1 ring-brand-500'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <div className="text-lg mb-1">{p.icon}</div>
                                        <p className="text-xs font-bold leading-tight">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {platform === 'Custom Meeting Link' && (
                            <div className="pt-2">
                                <input
                                    type="url"
                                    placeholder="Enter your custom meeting URL (https://...)"
                                    value={customLink}
                                    onChange={(e) => setCustomLink(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                        )}
                    </div>

                    {/* Date, Time, Timezone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Calendar size={14} className="text-brand-600" /> Date *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock size={14} className="text-brand-600" /> Start Time *
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock size={14} className="text-slate-400" /> End Time *
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Globe size={14} className="text-brand-600" /> Timezone
                            </label>
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
                            >
                                {TIMEZONES.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Client & Project Relations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Building size={14} className="text-slate-400" /> Client / Company Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. ABC Technologies Pvt Ltd"
                                value={relatedClient}
                                onChange={(e) => setRelatedClient(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Briefcase size={14} className="text-slate-400" /> Client Primary Email
                            </label>
                            <input
                                type="email"
                                placeholder="client@company.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Tag size={14} className="text-slate-400" /> Associated Project
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Mobile App Redesign"
                                value={relatedProject}
                                onChange={(e) => setRelatedProject(e.target.value)}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                            />
                        </div>
                    </div>

                    {/* Internal Employees Multi-Select */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <Users size={16} className="text-brand-600" />
                                Select Internal Participants ({selectedEmployees.length} selected)
                            </label>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={employeeSearch}
                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none w-44"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                            {filteredEmployees.map(emp => {
                                const isSelected = selectedEmployees.includes(emp._id);
                                return (
                                    <div
                                        key={emp._id}
                                        onClick={() => toggleEmployeeSelect(emp._id)}
                                        className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-brand-50/80 border-brand-500 text-brand-900 shadow-sm'
                                                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                                            {emp.profilePicture ? (
                                                <img src={`${import.meta.env.VITE_API_URL}${emp.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                emp.name?.charAt(0)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold truncate leading-tight">{emp.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{emp.position || emp.role || 'Employee'}</p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'}`}>
                                            {isSelected && '✓'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* External Guests / Client Participants */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus size={16} className="text-emerald-600" />
                            External Guests & Client Participants
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <input
                                type="text"
                                placeholder="Guest Name"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="flex-1 min-w-[140px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                            />
                            <input
                                type="email"
                                placeholder="guest@client.com *"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="flex-1 min-w-[180px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Company (Optional)"
                                value={guestCompany}
                                onChange={(e) => setGuestCompany(e.target.value)}
                                className="flex-1 min-w-[120px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddGuest}
                                className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                            >
                                + Add Guest
                            </button>
                        </div>

                        {externalGuests.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {externalGuests.map((g, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-medium">
                                        <span>{g.name} ({g.email})</span>
                                        {g.company && <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-bold">{g.company}</span>}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGuest(idx)}
                                            className="text-emerald-500 hover:text-rose-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Agenda & Description */}
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Agenda & Key Discussion Topics</label>
                            <textarea
                                rows={3}
                                placeholder="• Review quarterly deliverables&#10;• Client feedback & next steps&#10;• Task allocation & timeline confirmation"
                                value={agenda}
                                onChange={(e) => setAgenda(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Meeting Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                                >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                    <option value="Urgent">Urgent / Critical</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Reminder Notification</label>
                                <select
                                    value={reminderMinutes}
                                    onChange={(e) => setReminderMinutes(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                                >
                                    <option value={5}>5 minutes before</option>
                                    <option value={10}>10 minutes before</option>
                                    <option value={15}>15 minutes before (Recommended)</option>
                                    <option value={30}>30 minutes before</option>
                                    <option value={60}>1 hour before</option>
                                    <option value={1440}>1 day before</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Video size={16} />
                        {submitting ? 'Generating Meet & Scheduling...' : 'Schedule & Generate Google Meet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMeetingModal;
