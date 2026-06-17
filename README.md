# 🎨 ONLY-STUDY-GELLERY

> **Advanced Gallery + Media Player** with 28+ sections, 35+ free APIs, smart playlists, image groups, and YouTube auto-grouping.

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

### 🎮 28 Sections Powered by 35+ Free APIs

| # | Section | Purpose |
|---|---------|---------|
| 1 | 📁 Gallery | Smart playlists + media |
| 2 | 🖼️ Image Groups | Search high-quality Unsplash images |
| 3 | 🛠️ Tools | IP, Password Gen, NASA APOD |
| 4 | 🌤️ Weather | GPS/IP auto-detect weather forecasting |
| 5 | 🧮 Calculator | 20+ formulas (BMI, EMI, SIP, etc) |
| 6 | 😂 Fun Zone | Jokes, Quotes, Trivia, Facts |
| 7 | 📰 News | BBC + TechCrunch RSS feeds |
| 8 | 💰 Finance | Live Crypto + Currency Rates |
| 9 | 🎓 Education | Global Universities search |
| 10 | 💻 Dev Tools | QR code generation, UUID |
| 11 | 🍕 Food | Meal & Cocktail recipes |
| 12 | 🎮 Pokemon | 1000+ Pokemon Pokedex |
| 13 | 🎌 Anime | MyAnimeList anime search |
| 14 | ❤️ Wellness | Health trackers |
| 15 | 🌏 Countries | 250+ countries details (ApiCountries) |
| 16 | 🌍 World Clock | Live timezones |
| 17 | 👥 Social | Random user generation |
| 18 | 🔮 Predictor | Predict Age/Gender from Name |
| 19 | 📖 Reading | Placeholder posts, Lorem Ipsum |
| 20 | 🎨 Colors | Random palettes |
| 21 | 🐕 Dog Breeds | Random dog pictures and breeds |
| 22 | 📚 Books | Open Library book search |
| 23 | 🏛️ Art Gallery | Metropolitan Museum of Art |
| 24 | 🚀 SpaceX | Latest launches & rocket stats |
| 25 | 🎵 Music | Jamendo free track previews |
| 26 | 📖 Dictionary | Word meanings & audio pronunciation |
| 27 | 🐙 GitHub | Explorer for users and repositories |
| 28 | 🛸 Rick & Morty | Character multiverse browser |

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
