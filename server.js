const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(__dirname));

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeData(nextData) {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(nextData, null, 2)}\n`, 'utf8');
}

app.get('/api/dashboard', async (_req, res) => {
  const data = await readData();
  res.json(data);
});

app.put('/api/dashboard/profile', async (req, res) => {
  const data = await readData();
  data.profile = { ...data.profile, ...req.body };
  await writeData(data);
  res.json(data.profile);
});

app.post('/api/dashboard/releases', async (req, res) => {
  const { title, artists, spotify, youtube } = req.body;
  if (!title || !artists) {
    return res.status(400).json({ error: 'title and artists are required' });
  }

  const data = await readData();
  data.releases.push({ title, artists, spotify: spotify || '', youtube: youtube || '' });
  await writeData(data);
  res.status(201).json(data.releases);
});

app.delete('/api/dashboard/releases/:index', async (req, res) => {
  const index = Number.parseInt(req.params.index, 10);
  const data = await readData();
  if (Number.isNaN(index) || index < 0 || index >= data.releases.length) {
    return res.status(400).json({ error: 'invalid release index' });
  }

  data.releases.splice(index, 1);
  await writeData(data);
  res.json(data.releases);
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Dashboard backend running on http://localhost:${PORT}`);
});
