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
    { id: 'In-App Meeting', name: 'In-App Video Call', icon: '📹', desc: 'Auto-generate secure in-app meeting room' }
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
    const [platform, setPlatform] = useState(initialData.platform || 'In-App Meeting');
    const [customLink, setCustomLink] = useState('');
    const [location, setLocation] = useState(initialData.location || 'In-App Virtual Room');
    const [priority, setPriority] = useState(initialData.priority || 'Medium');
    const [reminderMinutes, setReminderMinutes] = useState(15);

    // Internal Participants Selection
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState(initialData.participants || []);
    const [employeeSearch, setEmployeeSearch] = useState('');

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
                platform: 'In-App Meeting',
                participants: selectedEmployees.map(empId => ({ user: empId, role: 'Participant' }))
            };

            const { data } = await api.post('/meetings', payload);
            toast.success(data.message || 'In-App Meeting scheduled successfully!');
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
                            <p className="text-xs text-slate-500 font-medium">Enterprise In-App Video Conferences</p>
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
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Meeting Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Q3 Sprint Planning"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                required
                            />
                        </div>

                    {/* Platform Selector */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">Meeting Platform</label>
                            <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                                ⚡ Secure In-App Meetings Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            <div className="p-3 rounded-2xl border border-brand-600 bg-brand-50/70 text-brand-900 shadow-sm ring-1 ring-brand-500 text-left transition-all">
                                <div className="text-lg mb-1">📹</div>
                                <p className="text-xs font-bold leading-tight">In-App Video Call</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Runs directly inside the dashboard</p>
                            </div>
                        </div>
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
                                                <img src={`${emp.profilePicture?.startsWith('http') ? emp.profilePicture : import.meta.env.VITE_API_URL + emp.profilePicture}`} alt="" className="w-full h-full object-cover" />
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
                        {submitting ? 'Scheduling...' : 'Schedule In-App Meeting'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMeetingModal;
