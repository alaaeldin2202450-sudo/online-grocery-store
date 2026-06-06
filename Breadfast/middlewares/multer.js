const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set the correct directory relative to your project root
const imgDir = path.join(__dirname, '..', 'public', 'img'); // '..' takes you one level up to the project root
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Optionally, create a subdirectory (upload) if needed
const uploadDir = path.join(imgDir, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files inside 'public/img/upload'
  },
  filename: (req, file, cb) => {
    // Create a unique filename based on the current timestamp and file extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize multer with storage engine and file size limit
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).single('image'); // Expect a single file uploaded with the field name "image"

module.exports = upload;
