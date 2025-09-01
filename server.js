const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'DrawMe_Drawings');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors({
  origin: 'https://savoyagers.neocities.org', // Change to your Neocities domain
}));
app.use(express.json({ limit: '10mb' }));

app.post('/upload', (req, res) => {
  const { image, filename } = req.body;
  if (!image || !filename) return res.status(400).send('Invalid data');
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
  fs.writeFile(path.join(UPLOAD_DIR, filename), base64Data, 'base64', err => {
    if (err) return res.status(500).send('Failed to save');
    res.send('Upload successful!');
  });
});

// Serve gallery page and images
app.use('/DrawMe_Drawings', express.static(UPLOAD_DIR));
app.get('/gallery', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send('Cannot read gallery');
    const images = files.filter(f => f.endsWith('.jpg'));
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>DrawMe Gallery</title>
        <style>
          body { font-family: Arial, sans-serif; background: #fafafa; margin: 0; padding: 20px; }
          h1 { text-align: center; }
          .gallery { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
          .gallery img { max-width: 220px; max-height: 220px; border: 2px solid #ccc; border-radius: 8px; cursor: pointer; transition: box-shadow 0.2s; background: #fff; }
          .gallery img:hover { box-shadow: 0 0 12px #888; border-color: #888; }
          #modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); justify-content: center; align-items: center; }
          #modal img { max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 24px #222; background: #fff; }
          #closeBtn { position: absolute; top: 30px; right: 40px; font-size: 2rem; color: #fff; background: none; border: none; cursor: pointer; z-index: 1001; }
        </style>
      </head>
      <body>
        <h1>DrawMe Gallery</h1>
        <div class="gallery">
          ${images.map(file => `<img src="/DrawMe_Drawings/${file}" alt="${file}" onclick="showModal('/DrawMe_Drawings/${file}')">`).join('')}
        </div>
        <div id="modal">
          <button id="closeBtn" onclick="closeModal()">&times;</button>
          <img id="modalImg" src="" alt="Full Size">
        </div>
        <script>
          function showModal(src) {
            document.getElementById('modalImg').src = src;
            document.getElementById('modal').style.display = 'flex';
          }
          function closeModal() {
            document.getElementById('modal').style.display = 'none';
            document.getElementById('modalImg').src = '';
          }
          document.getElementById('modal').onclick = function(e) {
            if (e.target === this) closeModal();
          };
          document.addEventListener('keydown', function(e) {
            if (e.key === "Escape") closeModal();
          });
        </script>
      </body>
      </html>
    `);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));