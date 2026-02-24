const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router
    .route('/')
    .get(protect, getTasks)
    .post(protect, adminOnly, createTask);

router
    .route('/:id')
    .get(protect, getTask)
    .put(protect, updateTask)
    .delete(protect, adminOnly, deleteTask);

module.exports = router;
