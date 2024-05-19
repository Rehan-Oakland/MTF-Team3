const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PDF files are allowed'), false);
    }
  }
});

app.use(express.json());

app.post('/upload', upload.single('file'), (req, res) => {
  const { dateOfReceipt, amount, projectCode, merchant, school, country } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File upload failed.' });
  }

  // Handle the file and other form data here
  console.log(file);

  res.json({ message: 'Receipt uploaded successfully!' });
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).json({ message: err.message });
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

