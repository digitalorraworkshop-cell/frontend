const express = require('express');
const router = express.Router();
const { assignTask, getTasks, updateTask, deleteTask, reorderTasks, startTrackingTask, stopTrackingTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all tasks for user or all tasks for admin
// @route   GET /api/tasks
router.get('/', protect, getTasks);

// @desc    Create/Self-assign a task
// @route   POST /api/tasks
router.post('/', protect, assignTask);

// @desc    Reorder tasks
// @route   PUT /api/tasks/reorder
router.put('/reorder', protect, reorderTasks);

// @desc    Update task status or details
// @route   PUT /api/tasks/:id
router.put('/:id', protect, updateTask);

// @desc    Start tracking task
// @route   POST /api/tasks/:id/start-tracking
router.post('/:id/start-tracking', protect, startTrackingTask);

// @desc    Stop tracking task
// @route   POST /api/tasks/:id/stop-tracking
router.post('/:id/stop-tracking', protect, stopTrackingTask);

// @desc    Delete task
// @route   DELETE /api/tasks/:id
router.delete('/:id', protect, deleteTask);

module.exports = router;
