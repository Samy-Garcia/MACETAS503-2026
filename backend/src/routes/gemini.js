// backend/src/routes/geminiRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  chatWithGemini, 
  generateContent,
  getModelsStatus 
} from '../controller/geminiController.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'image/heic', 
      'image/heif',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado'), false);
    }
  }
});

router.post('/chat', upload.array('files', 5), chatWithGemini);
router.post('/generate', generateContent);

// Nuevo endpoint: estado de modelos
router.get('/models-status', getModelsStatus);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'FLORA',
    version: '1.0.0',
    available: true,
    timestamp: new Date().toISOString()
  });
});

export default router;