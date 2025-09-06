import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// POST /api/images/upload - Upload single image
router.post('/upload', authenticateToken, upload.single('image'), async (req: any, res: Response) => {
  try {
    if (!req.user || !['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(req.user.role || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    return res.status(201).json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/images/upload-multiple - Upload multiple images
router.post('/upload-multiple', authenticateToken, upload.array('images', 10), async (req: any, res: Response) => {
  try {
    if (!req.user || !['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(req.user.role || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map((file: any) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    }));
    
    return res.status(201).json({
      success: true,
      count: uploadedFiles.length,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/images/:filename - Delete image by filename
router.delete('/:filename', authenticateToken, async (req: any, res: Response) => {
  try {
    if (!req.user || !['ADMIN', 'STAFF', 'SUPER_ADMIN'].includes(req.user.role || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Basic file deletion logic would go here
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
