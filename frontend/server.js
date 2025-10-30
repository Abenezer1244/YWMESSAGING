import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1h',
  etag: false,
  // Tell express.static to 404 on missing files so our SPA fallback handles them
  fallthrough: true
}));

// SPA fallback - serve index.html for all routes that don't match static files
// This must come AFTER the static middleware
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
