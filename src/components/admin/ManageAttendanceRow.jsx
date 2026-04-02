import React, { useState, useEffect } from 'react';

const ManageAttendanceRow = ({ record, onUpdate }) => {
    const { employee, attendance } = record;

    const formatTimeToLocal = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        return d.getHours().toString().padStart(2, '0') + ':' +
            d.getMinutes().toString().padStart(2, '0');
    };

    const [localAttendance, setLocalAttendance] = useState({
        ...attendance,
        checkInTime: formatTimeToLocal(attendance.checkInTime),
        checkOutTime: formatTimeToLocal(attendance.checkOutTime)
    });

    useEffect(() => {
        setLocalAttendance({
            ...attendance,
            checkInTime: formatTimeToLocal(attendance.checkInTime),
            checkOutTime: formatTimeToLocal(attendance.checkOutTime)
        });
    }, [attendance]);

    const handleChange = (field, value) => {
        const updated = { ...localAttendance, [field]: value };

        // Validation/Logic
        if (field === 'status' && (value === 'Absent' || value === 'Leave')) {
            updated.checkInTime = '';
            updated.checkOutTime = '';
        }

        setLocalAttendance(updated);

        // Prepare data for parent
        const recordForParent = { ...updated };
        if (updated.checkInTime) {
            const [y, mm, d_day] = attendance.date.split('-').map(Number);
            const [h, m] = updated.checkInTime.split(':').map(Number);
            const d = new Date(y, mm - 1, d_day, h, m, 0, 0);
            recordForParent.checkInTime = d.toISOString();
        }
        if (updated.checkOutTime) {
            const [y, mm, d_day] = attendance.date.split('-').map(Number);
            const [h, m] = updated.checkOutTime.split(':').map(Number);
            const d = new Date(y, mm - 1, d_day, h, m, 0, 0);
            recordForParent.checkOutTime = d.toISOString();
        }

        onUpdate(employee._id, recordForParent);
    };

    const isDisabled = localAttendance.status === 'Absent' || localAttendance.status === 'Leave';

    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-8 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">
                        {employee.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 leading-none">{employee.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{employee.department || 'No Dept'}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <input
                    type="time"
                    disabled={isDisabled}
                    value={localAttendance.checkInTime}
                    onChange={(e) => handleChange('checkInTime', e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-30"
                />
            </td>
            <td className="px-6 py-4">
                <input
                    type="time"
                    disabled={isDisabled}
                    value={localAttendance.checkOutTime}
                    onChange={(e) => handleChange('checkOutTime', e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-30"
                />
            </td>
            <td className="px-6 py-4 text-center">
                <input
                    type="number"
                    disabled={isDisabled}
                    value={localAttendance.breakMinutes || 0}
                    onChange={(e) => handleChange('breakMinutes', e.target.value)}
                    className="w-20 bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-30"
                />
            </td>
            <td className="px-6 py-4">
                <select
                    value={localAttendance.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={`w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-brand-500/20 ${localAttendance.status === 'Present' ? 'text-emerald-600' :
                        localAttendance.status === 'Absent' ? 'text-rose-600' :
                            localAttendance.status === 'Late' ? 'text-amber-600' :
                                localAttendance.status === 'Half Day' ? 'text-blue-600' :
                                    localAttendance.status === 'Leave' ? 'text-indigo-600' :
                                        'text-slate-600'
                        }`}
                >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Leave">Leave</option>
                </select>
            </td>
            <td className="px-6 py-4">
                <input
                    type="text"
                    placeholder="Remarks..."
                    value={localAttendance.remarks || ''}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-brand-500/20"
                />
            </td>
        </tr>
    );
};

export default ManageAttendanceRow;
