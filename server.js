import express from 'express';
import dotenv from 'dotenv/config';
import 'dotenv/config';
import sql from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json({ limit: '10mb' })); // untuk base64 besar
app.use(express.static('public'));

// Setup __dirname agar bisa dipakai di ESM (karena pakai import)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧩 Route utama → arahkan ke public/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate ID acak 4 digit
function generateId() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// CREATE
app.post('/api/siswa', async (req, res) => {
  const { nama_lengkap, username, kelas, role, deskripsi, tanggal_lahir, email, skill, gambar } = req.body;

  if (!nama_lengkap || !username) {
    return res.status(400).json({ error: 'Nama lengkap dan username wajib diisi!' });
  }

  const id = generateId();
  // Konversi Base64 → byte buffer
  const buffer = gambar ? Buffer.from(gambar, 'base64') : null;

  await sql`
    INSERT INTO siswa (id, nama_lengkap, username, kelas, role, deskripsi, gambar, tanggal_lahir, email, skill)
    VALUES (${id}, ${nama_lengkap}, ${username}, ${kelas}, ${role}, ${deskripsi}, ${buffer}, ${tanggal_lahir}, ${email}, ${skill})
  `;
  res.json({ success: true, id });
});

// READ
app.get('/api/siswa', async (req, res) => {
  const data = await sql`SELECT id, nama_lengkap, username, kelas, role, deskripsi, email, skill FROM siswa`;
  res.json(data);
});

// GET GAMBAR
app.get('/api/siswa/:id/gambar', async (req, res) => {
  const [s] = await sql`SELECT gambar FROM siswa WHERE id = ${req.params.id}`;
  if (!s || !s.gambar) return res.status(404).send('Tidak ada gambar');
  res.set('Content-Type', 'image/png');
  res.send(s.gambar);
});

// UPDATE
app.put('/api/siswa/:id', async (req, res) => {
  const { nama_lengkap, username, kelas, role, deskripsi, tanggal_lahir, email, skill, gambar } = req.body;
  const buffer = gambar ? Buffer.from(gambar, 'base64') : null;

  await sql`
    UPDATE siswa
    SET nama_lengkap = ${nama_lengkap},
        username = ${username},
        kelas = ${kelas},
        role = ${role},
        deskripsi = ${deskripsi},
        tanggal_lahir = ${tanggal_lahir},
        email = ${email},
        skill = ${skill},
        gambar = COALESCE(${buffer}, gambar)
    WHERE id = ${req.params.id}
  `;
  res.json({ success: true });
});

// DELETE
app.delete('/api/siswa/:id', async (req, res) => {
  await sql`DELETE FROM siswa WHERE id = ${req.params.id}`;
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));