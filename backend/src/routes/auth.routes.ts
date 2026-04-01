import { Router } from 'express';
import { register, login, selectProfile } from '../controllers/auth.controller';

const router = Router();

router.post('/cadastro', register);
router.post('/login', login);
router.post('/select-profile', selectProfile);

export default router;
