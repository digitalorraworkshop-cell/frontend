import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import {
    Trash2, UserPlus, Search, Filter, Mail, Phone, Briefcase,
    RefreshCw, AlertTriangle, CheckCircle, Eye
} from 'lucide-react';

const EmployeeList = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const socketRef = useRef(null);

    // Form Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        salary: '',
        department: ''
    });
    const [profilePic, setProfilePic] = useState(null);

    // Reset Password Confirmation Modal State
    const [resetModal, setResetModal] = useState({
        isOpen: false,
        employeeId: null,
        employeeName: ''
    });

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchEmployees();

        // Real-time status updates via socket
        const socket = getSocket();
        if (socket) {
            socket.on('statusUpdate', ({ userId, status }) => {
                setEmployees(prev =>
                    prev.map(emp =>
                        emp._id === userId
                            ? { ...emp, currentStatus: status, isOnline: status !== 'Offline' }
                            : emp
                    )
                );
            });
            socketRef.current = socket;
        }

        return () => {
            if (socketRef.current) socketRef.current.off('statusUpdate');
        };
    }, []);

    const showToastMessage = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/employees');
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
            showToastMessage('Failed to load employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/employees/${id}`);
                setEmployees(employees.filter(e => e._id !== id));
                showToastMessage('Employee deleted successfully');
            } catch (error) {
                console.error('Failed to delete employee', error);
                showToastMessage('Failed to delete employee', 'error');
            }
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (profilePic) {
                data.append('profilePicture', profilePic);
            }

            const response = await api.post('/employees', data);

            // On Success: 
            // 1. Update UI state
            setEmployees([...employees, response.data]);
            setShowModal(false);

            // 2. Navigate to detailed credentials page
            navigate(`/admin/employee-credentials/${response.data._id}`, {
                state: {
                    name: response.data.name,
                    username: response.data.username,
                    password: response.data.generatedPassword
                }
            });

            // Reset form for next time
            setFormData({ name: '', email: '', phone: '', position: '', salary: '', department: '' });
            setProfilePic(null);

        } catch (error) {
            console.error('Create error:', error);
            const errMsg = error.response?.data?.message || 'Failed to add employee';
            alert(errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const initiateResetPassword = (emp) => {
        setResetModal({
            isOpen: true,
            employeeId: emp._id,
            employeeName: emp.name
        });
    };

    const confirmResetPassword = async () => {
        setActionLoading(true);
        try {
            const { data } = await api.put(`/employees/${resetModal.employeeId}/reset-password`);

            setResetModal({ isOpen: false, employeeId: null, employeeName: '' });

            // Navigate to credentials page with the new password
            navigate(`/admin/employee-credentials/${resetModal.employeeId}`, {
                state: {
                    name: resetModal.employeeName,
                    username: data.username,
                    password: data.generatedPassword
                }
            });

        } catch (error) {
            console.error('Reset password error:', error);
            showToastMessage('Failed to reset password', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'
                    }`}>
                    {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between shrink-0 sticky top-0 z-20">
                <h2 className="text-xl font-bold text-slate-800">Employee Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 font-medium"
                >
                    <UserPlus size={18} />
                    Add New Employee
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                {/* Search Bar */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-800"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {['Employee', 'Role', 'Department', 'Contact', 'Status', 'Actions'].map((header) => (
                                    <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.isArray(employees) && employees.length > 0 ? (
                                employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {emp.profilePicture ? (
                                                        <img className="h-full w-full object-cover" src={`http://localhost:5000${emp.profilePicture}`} alt="" />
                                                    ) : (
                                                        <span className="text-slate-500 font-bold text-sm">{emp.name?.charAt(0) || 'U'}</span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-900">{emp.name}</div>
                                                    <div className="text-xs font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md w-fit mt-0.5">@{emp.username}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-600 bg-slate-100/50 px-3 py-1 rounded-full w-fit">
                                                <Briefcase size={14} className="mr-2 text-slate-400" />
                                                {emp.position || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.department || 'General'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs text-slate-500">
                                                    <Mail size={12} className="mr-1.5" /> {emp.email}
                                                </div>
                                                {emp.phone && (
                                                    <div className="flex items-center text-xs text-slate-500">
                                                        <Phone size={12} className="mr-1.5" /> {emp.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.currentStatus === 'Working' ? (
                                                <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                                    Working
                                                </span>
                                            ) : emp.currentStatus === 'Online' ? (
                                                <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                                                    Offline
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/employee/${emp._id}`)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                                                    title="View Enterprise Dashboard"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => initiateResetPassword(emp)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                                                    title="Reset Password"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Briefcase size={32} className="text-slate-300" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-900">No employees found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add Employee Form Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
                        <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" required />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                                        <input name="position" value={formData.position} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                        <input name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                                        <input name="salary" type="number" value={formData.salary} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
                                        <input type="file" onChange={handleFileChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/30 flex justify-center items-center gap-2 disabled:opacity-70"
                                    >
                                        {actionLoading ? 'Creating Account...' : 'Create Employee Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Prompt */}
            {resetModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setResetModal({ ...resetModal, isOpen: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6 font-bold text-red-600 text-2xl">?</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Reset Password?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            This will generate a new random password for <span className="font-bold text-slate-700">{resetModal.employeeName}</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setResetModal({ ...resetModal, isOpen: false })}
                                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmResetPassword}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg"
                            >
                                {actionLoading ? 'Resetting...' : 'Yes, Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
