const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const OUT_DIR = path.join(__dirname, '../public/ytaudio');

// ensure output directory exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

router.get('/audio', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  const filename = `${Date.now()}.mp3`;
  const filePath = path.join(OUT_DIR, filename);

  // yt-dlp -> ffmpeg pipeline, MP3 encode (light CPU)
  const ytdlp = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-vn',
    '-acodec', 'libmp3lame',
    '-b:a', '128k',
    '-y',
    filePath
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Transcode failed' });
    }

    // Reply with public URL
    res.json({ ok: true, file: `/ytaudio/${filename}` });
  });

  // safety
  ytdlp.on('error', () => res.status(500).json({ error: 'yt-dlp failed' }));
  ffmpeg.on('error', () => res.status(500).json({ error: 'ffmpeg failed' }));
});

module.exports = router;