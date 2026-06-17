import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import {
  getUsers, updateUserStatus, deleteUser, getStats, getReports
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/reports', getReports);

export default router;