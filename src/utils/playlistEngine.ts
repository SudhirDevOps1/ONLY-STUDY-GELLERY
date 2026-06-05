import { MediaItem } from '../types';

// ============================================================
// SMART PLAYLIST ENGINE
// Agar JSON mein koi bhi image/video ke title ya category mein
// kuch likha hai to auto playlist ban jaaye
// Jaise: title="CSS Day 1", category="css-tutorial" → CSS playlist
// ============================================================

export interface Playlist {
  id: string;
  name: string;
  type: 'smart' | 'category' | 'keyword' | 'manual';
  items: MediaItem[];
  count: number;
  icon: string;
  color: string;
}

// Extract keyword from title - e.g. "CSS Day 1" → "CSS", "HTML Tutorial" → "HTML"
export function extractKeyword(title: string): string | null {
  const patterns = [
    /^(css|html|javascript|js|react|vue|angular|node|python|java|php|sql|mongodb|git|docker|aws|api|rest|graphql|typescript|ts)\b/i,
    /\b(css|html|javascript|js|react|vue|angular|node|python|java|php|sql|mongodb|git|docker|aws|api|rest|graphql|typescript|ts)\b/i,
    /^(day|part|lesson|class|chapter|module|episode|tutorial|course|lecture|session)\s*\d+/i,
    /(day|part|lesson|class|chapter|module|episode|tutorial|course|lecture|session)\s*\d+/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const keyword = match[1] || match[0];
      return keyword.toLowerCase();
    }
  }

  return null;
}

// Extract day/part number from title
export function extractSequenceNumber(title: string): number {
  const match = title.match(/(?:day|part|lesson|class|chapter|module|episode|session|tutorial|lecture)\s*[#:]?\s*(\d+)/i);
  if (match) return parseInt(match[1]);
  return 999; // Default high number for sorting
}

// Dynamic playlist detection
export function generatePlaylists(items: MediaItem[]): Playlist[] {
  const playlists: Playlist[] = [];
  const usedIds = new Set<string>();

  // 1. Category-based playlists (same category = playlist)
  const categoryGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    if (item.category) {
      const group = categoryGroups.get(item.category) || [];
      group.push(item);
      categoryGroups.set(item.category, group);
    }
  });

  categoryGroups.forEach((group, category) => {
    if (group.length >= 2) {
      const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
      const isYouTube = group.some(i => i.src.includes('youtube.com') || i.src.includes('youtu.be'));
      const types = [...new Set(group.map(i => i.type))];
      const typeLabel = types.length === 1 ? types[0] : 'mixed';
      
      playlists.push({
        id: `cat-${category}`,
        name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
        type: 'category',
        items: sorted,
        count: sorted.length,
        icon: isYouTube ? '▶️' : typeLabel === 'image' ? '🖼️' : typeLabel === 'video' ? '🎬' : typeLabel === 'audio' ? '🎵' : '📁',
        color: getColorForCategory(category)
      });
      sorted.forEach(i => usedIds.add(`${i.id}`));
    }
  });

  // 2. Keyword-based playlists (same keyword in title = playlist)
  const keywordGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    if (usedIds.has(`${item.id}`)) return;
    const keyword = extractKeyword(item.title);
    if (keyword) {
      const group = keywordGroups.get(keyword) || [];
      group.push(item);
      keywordGroups.set(keyword, group);
    }
  });

  keywordGroups.forEach((group, keyword) => {
    if (group.length >= 2) {
      const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
      playlists.push({
        id: `keyword-${keyword}`,
        name: keyword.toUpperCase() + ' Tutorials',
        type: 'keyword',
        items: sorted,
        count: sorted.length,
        icon: getCategoryIcon(keyword),
        color: getColorForKeyword(keyword)
      });
      sorted.forEach(i => usedIds.add(`${i.id}`));
    }
  });

  // 3. Type-based playlists
  const typeGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    const key = item.type + '-other';
    const group = typeGroups.get(key) || [];
    group.push(item);
    typeGroups.set(key, group);
  });

  typeGroups.forEach((group, type) => {
    if (group.length >= 2) {
      playlists.push({
        id: type,
        name: type === 'video-other' ? 'Other Videos' : type === 'image-other' ? 'Other Images' : 'Other Audio',
        type: 'smart',
        items: group,
        count: group.length,
        icon: type === 'video-other' ? '🎬' : type === 'image-other' ? '🖼️' : '🎵',
        color: type === 'video-other' ? '#8B5CF6' : type === 'image-other' ? '#3B82F6' : '#10B981'
      });
    }
  });

  // Sort playlists by count (most items first)
  return playlists.sort((a, b) => b.count - a.count);
}

// Check if a title has sequence pattern (Day 1, Part 2, etc.)
export function hasSequence(title: string): boolean {
  return /(?:day|part|lesson|class|chapter|module|episode|session|tutorial|lecture)\s*\d+/i.test(title);
}

// Get YouTube thumbnail
export function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

// Category icons
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    css: '🎨', html: '🌐', javascript: '⚡', js: '⚡', react: '⚛️',
    vue: '💚', angular: '🔴', node: '💚', python: '🐍', java: '☕',
    php: '🐘', sql: '🗄️', mongodb: '🍃', git: '🔀', docker: '🐳',
    aws: '☁️', api: '🔗', typescript: '📘',
    'english-class': '🇬🇧', english: '🇬🇧', hindi: '🇮🇳',
    nature: '🌿', music: '🎵', tutorial: '📚',
    image: '🖼️', video: '🎬', audio: '🎵',
  };
  return icons[category.toLowerCase()] || '📁';
}

// Category colors
function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'english-class': '#3B82F6', english: '#3B82F6', css: '#8B5CF6', html: '#F97316',
    javascript: '#EAB308', js: '#EAB308', react: '#06B6D4', vue: '#22C55E',
    python: '#22C55E', java: '#EC4899', tutorial: '#6366F1', music: '#EC4899',
    nature: '#22C55E', abstract: '#8B5CF6', personal: '#F97316',
  };
  return colors[category.toLowerCase()] || '#6366F1';
}

function getColorForKeyword(keyword: string): string {
  return getColorForCategory(keyword);
}

// Get playlist status text
export function getPlaylistStatus(items: MediaItem[]): string {
  const completed = items.filter(i => i.id).length;
  const total = items.length;
  if (total === 0) return '';
  const pct = Math.round((completed / total) * 100);
  return `${completed}/${total} (${pct}%)`;
}
