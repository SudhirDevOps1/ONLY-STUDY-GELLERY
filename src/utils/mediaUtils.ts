import { CloudInfo } from '../types';

export function getCloudInfo(url: string, declaredType: 'image' | 'video' | 'audio'): CloudInfo {
  const info: CloudInfo = {
    provider: 'default',
    type: declaredType,
    embedUrl: url,
    originalUrl: url,
  };

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();

    // Images: Direct display (but warn about CORS issues)
    if (declaredType === 'image') {
      // Check for problematic hosts for direct image embedding
      if (domain.includes('mega.nz')) {
        info.provider = 'mega-warning';
        info.type = 'iframe';
        // Mega.nz images cannot be directly embedded due to CORS
        // Convert to embed URL or show warning
        if (url.includes('/file/')) {
          info.embedUrl = url.replace('/file/', '/embed/');
        }
        console.warn('⚠️ Mega.nz images cannot be embedded directly due to CORS. Use embed link or download first.');
        return info;
      }
      info.provider = 'direct';
      return info;
    }

    // YouTube - IFrame API
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      info.provider = 'youtube';
      info.type = 'iframe';
      let videoId = '';
      if (domain.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1).split('?')[0];
      } else {
        videoId = parsedUrl.searchParams.get('v') || '';
      }
      info.embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
      return info;
    }

    // Google Drive - Preview iframe
    if (domain.includes('drive.google.com')) {
      info.provider = 'googledrive';
      info.type = 'iframe';
      const match = url.match(/\/file\/d\/([^\/]+)/);
      if (match) {
        info.embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return info;
    }

    // Mega.nz - ⚠️ CORS ISSUE: Direct embed doesn't work in browsers
    // Must use embed iframe or download link approach
    if (domain.includes('mega.nz')) {
      info.provider = 'mega';
      info.type = 'iframe';
      // Mega.nz requires embed URL format
      // Format: https://mega.nz/embed/FILE_ID#DECRYPTION_KEY
      if (url.includes('/file/')) {
        info.embedUrl = url.replace('/file/', '/embed/');
      } else if (url.includes('#!')) {
        // Old format: https://mega.nz/#!FILE_ID!KEY
        info.embedUrl = url.replace('/#!', '/embed/#!');
      }
      console.warn('⚠️ Mega.nz: Direct embedding may be blocked by CORS. Ensure using /embed/ URL format.');
      return info;
    }

    // Dropbox - Direct with ?raw=1
    if (domain.includes('dropbox.com')) {
      info.provider = 'dropbox';
      // Convert to direct download link
      info.embedUrl = url
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('dropbox.com', 'dl.dropboxusercontent.com')
        .split('?')[0] + '?raw=1';
      return info;
    }

    // OneDrive - Embed iframe
    if (domain.includes('onedrive.live.com') || domain.includes('1drv.ms')) {
      info.provider = 'onedrive';
      info.type = 'iframe';
      // OneDrive embed format
      info.embedUrl = url.includes('embed') ? url : url.replace('view.aspx', 'embed');
      return info;
    }

    // Vimeo - Player iframe
    if (domain.includes('vimeo.com')) {
      info.provider = 'vimeo';
      info.type = 'iframe';
      const videoId = parsedUrl.pathname.split('/').pop()?.split('?')[0];
      info.embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
      return info;
    }

    // pCloud - Embed iframe
    if (domain.includes('pcloud.com') || domain.includes('pcloud.link')) {
      info.provider = 'pcloud';
      info.type = 'iframe';
      // pCloud uses embed codes, fallback to direct
      return info;
    }

    // Sync.com - Embed iframe
    if (domain.includes('sync.com')) {
      info.provider = 'sync';
      info.type = 'iframe';
      return info;
    }

    // Internxt - Embed iframe
    if (domain.includes('internxt.com')) {
      info.provider = 'internxt';
      info.type = 'iframe';
      return info;
    }

    // Direct MP4/MP3 - HTML5 player with full controls
    if (pathname.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      info.provider = 'html5-video';
      info.type = 'video';
      return info;
    }

    if (pathname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      info.provider = 'html5-audio';
      info.type = 'audio';
      return info;
    }

    // Default: HTML5 player
    info.provider = 'html5';
  } catch (e) {
    console.error("Invalid URL:", url, e);
  }

  return info;
}

// Helper to check if URL is directly embeddable
export function isDirectlyEmbeddable(url: string, type: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    // These providers block direct embedding
    const blockedDomains = ['mega.nz', 'mega.io'];
    if (blockedDomains.some(d => domain.includes(d))) {
      return false;
    }
    
    // Images from most CDNs work fine
    if (type === 'image') {
      return true;
    }
    
    // Check for direct file extensions
    const directExts = ['.mp4', '.webm', '.mp3', '.wav', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return directExts.some(ext => url.toLowerCase().includes(ext));
  } catch {
    return false;
  }
}

// Helper to get thumbnail URL for any media item
export function getThumbnail(url: string, type: string): string {
  // For images, return the URL itself
  if (type === 'image') {
    return url;
  }

  // YouTube - use thumbnail API
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
  }

  // Vimeo - use placeholder (would need API call in real app)
  if (url.includes('vimeo.com')) {
    return 'https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=400&h=225&fit=crop';
  }

  // Video type - use generic video thumbnail
  if (type === 'video') {
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop';
  }

  // Audio type - use generic audio thumbnail
  if (type === 'audio') {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop';
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-151447333015-45b65e60f6d5?w=400&h=225&fit=crop';
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match?.[1] || null;
}

export function isYouTubeUrl(url: string): boolean {
  return Boolean(getYouTubeId(url));
}