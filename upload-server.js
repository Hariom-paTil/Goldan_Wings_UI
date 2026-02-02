const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Point to the source assets folder so it updates in dev
    // Use query param for folder or default to 'assets/Img'
    // Client should send ?folder=assets/CustomCakeImage
    const folder = req.query.folder || 'assets/Img';
    const uploadPath = path.join(__dirname, 'src', folder);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const safeName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, safeName);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const folder = req.query.folder || 'assets/Img';

  // Return the path relative to the app
  // Ensure leading slash
  const webPath = `/${folder}/${req.file.filename}`;
  console.log('File uploaded to:', webPath);
  res.send({ path: webPath });
});

app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
});
