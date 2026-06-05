# Cloud Provider Integration Guide

## ✅ Fully Supported Providers

### Direct Links (Best Experience)
- **Direct MP4/MP3/JPG**: HTML5 player with full custom controls ✅
- **Dropbox**: Convert to `?raw=1` for direct access ✅
- **Unsplash/Imgur**: Direct image embedding ✅

### Iframe Providers (Native Controls)
- **YouTube**: IFrame API with quality picker ✅
- **Vimeo**: Player iframe ✅
- **Google Drive**: Preview iframe ✅
- **OneDrive**: Embed iframe ✅
- **pCloud**: Embed iframe ✅
- **Sync.com**: Embed iframe ✅
- **Internxt**: Embed iframe ✅

## ⚠️ Limited Support

### Mega.nz - CORS RESTRICTIONS
**Status**: ⚠️ Requires special handling

**Problem**: 
- Mega.nz uses encrypted links with CORS restrictions
- Direct `<img src>` or `<video src>` will fail with CORS error
- Browsers block cross-origin requests to Mega's servers

**Solutions**:

1. **Use Embed URL Format** (Recommended):
   ```
   Original: https://mega.nz/file/FILE_ID#DECRYPTION_KEY
   Embed:    https://mega.nz/embed/FILE_ID#DECRYPTION_KEY
   ```

2. **Open in New Tab**:
   - App shows warning with "Open in Mega.nz" button
   - Users can download/view directly on Mega's site

3. **Alternative**: Download file first, then host on CORS-friendly CDN

**Code Example**:
```json
{
  "id": 6,
  "title": "Mega Video",
  "type": "video",
  "src": "https://mega.nz/embed/AbCdEfGh#IjKlMnOpQrStUvWxYz",
  "category": "tutorial",
  "description": "Note: May require opening in new tab"
}
```

## 🚫 Not Supported

- **Private/Password-protected links**: Require authentication
- **Torrent/Magnet links**: Need torrent client
- **FTP links**: Blocked by browsers

## Best Practices

1. **For Images**: Use Unsplash, Imgur, or direct CDN links
2. **For Videos**: YouTube, Vimeo, or direct MP4 with CORS headers
3. **For Audio**: Direct MP3 or SoundCloud embeds
4. **For Cloud Storage**: 
   - Dropbox: Add `?raw=1`
   - Google Drive: Use `/preview` endpoint
   - OneDrive: Use embed codes

## Testing URLs

Before adding to `media.json`, test in browser console:
```javascript
fetch('YOUR_URL', { mode: 'cors' })
  .then(r => console.log('✅ Works'))
  .catch(e => console.log('❌ CORS Blocked'));
```

## Provider Detection Logic

The app automatically detects providers by analyzing URL domains:

```typescript
youtube.com → YouTube iframe
drive.google.com → Google Drive preview
mega.nz → Mega embed (with warning)
dropbox.com → Direct download (?raw=1)
onedrive.live.com → OneDrive embed
vimeo.com → Vimeo player
*.mp4 → HTML5 video
*.mp3 → HTML5 audio
```

## Troubleshooting

### "Failed to load media"
- Check browser console for CORS errors
- Verify URL is publicly accessible
- Test URL in incognito mode

### "Mega.nz not loading"
- Use `/embed/` URL format
- Open in new tab as fallback
- Consider alternative hosting

### "Video won't play"
- Check if URL ends with `.mp4`
- Verify CORS headers on server
- Try different video format (WebM)

## Security Notes

- All embeds use `sandbox` attributes where possible
- External links open with `rel="noopener noreferrer"`
- No cookies or tracking from embedded players
