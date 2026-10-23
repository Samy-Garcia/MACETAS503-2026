import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { chatWithClient } from '../controller/floraClientController.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado'), false);
    }
  }
});

router.post('/chat', upload.array('files', 5), chatWithClient);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'FLORA Cliente',
    version: '1.0.0',
    available: true,
    timestamp: new Date().toISOString()
  });
});

export default router;