import { MediaItem } from '../types';

export type DownloadResult = {
  success: boolean;
  message: string;
  blobUrl?: string;
};

export async function downloadMedia(item: MediaItem): Promise<DownloadResult> {
  const { src, title, type } = item;
  
  // Generate filename
  const extension = getExtensionFromType(type, src);
  const sanitizedTitle = title.replace(/[^a-z0-9\u0900-\u097F]/gi, '_').substring(0, 50);
  const filename = `${sanitizedTitle}_${Date.now()}.${extension}`;
  
  try {
    // Try fetch with CORS mode
    const response = await fetch(src, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Create download link
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
    return {
      success: true,
      message: `Downloaded: ${filename}`,
    };
    
  } catch (error: any) {
    console.error('Download error:', error);
    
    // If CORS blocked, try alternative methods
    if (error.name === 'TypeError' || error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      return handleCorsDownload(src, filename);
    }
    
    return {
      success: false,
      message: `Download failed: ${error.message || 'Unknown error'}`,
    };
  }
}

function handleCorsDownload(src: string, _filename: string): DownloadResult {
  // For cross-origin resources, open in new tab
  // User can manually save from there
  
  const isImage = src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isVideo = src.match(/\.(mp4|webm|ogg|mov|avi)$/i);
  const isAudio = src.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i);
  
  // For direct file links, try to force download
  if (isImage || isVideo || isAudio) {
    // Open in new tab
    const newWindow = window.open(src, '_blank');
    
    if (newWindow) {
      return {
        success: true,
        message: 'Opened in new tab. Right-click and "Save as..." to download.',
      };
    }
  }
  
  // For other URLs (YouTube, Drive, etc.)
  window.open(src, '_blank');
  
  return {
    success: true,
    message: 'Opened source in new tab. Use browser save options.',
  };
}

function getExtensionFromType(type: string, src: string): string {
  // Try to extract from URL
  const urlMatch = src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  
  // Default based on type
  switch (type) {
    case 'image': return 'jpg';
    case 'video': return 'mp4';
    case 'audio': return 'mp3';
    default: return 'bin';
  }
}

export function getDownloadSize(url: string): Promise<string> {
  return new Promise((resolve) => {
    fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(response => {
        const size = response.headers.get('content-length');
        if (size) {
          const bytes = parseInt(size);
          if (bytes < 1024) resolve(`${bytes} B`);
          else if (bytes < 1024 * 1024) resolve(`${(bytes / 1024).toFixed(1)} KB`);
          else if (bytes < 1024 * 1024 * 1024) resolve(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
          else resolve(`${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`);
        } else {
          resolve('Unknown size');
        }
      })
      .catch(() => resolve('Unknown size'));
  });
}

export function isDownloadable(url: string): boolean {
  // Check if URL looks like a direct file
  const directPatterns = [
    /\.(mp4|webm|ogg|mp3|wav|m4a|flac|aac|jpg|jpeg|png|gif|webp|svg|pdf|zip|rar)$/i,
    /dropboxusercontent\.com/,
    /drive\.google\.com.*download/,
    /\/download\?/,
  ];
  
  return directPatterns.some(pattern => pattern.test(url));
}
