const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const totalTasks = await Task.countDocuments();
            const completedTasks = await Task.countDocuments({
                status: 'Completed',
            });
            const pendingTasks = await Task.countDocuments({ status: 'Pending' });
            const inProgressTasks = await Task.countDocuments({
                status: 'In Progress',
            });
            const totalUsers = await User.countDocuments({ role: 'employee' });

            res.json({
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                totalUsers,
            });
        } else {
            const myTasks = await Task.countDocuments({
                assignedTo: req.user._id,
            });
            const completedTasks = await Task.countDocuments({
                assignedTo: req.user._id,
                status: 'Completed',
            });
            const pendingTasks = await Task.countDocuments({
                assignedTo: req.user._id,
                status: 'Pending',
            });
            const inProgressTasks = await Task.countDocuments({
                assignedTo: req.user._id,
                status: 'In Progress',
            });

            res.json({
                myTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
