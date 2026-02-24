const Task = require('../models/Task');

// @desc    Get tasks (admin: all, employee: assigned only)
// @route   GET /api/tasks
const getTasks = async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'admin') {
            tasks = await Task.find()
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
        } else {
            tasks = await Task.find({ assignedTo: req.user._id })
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });
        }
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Employees can only view their assigned tasks
        if (
            req.user.role === 'employee' &&
            task.assignedTo?._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task (admin only)
// @route   POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { title, description, priority, deadline, status, assignedTo } =
            req.body;

        const task = await Task.create({
            title,
            description,
            priority,
            deadline,
            status,
            assignedTo: assignedTo || null,
            createdBy: req.user._id,
        });

        const populated = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Employees can only update the status of their own tasks
        if (req.user.role === 'employee') {
            if (task.assignedTo?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
            // Only allow status update for employees
            task.status = req.body.status || task.status;
        } else {
            // Admin can update everything
            task.title = req.body.title || task.title;
            task.description =
                req.body.description !== undefined
                    ? req.body.description
                    : task.description;
            task.priority = req.body.priority || task.priority;
            task.deadline = req.body.deadline || task.deadline;
            task.status = req.body.status || task.status;
            task.assignedTo =
                req.body.assignedTo !== undefined
                    ? req.body.assignedTo
                    : task.assignedTo;
        }

        const updatedTask = await task.save();
        const populated = await Task.findById(updatedTask._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task (admin only)
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
