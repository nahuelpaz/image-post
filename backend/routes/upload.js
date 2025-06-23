const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const yauzl = require('yauzl');
const { spawn } = require('child_process');
const { cloudinary, upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for archive files
const archiveStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'temp/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const archiveUpload = multer({
  storage: archiveStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip']; // Solo ZIP por ahora
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are supported. Please convert .rar/.7z to .zip'), false);
    }
  }
});

// @route   POST /api/upload/single
router.post('/single', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      filename: req.file.originalname,
      size: req.file.bytes,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format
    };

    res.json({
      message: 'Image uploaded successfully',
      image: imageData
    });

  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/multiple
router.post('/multiple', auth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      filename: file.originalname,
      size: file.bytes,
      width: file.width,
      height: file.height,
      format: file.format
    }));

    res.json({
      message: `${images.length} images uploaded successfully`,
      images
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// @route   POST /api/upload/archive
router.post('/archive', auth, archiveUpload.single('archive'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No archive file provided' });
    }

    const archivePath = req.file.path;
    const extractPath = `temp/extract-${Date.now()}`;
    
    await fs.mkdir(extractPath, { recursive: true });

    let extractedImages = [];
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      if (ext === '.zip') {
        extractedImages = await extractZip(archivePath, extractPath);
      } else {
        throw new Error('Only .zip files are currently supported');
      }

      const uploadedImages = [];
      for (const imagePath of extractedImages) {
        try {
          const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'imagepost',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
            ]
          });

          const stats = await fs.stat(imagePath);
          const metadata = await sharp(imagePath).metadata();

          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            filename: path.basename(imagePath),
            size: stats.size,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
          });
        } catch (uploadError) {
          console.error('Error uploading extracted image:', uploadError);
        }
      }

      await cleanupTemp(archivePath, extractPath);

      res.json({
        message: `Archive processed successfully. ${uploadedImages.length} images extracted and uploaded.`,
        images: uploadedImages,
        archiveInfo: {
          originalFileName: req.file.originalname,
          extractedCount: uploadedImages.length,
          archiveType: ext
        }
      });

    } catch (extractError) {
      await cleanupTemp(archivePath, extractPath);
      throw extractError;
    }

  } catch (error) {
    console.error('Archive upload error:', error);
    res.status(500).json({ message: 'Archive processing failed: ' + error.message });
  }
});

// Helper function to extract ZIP files
async function extractZip(archivePath, extractPath) {
  return new Promise((resolve, reject) => {
    const extractedImages = [];

    yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          zipfile.readEntry();
        } else {
          // File entry
          const ext = path.extname(entry.fileName).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) return reject(err);

              const outputPath = path.join(extractPath, path.basename(entry.fileName));
              const writeStream = require('fs').createWriteStream(outputPath);

              readStream.pipe(writeStream);
              writeStream.on('close', () => {
                extractedImages.push(outputPath);
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        }
      });

      zipfile.on('end', () => {
        resolve(extractedImages);
      });
    });
  });
}

async function cleanupTemp(archivePath, extractPath) {
  try {
    await fs.unlink(archivePath);
    await fs.rmdir(extractPath, { recursive: true });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Helper function to extract RAR/7Z files - IMPLEMENTACIÓN REAL
async function extract7z(archivePath, extractPath) {
  return new Promise((resolve, reject) => {
    // Intentar con 7z command line tool
    const sevenZip = spawn('7z', ['x', archivePath, '-o' + extractPath, '-y']);
    
    sevenZip.on('close', async (code) => {
      if (code === 0) {
        try {
          const files = await fs.readdir(extractPath);
          const imageFiles = [];
          
          for (const file of files) {
            const filePath = path.join(extractPath, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile()) {
              const ext = path.extname(file).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
                imageFiles.push(filePath);
              }
            }
          }
          
          resolve(imageFiles);
        } catch (error) {
          reject(error);
        }
      } else {
        // Si 7z no está disponible, intentar con node-7z
        tryNode7z(archivePath, extractPath)
          .then(resolve)
          .catch(reject);
      }
    });

    sevenZip.on('error', (error) => {
      // Si 7z command no está disponible, intentar con node-7z
      tryNode7z(archivePath, extractPath)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Función alternativa usando node-7z
async function tryNode7z(archivePath, extractPath) {
  try {
    const Seven = require('node-7z');
    
    return new Promise((resolve, reject) => {
      const extractStream = Seven.extractFull(archivePath, extractPath);
      
      extractStream.on('end', async () => {
        try {
          const files = await fs.readdir(extractPath);
          const imageFiles = [];
          
          for (const file of files) {
            const filePath = path.join(extractPath, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile()) {
              const ext = path.extname(file).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
                imageFiles.push(filePath);
              }
            }
          }
          
          resolve(imageFiles);
        } catch (error) {
          reject(error);
        }
      });
      
      extractStream.on('error', reject);
    });
  } catch (error) {
    throw new Error('7z extraction failed: ' + error.message + '. Please install 7z command line tool or check the archive format.');
  }
}

module.exports = router;
module.exports = router;
