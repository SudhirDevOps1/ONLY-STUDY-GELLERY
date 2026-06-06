# 🎨 ONLY-STUDY-GELLERY

> **Advanced Gallery + Media Player** with 21+ sections, 30+ free APIs, smart playlists, image groups, and YouTube auto-grouping.

🌐 **Live Demo**: https://only-study-gellery.pages.dev/  
📦 **Repository**: https://github.com/SudhirDevOps1/ONLY-STUDY-GELLERY.git  
👨‍💻 **Author**: SudhirDevOps1

---

## 🖼️ Unsplash Image Groups (No Pexels)

The **Image Groups** section now uses Unsplash-style image URLs and fallback image providers. No Pexels key is required.

Optional official Unsplash key:
1. Go to **https://unsplash.com/developers**
2. Create a free app and copy the access key
3. Open `src/components/sections/GroupsSection.tsx`
4. Replace this value if you want official Unsplash metadata:
   ```ts
   const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
   ```
5. Rebuild: `npm run build`

> **Note:** Leaving the key blank still works. The app uses Unsplash Source style URLs first, then automatic fallback images if any image fails.

### Image Groups Features
- **6 predefined groups**: Animals, Flowers, Nature, Cars, Food, Travel
- Each group has a **search box + button**
- Type any keyword → fetches **10 images**
- **Auto-loads** default images on page load (dog, rose, mountain, etc.)
- Click image → **modal with larger view + photographer credit**
- **Download** or **Add to Gallery** buttons
- Loading indicators + error handling
- Fully responsive grid

---

## ✨ Features

### 📁 Smart Gallery
- Images, Videos, Audio, YouTube embeds
- **Smart Playlists** from `(tag)` prefix
- Auto sequence sorting (Day 1, Day 2, ...)
- Mixed media playlists (video + image + audio)
- Direct items section (no playlist)

### 🎬 YouTube Integration
- Auto thumbnails from YouTube
- Full controls (play, pause, quality, fullscreen)
- CC/Subtitles support
- YouTube IFrame API

### 🖼️ Image Viewer
- Wheel zoom (0.5x - 5x)
- Double-click to zoom
- Drag to pan
- Fullscreen support
- Image dimensions display

### 🎮 20 Sections Powered by 30+ Free APIs

| # | Section | Purpose |
|---|---------|---------|
| 1 | 📁 Gallery | Smart playlists + media |
| 2 | 🛠️ Tools | IP, Dictionary, NASA, Animals |
| 3 | 🌤️ Weather | GPS/IP auto-detect |
| 4 | 🧮 Calculator | 20+ formulas |
| 5 | 😂 Fun Zone | Jokes, Trivia, Facts |
| 6 | 📰 News | BBC + TechCrunch |
| 7 | 💰 Finance | Crypto + Currency |
| 8 | 🎓 Education | Universities, Research |
| 9 | 💻 Dev Tools | QR, UUID, Password |
| 10 | 🍕 Food | Recipes + Cocktails |
| 11 | 🎮 Pokemon | 1000+ Pokemon |
| 12 | 🎌 Anime | MyAnimeList |
| 13 | ❤️ Wellness | BMI, BMR, Health |
| 14 | 🌏 Countries | 250 countries |
| 15 | 🌍 World Clock | Timezones |
| 16 | 👥 Social | Random users |
| 17 | 🔮 Predictor | Age/Gender |
| 18 | 📖 Reading | Posts, Lorem |
| 19 | 🎨 Colors | Palettes |
| 20 | 🛡️ More | (More APIs) |

---

## 🚀 Setup

```bash
# Install
npm install

# Development
npm run dev

# Production Build
npm run build

# Output: dist/index.html (single file)
```

Deploy `dist/index.html` to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## 📝 How to Add Your Content

**Edit `public/data/media.json`:**

### Format 1: Smart Playlist with (tag) prefix
```json
{
  "id": 1,
  "title": "(html) Day 1 - Introduction",  ← (html) tag
  "type": "video",
  "src": "https://www.youtube.com/watch?v=...",
  "category": "html",
  "description": "HTML Day 1 video"
}
```

All items with `(html)` tag will be auto-grouped into **HTML playlist** with mixed media support.

### Format 2: Direct Item (no playlist)
```json
{
  "id": 100,
  "title": "My Sunset Photo",
  "type": "image",
  "src": "https://i.ibb.co/xxx/sunset.jpg",
  "category": "nature"
}
```

Direct items appear in **"Direct Items"** section.

### Supported Types
- `image` - Image files (jpg, png, webp, etc.)
- `video` - Direct MP4 or YouTube links
- `audio` - Direct MP3 or YouTube music

### Supported Hosts (Auto-Detected!)
The app **automatically detects and converts** links from:
- ✅ **Direct URLs** (any CDN)
- ✅ **YouTube** (`watch?v=...` or `youtu.be/...`) → embed + thumbnail
- ✅ **ImgBB** (`ibb.co/...` or `i.ibb.co/...`)
- ✅ **Imgur** (`imgur.com/...` → auto `.jpg`)
- ✅ **Google Drive** (auto thumbnail/preview)
- ✅ **Dropbox** (auto `?raw=1`)
- ✅ **GitHub** (auto raw conversion)
- ✅ **Vimeo** (player embed)
- ✅ **OneDrive** (embed)
- ✅ **Unsplash** (direct + fallback)
- ⚠️ **Mega.nz / Pinterest** (opens in new tab - CORS blocked)

> **Smart Fallback:** If any image/video cannot be displayed, it shows an **"Open on Source Website"** button that redirects to the original page.

### Playlist Tag Suffixes
Create separated playlists by media type:
- `(css)` → all CSS items together
- `(cssvid)` → **CSS Videos** playlist (separate)
- `(cssimg)` → **CSS Images** playlist (separate)
- `(htmlvid)` → **HTML Videos** playlist
- `(htmlimg)` → **HTML Images** playlist
- Works with: `vid/video`, `img/image/pic`, `aud/audio/song/music` suffixes

---

## 🎨 Customization

### Add a New Smart Playlist
Just use any tag in the title:
```json
"(react) Day 1"
"(python) Day 1"
"(myclass) Note 1"
"(anyTag) Item 1"
```

The app automatically creates a playlist with the right icon and color.

### Supported Tags (with auto icons)
- **Programming**: html, css, javascript, react, vue, angular, node, python, java, php, sql, mongodb, git, docker, etc.
- **Languages**: english, hindi, spanish, french, german, etc.
- **Subjects**: math, physics, chemistry, biology, history, etc.
- **Custom**: Any tag you want!

---

## 📱 Responsive Design

✅ **Mobile** (320-640px) - Touch-friendly, mobile menu  
✅ **Tablet** (640-1024px) - 2-3 columns, sticky sidebar  
✅ **Desktop** (1024px+) - 3-5 columns, full sidebar  

---

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite 7** for fast builds
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **30+ Free Public APIs** (no keys required)

---

## 📄 License

MIT - Free for personal and commercial use.

Made with ❤️ by Sudhir Singh
