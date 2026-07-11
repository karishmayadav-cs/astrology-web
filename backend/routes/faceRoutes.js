const express = require('express');
const router = express.Router();
const multer = require('multer');
const { performFaceReading } = require('../features/faceReading');

// Setup multer in-memory storage
const upload = multer({
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

// POST /api/face-reading
router.post('/face-reading', upload.single('imageFile'), async (req, res) => {
  try {
    let inputData = {};

    if (req.file) {
      // Multipart upload
      inputData = {
        image: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      };
    } else if (req.body.image) {
      // Base64 upload via JSON
      inputData = {
        image: req.body.image,
        mimeType: req.body.mimeType || 'image/jpeg'
      };
    } else if (req.body.description) {
      // Text description
      inputData = {
        description: req.body.description
      };
    } else {
      return res.status(400).json({ error: 'Please provide either a front-facing face photo, a base64 image string, or a facial description.' });
    }

    const result = await performFaceReading(inputData);
    res.json(result);
  } catch (error) {
    console.error('Error in face reading route:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze face features.' });
  }
});

module.exports = router;
