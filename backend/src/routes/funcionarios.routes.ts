import { Router } from 'express';
import {
  listarFuncionarios,
  cadastrarFuncionario,
  atualizarFuncionario,
  removerFuncionario,
} from '../controllers/funcionarios.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN', 'DONO', 'GERENTE'));

router.get('/', listarFuncionarios);
router.post('/', cadastrarFuncionario);
router.patch('/:id', atualizarFuncionario);
router.delete('/:id', removerFuncionario);

export default router;
