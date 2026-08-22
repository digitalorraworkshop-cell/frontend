const User = require('../models/User');

// @desc    Get enterprise payroll summaries
// @route   GET /api/payroll/summary
// @access  Private (Admin/Manager/Accountant)
const getPayrollSummary = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('name email role department salary');

        const totalSalary = users.reduce((acc, u) => acc + (u.salary || 45000), 0);
        const totalBonus = Math.round(totalSalary * 0.05);
        const totalDeductions = Math.round(totalSalary * 0.12);
        const netPayable = totalSalary + totalBonus - totalDeductions;

        const employeePayslips = users.map(u => {
            const base = u.salary || 45000;
            const hra = Math.round(base * 0.4);
            const da = Math.round(base * 0.2);
            const pf = Math.round(base * 0.12);
            const tax = Math.round(base * 0.05);
            return {
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                baseSalary: base,
                hra,
                da,
                pf,
                tax,
                netSalary: base + hra + da - (pf + tax),
                status: 'Processed'
            };
        });

        res.json({
            totalEmployees: users.length,
            totalSalary,
            totalBonus,
            totalDeductions,
            netPayable,
            employeePayslips
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPayrollSummary };
