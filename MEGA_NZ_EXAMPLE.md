# Mega.nz Integration Example

## ⚠️ Important: CORS Limitations

Mega.nz **does NOT allow direct embedding** in browsers due to CORS security policies. This is a browser security feature, not a bug.

## ✅ Correct Usage

### Option 1: Embed URL Format (Best)
```json
{
  "id": 1,
  "title": "My Mega Video",
  "type": "video",
  "src": "https://mega.nz/embed/AbCdEfGh#IjKlMnOp",
  "category": "tutorial",
  "description": "Mega.nz video with embed format"
}
```

### Option 2: File URL (App will convert)
```json
{
  "id": 2,
  "title": "My Mega File",
  "type": "video",
  "src": "https://mega.nz/file/AbCdEfGh#IjKlMnOp",
  "category": "tutorial",
  "description": "App auto-converts to embed format"
}
```

## What Happens in the App

When a Mega.nz link is detected:

1. **App shows a warning screen** instead of broken player
2. **Explains the CORS issue** to users
3. **Provides buttons**:
   - "Open in Mega.nz" → Opens original link
   - "Try Embed Link" → Opens embed version
4. **Shows the correct URL format** for reference

## User Experience

```
┌─────────────────────────────────────┐
│  ⚠️  Mega.nz Embedding Restricted   │
│                                     │
│  Browsers block direct embedding    │
│  from Mega.nz due to CORS security  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ https://mega.nz/file/...    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Open in Mega.nz] [Try Embed]     │
│                                     │
│  💡 Use format:                     │
│  https://mega.nz/embed/ID#KEY       │
└─────────────────────────────────────┘
```

## Why This Happens

**Technical Explanation:**
- Mega.nz uses client-side encryption
- Files are decrypted in browser using the `#KEY` fragment
- CORS policy blocks cross-origin iframe embedding
- Mega's servers don't send `Access-Control-Allow-Origin` headers

**Browser Console Error:**
```
Access to fetch at 'https://mega.nz/...' from origin '...' 
has been blocked by CORS policy
```

## Workarounds

### For Developers:
1. **Download first**: Use Mega API to download, then re-host
2. **Proxy server**: Route through your own server with CORS headers
3. **Alternative host**: Use YouTube, Vimeo, or direct MP4

### For Users:
1. Click "Open in Mega.nz" button
2. Download file from Mega
3. Re-upload to YouTube/Drive/Dropbox
4. Update `media.json` with new URL

## Testing Your Mega Link

1. Open browser console (F12)
2. Try to fetch the URL:
```javascript
fetch('https://mega.nz/file/...')
  .then(r => console.log('Works!'))
  .catch(e => console.log('CORS Blocked:', e))
```

If it fails, the app will show the warning screen.

## Best Practices

✅ **DO:**
- Use `/embed/` URL format
- Provide clear description about Mega limitation
- Offer alternative download link
- Test in incognito mode first

❌ **DON'T:**
- Expect direct `<video src="mega.nz/...">` to work
- Use Mega for images (will be broken)
- Assume all users have Mega account

## Alternative Providers

If Mega.nz doesn't work for your use case, consider:

| Provider | Embed Support | CORS Friendly |
|----------|---------------|---------------|
| YouTube | ✅ Yes | ✅ Yes |
| Vimeo | ✅ Yes | ✅ Yes |
| Google Drive | ✅ Yes | ✅ Yes |
| Dropbox | ✅ Yes | ✅ Yes |
| Direct MP4 | ✅ Yes | ⚠️ Needs headers |
| Mega.nz | ⚠️ Limited | ❌ No |

## Example media.json Entry

```json
{
  "id": 10,
  "title": "Tutorial Video (Mega)",
  "type": "video",
  "src": "https://mega.nz/embed/AbCdEfGh#IjKlMnOpQrSt",
  "category": "tutorial",
  "description": "⚠️ Opens in new tab due to Mega CORS policy"
}
```

The app will automatically detect this and show the appropriate warning/help screen.
