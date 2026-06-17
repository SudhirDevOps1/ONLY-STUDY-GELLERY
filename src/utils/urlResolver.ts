// ============================================================
// SMART URL RESOLVER
// Auto-detects and converts links from various providers:
// - Google Drive, ImgBB, Imgur, Mega, Dropbox, GitHub, etc.
// If image cannot be displayed → redirect to source webpage
// ============================================================

export interface ResolvedUrl {
  url: string;            // The URL to use for display
  fallbackUrl: string;    // Original URL to open if display fails
  provider: string;       // Detected provider name
  canEmbed: boolean;      // Whether it can be embedded directly
  type: 'direct' | 'iframe' | 'redirect';
}

export function resolveUrl(rawUrl: string, mediaType: 'image' | 'video' | 'audio' = 'image'): ResolvedUrl {
  const url = rawUrl.trim();
  let domain = '';
  try {
    domain = new URL(url).hostname.toLowerCase();
  } catch {
    return { url, fallbackUrl: url, provider: 'unknown', canEmbed: true, type: 'direct' };
  }

  // ===== GOOGLE DRIVE =====
  if (domain.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/) || url.match(/[?&]id=([^&]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      if (mediaType === 'image') {
        // Use thumbnail/direct view for images
        return {
          url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
          fallbackUrl: `https://drive.google.com/file/d/${fileId}/view`,
          provider: 'Google Drive',
          canEmbed: true,
          type: 'direct'
        };
      }
      // Videos use preview iframe
      return {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        fallbackUrl: `https://drive.google.com/file/d/${fileId}/view`,
        provider: 'Google Drive',
        canEmbed: true,
        type: 'iframe'
      };
    }
  }

  // ===== IMGBB =====
  if (domain.includes('ibb.co') || domain.includes('imgbb.com')) {
    // i.ibb.co is direct, ibb.co is page
    if (domain.startsWith('i.ibb.co')) {
      return { url, fallbackUrl: url, provider: 'ImgBB', canEmbed: true, type: 'direct' };
    }
    // ibb.co/CODE → page link, redirect on fail
    return { url, fallbackUrl: url, provider: 'ImgBB', canEmbed: true, type: 'direct' };
  }

  // ===== IMGUR =====
  if (domain.includes('imgur.com')) {
    if (domain.startsWith('i.imgur.com')) {
      return { url, fallbackUrl: url, provider: 'Imgur', canEmbed: true, type: 'direct' };
    }
    // imgur.com/CODE → convert to i.imgur.com/CODE.jpg
    const codeMatch = url.match(/imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]+)/);
    if (codeMatch) {
      return {
        url: `https://i.imgur.com/${codeMatch[1]}.jpg`,
        fallbackUrl: url,
        provider: 'Imgur',
        canEmbed: true,
        type: 'direct'
      };
    }
  }

  // ===== MEGA.NZ =====
  if (domain.includes('mega.nz') || domain.includes('mega.io')) {
    let embedUrl = url;
    if (url.includes('/file/')) embedUrl = url.replace('/file/', '/embed/');
    else if (url.includes('#!')) embedUrl = url.replace('/#!', '/embed/#!');
    return {
      url: embedUrl,
      fallbackUrl: url,
      provider: 'Mega.nz',
      canEmbed: false,  // CORS blocked - will redirect
      type: 'redirect'
    };
  }

  // ===== DROPBOX =====
  if (domain.includes('dropbox.com')) {
    const directUrl = url
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('dropbox.com', 'dl.dropboxusercontent.com')
      .split('?')[0] + '?raw=1';
    return { url: directUrl, fallbackUrl: url, provider: 'Dropbox', canEmbed: true, type: 'direct' };
  }

  // ===== GITHUB =====
  if (domain.includes('github.com')) {
    // Convert github.com/.../blob/... to raw.githubusercontent.com
    if (url.includes('/blob/')) {
      const rawUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      return { url: rawUrl, fallbackUrl: url, provider: 'GitHub', canEmbed: true, type: 'direct' };
    }
    return { url, fallbackUrl: url, provider: 'GitHub', canEmbed: true, type: 'direct' };
  }

  // ===== YOUTUBE =====
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    const idMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (idMatch) {
      return {
        url: `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0&controls=1&fs=1&modestbranding=1`,
        fallbackUrl: url,
        provider: 'YouTube',
        canEmbed: true,
        type: 'iframe'
      };
    }
  }

  // ===== VIMEO =====
  if (domain.includes('vimeo.com')) {
    const id = url.split('/').pop()?.split('?')[0];
    return {
      url: `https://player.vimeo.com/video/${id}?autoplay=1`,
      fallbackUrl: url,
      provider: 'Vimeo',
      canEmbed: true,
      type: 'iframe'
    };
  }

  // ===== UNSPLASH =====
  if (domain.includes('unsplash.com')) {
    return { url, fallbackUrl: url, provider: 'Unsplash', canEmbed: true, type: 'direct' };
  }

  // ===== PEXELS =====
  if (domain.includes('pexels.com')) {
    return { url, fallbackUrl: url, provider: 'Pexels', canEmbed: true, type: 'direct' };
  }

  // ===== PINTEREST =====
  if (domain.includes('pinterest.com') || domain.includes('pin.it')) {
    return { url, fallbackUrl: url, provider: 'Pinterest', canEmbed: false, type: 'redirect' };
  }

  // ===== OneDrive =====
  if (domain.includes('onedrive.live.com') || domain.includes('1drv.ms')) {
    return {
      url: url.includes('embed') ? url : url.replace('view.aspx', 'embed'),
      fallbackUrl: url,
      provider: 'OneDrive',
      canEmbed: true,
      type: 'iframe'
    };
  }

  // ===== Direct file (has image/video/audio extension) =====
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)(\?|$)/i)) {
    return { url, fallbackUrl: url, provider: 'Direct Image', canEmbed: true, type: 'direct' };
  }
  if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i)) {
    return { url, fallbackUrl: url, provider: 'Direct Video', canEmbed: true, type: 'direct' };
  }
  if (url.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i)) {
    return { url, fallbackUrl: url, provider: 'Direct Audio', canEmbed: true, type: 'direct' };
  }

  // ===== Default - try direct, fallback to redirect =====
  return { url, fallbackUrl: url, provider: 'Web Link', canEmbed: true, type: 'direct' };
}

// Helper to check if a domain typically blocks embedding
export function isRedirectOnly(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return ['mega.nz', 'mega.io', 'pinterest.com', 'pin.it'].some(d => domain.includes(d));
  } catch {
    return false;
  }
}
