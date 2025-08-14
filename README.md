# Subtitle Sync Player

A simple modern web app that allows users to upload an `.mp3` audio file and an `.srt` subtitle file, then displays a synced playback experience in the browser — all without a backend.

## ✨ Features

- Upload an audio file (`.mp3`)
- Upload a subtitle file (`.srt`)
- Synchronized audio playback with scrolling subtitles
- Active subtitle highlighting
- No backend required — everything stays local in memory and resets on refresh

## 🔧 How It Works

1. Drag and drop or click to upload your `.mp3` and `.srt` files
2. The audio plays using a temporary `Blob URL` via `URL.createObjectURL()`
3. The `.srt` file is parsed into timed subtitle lines
4. As the audio plays, the app highlights the current subtitle line and scrolls to it
5. On refresh or navigation away, all data is cleared

## 🛠️ Tech Stack

- Frontend Framework: React
- Language: TypeScript
- Build Tool/Bundler: Vite
- Styling: Tailwind CSS
- Icons: Lucide React
- Package Manager: npm
- Linting: ESLint

## 📁 Project Structure

```
.
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

```

## 🚀 Usage

Clone the repo and run it locally:

```bash
git clone https://github.com/hereisphil/subtitle-sync-player.git
cd subtitle-sync-player
npm install
npm run dev
```

---

## 👋 About the Author

Hi! I’m Phillip Cantu, an American digital nomad, a Full Sail University web development student, and a [4Geeks Academy Full Stack Development with AI Bootcamp](https://4geeksacademy.com/us/apply?ref=REFERRALQEZPTJCK-17696). I’m passionate about creating modern, user-friendly, and practical applications that help people learn and build faster.

You can find me here:

- **GitHub:** [hereisphil](https://github.com/hereisphil)
- **LinkedIn:** [PhillipCantu](https://www.linkedin.com/in/phillipcantu/)
- **Instagram:** [@philtheotaku](https://www.instagram.com/philtheotaku/)
