import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, 'dist');

// Middleware to serve static files and SPA fallback
app.use((req, res, next) => {
  // Requested file path
  const filePath = path.join(distPath, req.path);

  // Check if the file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // File exists, serve it
    return res.sendFile(filePath, { maxAge: '1h' });
  }

  // File doesn't exist, check if it's a directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    // Try index.html in that directory
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath, { maxAge: '1h' });
    }
  }

  // No file found, serve index.html for SPA routing
  return res.sendFile(path.join(distPath, 'index.html'), { maxAge: '1h' });
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
