import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../controllers/upload.controller.js';

// Caminho absoluto baseado neste arquivo — não depende do CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/routes/ → backend/public/uploads/
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// Garante que o diretório existe (cria recursivamente se necessário)
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadFile);

export default router;
