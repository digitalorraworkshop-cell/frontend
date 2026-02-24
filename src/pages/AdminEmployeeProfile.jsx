import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    Clock,
    Calendar,
    Activity,
    Coffee,
    Users,
    AlertCircle,
    User as UserIcon,
    Shield,
    Mail,
    Phone,
    Briefcase,
    TrendingUp,
    CheckCircle,
    ChevronLeft,
    Download,
    Eye,
    Zap,
    PauseCircle,
    Maximize
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSocket } from '../utils/socket';

const formatMins = (minutes) => {
    if (!minutes && minutes !== 0) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h}h ${m}m`;
};

const AdminEmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [stats, setStats] = useState({
        totalHours: "0.00",
        activeTime: "0.00",
        idleTime: "0.00",
        breakTime: "0.00",
        checkIn: null,
        checkOut: null
    });
    const [screenshots, setScreenshots] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState('Offline');

    const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    useEffect(() => {
        fetchEmployeeData();

        const socket = getSocket();
        if (socket) {
            socket.on('statusUpdate', ({ userId, status }) => {
                if (userId === id) {
                    setCurrentStatus(status);
                    if (status === 'Idle' || status === 'Idle Warning') {
                        toast(`Employee marked as ${status}`, { icon: '⚠️' });
                        notificationSound.current.play().catch(e => console.log('Sound deferred'));
                    }
                }
            });
        }

        const statsInterval = setInterval(fetchStats, 30000); // Refresh stats every 30s

        return () => {
            if (socket) socket.off('statusUpdate');
            clearInterval(statsInterval);
        };
    }, [id]);

    const fetchEmployeeData = async () => {
        try {
            const [empRes, screenshotsRes, attendanceRes] = await Promise.all([
                api.get(`/employees/${id}`),
                api.get(`/screenshots?userId=${id}`),
                api.get(`/attendance/user/${id}`)
            ]);
            setEmployee(empRes.data);
            setScreenshots(screenshotsRes.data);
            setAttendance(attendanceRes.data);
            setCurrentStatus(empRes.data.currentStatus);
            fetchStats();
        } catch (error) {
            console.error('Failed to load employee details', error);
            toast.error('Failed to load employee details');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsRes = await api.get(`/activity/stats/${id}`);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-center">Loading Enterprise Data...</div>;

    if (!employee) {
        return (
            <div className="p-8 text-center space-y-4">
                <AlertCircle className="mx-auto text-red-500" size={48} />
                <h2 className="text-2xl font-bold text-slate-900">Employee Not Found</h2>
                <p className="text-slate-500">We couldn't retrieve the data for this employee. Please verify the ID or try again.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-brand-600 text-white rounded-xl">Go Back</button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-h-screen overflow-y-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all">
                        <ChevronLeft />
                    </button>
                    <div className="w-16 h-18 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-2xl">
                        {employee?.name ? employee.name.charAt(0) : '?'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{employee?.name || 'Unknown Employee'}</h2>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {employee?.position || 'Employee'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1"><Shield size={14} /> {employee?.department || 'General'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${currentStatus === 'Working' ? 'bg-emerald-100 text-emerald-700' :
                        currentStatus === 'Online' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${currentStatus === 'Working' ? 'bg-emerald-500 animate-pulse' :
                            currentStatus === 'Online' ? 'bg-blue-500' :
                                'bg-slate-400'
                            }`}></span>
                        {currentStatus || 'Offline'}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon={<Clock className="text-blue-500" />} label="Total Hours" value={stats.totalHours} subLabel="Today Attendance" />
                <StatCard
                    icon={<Coffee className="text-indigo-500" />}
                    label="Break Time"
                    value={stats.breakTime}
                    subLabel="Total rested mins"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Breaks */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Personal Info</h3>
                        <div className="space-y-4">
                            <InfoRow icon={<Mail size={16} />} label="Email" value={employee?.email || 'N/A'} />
                            <InfoRow icon={<Phone size={16} />} label="Phone" value={employee?.phone || 'N/A'} />
                            <InfoRow icon={<Calendar size={16} />} label="Joined" value={employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4 mb-4">Daily Attendance</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Check In</span>
                                <span className="font-bold text-green-600">{stats.checkIn ? new Date(stats.checkIn).toLocaleTimeString() : '---'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Check Out</span>
                                <span className="font-bold text-red-600">{stats.checkOut ? new Date(stats.checkOut).toLocaleTimeString() : '---'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Screenshots */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Live Screenshots</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {screenshots.slice(0, 6).map((img, i) => (
                                <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                    <img src={`http://localhost:5000${img.imageUrl}`} alt="Monitoring" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => window.open(`http://localhost:5000${img.imageUrl}`, '_blank')}
                                            className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white"
                                        >
                                            <Maximize size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] text-white">
                                        {new Date(img.createdAt).toLocaleTimeString()} - {img.status}
                                    </div>
                                </div>
                            ))}
                            {screenshots.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400">No screenshots captured yet today</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="text-lg font-bold text-slate-900">Attendance History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Check In</th>
                                        <th className="px-8 py-4">Check Out</th>
                                        <th className="px-8 py-4">Hours</th>
                                        <th className="px-8 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {attendance.map((record, i) => (
                                        <tr key={i} className="text-sm hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-4 font-medium text-slate-700">{record.date}</td>
                                            <td className="px-8 py-4 text-slate-500">{new Date(record.checkInTime).toLocaleTimeString()}</td>
                                            <td className="px-8 py-4 text-slate-500">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'Running'}</td>
                                            <td className="px-8 py-4 text-slate-700 font-bold">{record.formattedTotalHours || formatMins(record.totalMinutes)}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${record.status === 'Working' ? 'bg-amber-100 text-amber-700' :
                                                    record.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subLabel }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{subLabel}</p>
            </div>
        </div>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
        <div className="text-slate-400 mt-0.5">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

export default AdminEmployeeProfile;
