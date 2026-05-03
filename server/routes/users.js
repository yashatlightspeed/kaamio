const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, deactivateUser, getProductivityStats } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/productivity', getProductivityStats);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/deactivate', deactivateUser);

module.exports = router;
