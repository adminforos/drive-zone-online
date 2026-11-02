import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

// Serve static files from the Vite build directory (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all routes to index.html for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`DRIVE ZONE ONLINE web service running on http://${HOST}:${PORT}`);
});
