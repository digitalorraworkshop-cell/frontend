import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';
import {
    X,
    Video,
    Calendar,
    Clock,
    Globe,
    Users,
    UserPlus,
    Building,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Copy,
    ExternalLink,
    Send,
    Plus,
    FileText,
    CheckSquare,
    Save,
    Share2,
    Edit3,
    Trash2,
    Sparkles,
    Shield
} from 'lucide-react';

const MeetingDetailsModal = ({ isOpen, onClose, meetingId, onMeetingUpdated, onJoinMeeting }) => {
    const { user } = useContext(AuthContext);
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);

    // Notes state
    const [notes, setNotes] = useState('');
    const [decisions, setDecisions] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    // Action item form state
    const [showActionItemForm, setShowActionItemForm] = useState(false);
    const [actionTitle, setActionTitle] = useState('');
    const [actionAssignee, setActionAssignee] = useState('');
    const [actionDueDate, setActionDueDate] = useState('');
    const [actionPriority, setActionPriority] = useState('Medium');
    const [creatingAction, setCreatingAction] = useState(false);

    // Cancel modal state
    const [showCancelPrompt, setShowCancelPrompt] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (isOpen && meetingId) {
            fetchMeetingDetails();
        }
    }, [isOpen, meetingId]);

    const fetchMeetingDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/meetings/${meetingId}`);
            setMeeting(data);
            setNotes(data.meetingNotes || '');
            setDecisions(data.decisions || '');
        } catch (error) {
            toast.error('Failed to load meeting details');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (meeting?.meetingLink) {
            navigator.clipboard.writeText(meeting.meetingLink);
            toast.success('Meeting link copied to clipboard!');
        } else {
            toast.error('No meeting link available');
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await api.post(`/meetings/${meetingId}/notes`, {
                notes,
                decisions
            });
            toast.success('Meeting notes and decisions saved!');
            fetchMeetingDetails();
            if (onMeetingUpdated) onMeetingUpdated();
        } catch (e) {
            toast.error('Failed to save meeting notes');
        } finally {
            setSavingNotes(false);
        }
    };

    const handleCreateActionItem = async (e) => {
        e.preventDefault();
        if (!actionTitle.trim()) {
            toast.error('Action item title is required');
            return;
        }

        setCreatingAction(true);
        try {
            await api.post(`/meetings/${meetingId}/action-items`, {
                title: actionTitle.trim(),
                assignedTo: actionAssignee || undefined,
                dueDate: actionDueDate || undefined,
                priority: actionPriority,
                createTask: true
            });
            toast.success('Action item created & linked with CRM Tasks!');
            setActionTitle('');
            setActionAssignee('');
            setShowActionItemForm(false);
            fetchMeetingDetails();
            if (onMeetingUpdated) onMeetingUpdated();
        } catch (e) {
            toast.error('Failed to create action item');
        } finally {
            setCreatingAction(false);
        }
    };

    const handleRSVP = async (status) => {
        try {
            await api.post(`/meetings/${meetingId}/invitation-response`, { status });
            toast.success(`RSVP updated: ${status}`);
            fetchMeetingDetails();
            if (onMeetingUpdated) onMeetingUpdated();
        } catch (e) {
            toast.error('Failed to update RSVP');
        }
    };

    const handleSendInvitations = async () => {
        try {
            await api.post(`/meetings/${meetingId}/send-invitations`);
            toast.success('Invitations and Google Meet link dispatched!');
            fetchMeetingDetails();
        } catch (e) {
            toast.error('Failed to send invitations');
        }
    };

    const handleCompleteMeeting = async () => {
        try {
            await api.put(`/meetings/${meetingId}/complete`, {
                meetingNotes: notes,
                decisions
            });
            toast.success('Meeting marked as Completed!');
            fetchMeetingDetails();
            if (onMeetingUpdated) onMeetingUpdated();
        } catch (e) {
            toast.error('Failed to complete meeting');
        }
    };

    const handleCancelMeeting = async () => {
        try {
            await api.put(`/meetings/${meetingId}/cancel`, {
                reason: cancelReason || 'Meeting cancelled by organizer'
            });
            toast.success('Meeting has been cancelled');
            setShowCancelPrompt(false);
            fetchMeetingDetails();
            if (onMeetingUpdated) onMeetingUpdated();
        } catch (e) {
            toast.error('Failed to cancel meeting');
        }
    };

    if (!isOpen) return null;

    const myParticipantRecord = meeting?.participants?.find(p => p.user?._id === user?._id || p.user === user?._id);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header Bar */}
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                            <Video size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                                    {meeting?.meetingType || 'Meeting'}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    meeting?.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                    meeting?.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200 animate-pulse' :
                                    meeting?.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {meeting?.status || 'Scheduled'}
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">{meeting?.title || 'Meeting Details'}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm font-bold animate-pulse">
                        Loading Meeting Details & Google Meet Conference...
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                        {/* Prominent JOIN GOOGLE MEET Banner */}
                        {meeting?.status !== 'Cancelled' && (
                            <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">📹</span>
                                        <h3 className="text-lg font-black tracking-tight">Live Video Conference</h3>
                                    </div>
                                    <p className="text-xs text-brand-100 font-medium">
                                        Platform: <span className="font-bold text-white">{meeting?.platform || 'Google Meet'}</span> • Secure Conference Room
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5">
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/10"
                                    >
                                        <Copy size={14} /> Copy Link
                                    </button>

                                    {meeting?.meetingLink ? (
                                        <button
                                            onClick={(e) => {
                                                if (onJoinMeeting) {
                                                    onJoinMeeting(e, meeting);
                                                    onClose();
                                                } else {
                                                    window.open(meeting.meetingLink, '_blank');
                                                }
                                            }}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95"
                                        >
                                            <Video size={16} className="text-white" />
                                            JOIN MEETING →
                                        </button>
                                    ) : (
                                        <span className="text-xs text-brand-200 font-bold">Meeting in Physical Room</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Date, Time, Location Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Date</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">{meeting?.date ? new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Time</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">{meeting?.startTime} - {meeting?.endTime}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Timezone</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">{meeting?.timezone || 'IST'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Organizer</p>
                                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{meeting?.organizer?.name || 'Administrator'}</p>
                            </div>
                        </div>

                        {/* Associated Relations */}
                        {(meeting?.relatedClient || meeting?.relatedProject) && (
                            <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50/80 px-4 py-2.5 rounded-2xl border border-slate-200/60">
                                {meeting?.relatedClient && (
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                        <Building size={14} className="text-brand-600" />
                                        Client: <span className="text-slate-900">{meeting.relatedClient}</span>
                                        {meeting.clientEmail && <span className="text-slate-400 font-normal">({meeting.clientEmail})</span>}
                                    </span>
                                )}
                                {meeting?.relatedProject && (
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800">
                                        📁 Project: <span className="text-slate-900">{meeting.relatedProject}</span>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Agenda & Description */}
                        {meeting?.agenda && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Meeting Agenda</h4>
                                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-800 font-medium whitespace-pre-wrap border border-slate-100">
                                    {meeting.agenda}
                                </div>
                            </div>
                        )}

                        {/* Participants & External Guests */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Participants ({meeting?.participants?.length || 0} Internal, {meeting?.externalGuests?.length || 0} External)
                                </h4>

                                <button
                                    onClick={handleSendInvitations}
                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                >
                                    <Send size={12} /> Resend Invites
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/* Internal Participants */}
                                {meeting?.participants?.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                                                {p.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{p.user?.name || 'User'}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{p.role || 'Participant'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                            p.invitationStatus === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                                            p.invitationStatus === 'Declined' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {p.invitationStatus}
                                        </span>
                                    </div>
                                ))}

                                {/* External Guests */}
                                {meeting?.externalGuests?.map((g, idx) => (
                                    <div key={`ext-${idx}`} className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                                                {g.name?.charAt(0) || 'G'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{g.name}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{g.company ? `${g.company} • ` : ''}{g.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                                            Guest ({g.invitationStatus || 'Pending'})
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* User RSVP Action Bar */}
                            <div className="flex items-center justify-between p-3 bg-brand-50/60 rounded-2xl border border-brand-100">
                                <span className="text-xs font-bold text-brand-900">Your Invitation Response:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRSVP('Accepted')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                            myParticipantRecord?.invitationStatus === 'Accepted'
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                        }`}
                                    >
                                        ✓ Accept
                                    </button>
                                    <button
                                        onClick={() => handleRSVP('Tentative')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                            myParticipantRecord?.invitationStatus === 'Tentative'
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                                        }`}
                                    >
                                        ? Tentative
                                    </button>
                                    <button
                                        onClick={() => handleRSVP('Declined')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                            myParticipantRecord?.invitationStatus === 'Declined'
                                                ? 'bg-rose-600 text-white'
                                                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                                        }`}
                                    >
                                        ✕ Decline
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Meeting Notes & Decisions */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <FileText size={14} className="text-brand-600" />
                                    Meeting Notes & Key Takeaways
                                </h4>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                    className="px-3 py-1 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                                >
                                    <Save size={12} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Discussion Notes</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Record key topics discussed during the meeting..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Decisions & Agreements</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Record concrete decisions made with client/team..."
                                        value={decisions}
                                        onChange={(e) => setDecisions(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Items / Follow-up Tasks */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <CheckSquare size={14} className="text-emerald-600" />
                                    Action Items ({meeting?.actionItems?.length || 0})
                                </h4>
                                <button
                                    onClick={() => setShowActionItemForm(!showActionItemForm)}
                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Action Item
                                </button>
                            </div>

                            {/* Create Action Item Form */}
                            {showActionItemForm && (
                                <form onSubmit={handleCreateActionItem} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Action Item Title (e.g. Send proposal) *"
                                            value={actionTitle}
                                            onChange={(e) => setActionTitle(e.target.value)}
                                            className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-medium"
                                            required
                                        />
                                        <select
                                            value={actionAssignee}
                                            onChange={(e) => setActionAssignee(e.target.value)}
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-medium"
                                        >
                                            <option value="">Assign To...</option>
                                            {meeting?.participants?.map(p => (
                                                <option key={p.user?._id} value={p.user?._id}>{p.user?.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="date"
                                            value={actionDueDate}
                                            onChange={(e) => setActionDueDate(e.target.value)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-medium"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowActionItemForm(false)}
                                                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-white rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={creatingAction}
                                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                                            >
                                                {creatingAction ? 'Creating...' : 'Save & Link Task'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Action Items List */}
                            <div className="space-y-1.5">
                                {meeting?.actionItems?.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-2">No follow-up action items created yet.</p>
                                ) : (
                                    meeting?.actionItems?.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600">✓</span>
                                                <span className="font-bold text-slate-900">{item.title}</span>
                                                {item.assignedToName && (
                                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                                                        @{item.assignedToName}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Pending'}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Meeting Timeline & History</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {meeting?.activityTimeline?.map((log, idx) => (
                                    <div key={idx} className="text-xs flex items-center justify-between text-slate-600 bg-slate-50/50 p-2 rounded-lg">
                                        <span className="font-semibold text-slate-800">{log.action}: {log.details}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cancel Prompt Modal */}
                        {showCancelPrompt && (
                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
                                <p className="text-xs font-bold text-rose-900">Are you sure you want to cancel this meeting?</p>
                                <input
                                    type="text"
                                    placeholder="Enter cancellation reason..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs outline-none"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowCancelPrompt(false)}
                                        className="px-3 py-1.5 text-xs text-slate-600 bg-white rounded-lg"
                                    >
                                        Keep Meeting
                                    </button>
                                    <button
                                        onClick={handleCancelMeeting}
                                        className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                                    >
                                        Confirm Cancellation
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Action Bar */}
                <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        {meeting?.status !== 'Cancelled' && meeting?.status !== 'Completed' && (
                            <button
                                onClick={() => setShowCancelPrompt(true)}
                                className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                            >
                                Cancel Meeting
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {meeting?.status !== 'Completed' && meeting?.status !== 'Cancelled' && (
                            <button
                                onClick={handleCompleteMeeting}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                            >
                                <CheckCircle2 size={16} /> Conclude & Complete
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingDetailsModal;
