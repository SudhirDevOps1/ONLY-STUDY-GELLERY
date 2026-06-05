export interface MediaItem {
  id: string | number;
  title: string;
  type: 'image' | 'video' | 'audio';
  src: string;
  category?: string;
  description?: string;
  addedAt?: number;
}

export interface CloudInfo {
  provider: string;
  type: 'image' | 'video' | 'audio' | 'iframe';
  embedUrl: string;
  originalUrl: string;
}

export type SortBy = 'title' | 'category' | 'type' | 'recent';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
export type Theme = 'dark' | 'light';

export interface GallerySettings {
  theme: Theme;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  showFavoritesOnly: boolean;
  slideshowInterval: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
