import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  getDashboardStats,
  listAllUsers,
  getUserDetails,
  createFakeData,
  deleteFakeData,
  factoryReset
} from '../controllers/admin.controller.js';

const router = Router();

// Todas as rotas de admin exigem autenticação e papel ADMIN
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', listAllUsers);
router.get('/users/:id/details', getUserDetails);

router.post('/fake-data/create', createFakeData);
router.delete('/fake-data/cleanup', deleteFakeData);
router.post('/system/factory-reset', factoryReset);

export default router;
