const express = require('express');
const router = express.Router();
const multer = require('multer');
const { performPalmReading } = require('../features/palmReading');

// Setup multer in-memory storage
const upload = multer({
  limits: { fileSize: 4 * 1024 * 1024 } // 4MB limit
});

// POST /api/palm-reading
router.post('/palm-reading', upload.single('imageFile'), async (req, res) => {
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
      return res.status(400).json({ error: 'Please provide either a palm image file, a base64 image string, or a palm description.' });
    }

    const result = await performPalmReading(inputData);
    res.json(result);
  } catch (error) {
    console.error('Error in palm reading route:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze palm.' });
  }
});

module.exports = router;
