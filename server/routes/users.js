const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/employees', protect, adminOnly, async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select(
            'name email'
        );
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
