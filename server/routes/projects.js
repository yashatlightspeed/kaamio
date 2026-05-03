const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProject, updateProject, deleteProject,
  addMember, removeMember, archiveProject, getAnalytics,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/analytics/summary', authorize('admin'), getAnalytics);
router.route('/').get(getProjects).post(authorize('admin'), createProject);
router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);
router.put('/:id/archive', authorize('admin'), archiveProject);
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
