import { Router } from 'express';
import { register, login, selectProfile, checkCpf, validateAccountPassword, listMyProfiles, switchProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/cadastro', register);
router.post('/login', login);
router.post('/select-profile', selectProfile);
router.get('/check-cpf/:cpf', checkCpf);
router.post('/validate-password', validateAccountPassword);

// Novas rotas para troca rápida de perfil
router.get('/my-profiles', authMiddleware, listMyProfiles);
router.post('/switch-profile', authMiddleware, switchProfile);

export default router;
