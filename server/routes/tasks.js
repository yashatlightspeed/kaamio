const express = require('express');
const router = express.Router();
const {
  createTask, getProjectTasks, getMyTasks, getTask,
  updateTask, deleteTask, addComment, updateSubtask, bulkUpdateStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/my', getMyTasks);
router.put('/bulk-status', bulkUpdateStatus);
router.get('/project/:projectId', getProjectTasks);
router.route('/').post(authorize('admin'), createTask);
router.route('/:id').get(getTask).put(updateTask).delete(authorize('admin'), deleteTask);
router.post('/:id/comments', addComment);
router.put('/:id/subtasks/:subtaskId', updateSubtask);

module.exports = router;
