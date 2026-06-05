import { MediaItem } from '../types';

// ============================================================
// SMART PLAYLIST ENGINE - Production Level
// 
// Auto-detects playlists from:
// 1. (tag) prefix in title - "(css) Day 1", "(html) Class 5"
// 2. category field in JSON
// 3. Keywords like "Day 1", "Part 2", etc.
//
// Items WITHOUT (tag) and not in playlist → "Direct Items"
// ============================================================

export interface Playlist {
  id: string;
  name: string;
  type: 'tag' | 'category' | 'keyword' | 'manual';
  items: MediaItem[];
  count: number;
  icon: string;
  color: string;
  description?: string;
}

// ============================================================
// CORE DETECTION
// ============================================================

// Detect (tag) pattern in title - e.g. "(css) Day 1" → "css"
export function extractTag(title: string): string | null {
  const match = title.match(/^\(([^)]+)\)/);
  return match ? match[1].trim().toLowerCase() : null;
}

// Remove tag from title - "(css) Day 1" → "Day 1"
export function removeTag(title: string): string {
  return title.replace(/^\([^)]+\)\s*/, '').trim();
}

// Extract sequence number - "Day 1" → 1, "Part 5" → 5
export function extractSequenceNumber(title: string): number {
  const cleaned = removeTag(title);
  const match = cleaned.match(/(?:day|part|lesson|class|chapter|module|episode|tutorial|session|lecture)\s*[#:]?\s*(\d+)/i);
  if (match) return parseInt(match[1]);
  // Also try just leading number
  const numMatch = cleaned.match(/^\s*(\d+)/);
  if (numMatch) return parseInt(numMatch[1]);
  return 9999;
}

// Detect keyword from title (no tag found case)
export function extractKeyword(title: string): string | null {
  const patterns = [
    /\b(html|css|javascript|js|react|vue|angular|node|python|java|php|sql|mongodb|git|docker|aws|api|rest|graphql|typescript|ts|nextjs|tailwind|bootstrap|svelte|django|flask|spring|laravel|kotlin|swift|rust|go|ruby|scala|dart|flutter|express|fastapi|rails|jquery|ajax|json|xml|webpack|vite|npm|yarn|linux|bash|shell)\b/i,
    /\b(english|hindi|spanish|french|german|chinese|japanese|korean|arabic|russian|portuguese|italian)\b/i,
    /\b(math|physics|chemistry|biology|history|geography|economics|finance|accounting|statistics|calculus|algebra|geometry|trigonometry)\b/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

// ============================================================
// PLAYLIST GENERATION
// ============================================================

export function generatePlaylists(items: MediaItem[]): { playlists: Playlist[]; directItems: MediaItem[] } {
  const playlists: Playlist[] = [];
  const usedIds = new Set<string | number>();

  // STEP 1: Group by (tag) prefix - HIGHEST PRIORITY
  const tagGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    const tag = extractTag(item.title);
    if (tag) {
      const group = tagGroups.get(tag) || [];
      group.push(item);
      tagGroups.set(tag, group);
    }
  });

  // Create playlists from tag groups (even single items count)
  tagGroups.forEach((group, tag) => {
    const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
    const types = [...new Set(group.map(i => i.type))];
    
    playlists.push({
      id: `tag-${tag}`,
      name: tag.toUpperCase(),
      type: 'tag',
      items: sorted,
      count: sorted.length,
      icon: getCategoryIcon(tag),
      color: getColorForCategory(tag),
      description: `${sorted.length} ${sorted.length > 1 ? 'items' : 'item'} - ${types.join(', ')}`
    });
    sorted.forEach(i => usedIds.add(i.id));
  });

  // STEP 2: Group by category (for items without tag)
  const categoryGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    if (usedIds.has(item.id)) return;
    if (item.category) {
      const group = categoryGroups.get(item.category) || [];
      group.push(item);
      categoryGroups.set(item.category, group);
    }
  });

  categoryGroups.forEach((group, category) => {
    if (group.length >= 2) {
      const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
      const types = [...new Set(group.map(i => i.type))];
      
      playlists.push({
        id: `cat-${category}`,
        name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
        type: 'category',
        items: sorted,
        count: sorted.length,
        icon: getCategoryIcon(category),
        color: getColorForCategory(category),
        description: `${sorted.length} items - ${types.join(', ')}`
      });
      sorted.forEach(i => usedIds.add(i.id));
    }
  });

  // STEP 3: Group by keyword in title (last resort)
  const keywordGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    if (usedIds.has(item.id)) return;
    const kw = extractKeyword(item.title);
    if (kw) {
      const group = keywordGroups.get(kw) || [];
      group.push(item);
      keywordGroups.set(kw, group);
    }
  });

  keywordGroups.forEach((group, keyword) => {
    if (group.length >= 2) {
      const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
      playlists.push({
        id: `kw-${keyword}`,
        name: keyword.toUpperCase() + ' Series',
        type: 'keyword',
        items: sorted,
        count: sorted.length,
        icon: getCategoryIcon(keyword),
        color: getColorForCategory(keyword),
        description: `Auto-detected from titles`
      });
      sorted.forEach(i => usedIds.add(i.id));
    }
  });

  // STEP 4: Direct items - items not in any playlist
  const directItems = items.filter(i => !usedIds.has(i.id));

  // Sort playlists by count (largest first), then by name
  playlists.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });

  return { playlists, directItems };
}

// ============================================================
// HELPERS
// ============================================================

// YouTube thumbnail
export function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

// Get thumbnail for any item
export function getItemThumbnail(item: MediaItem): string | null {
  if (item.type === 'image') return item.src;
  const yt = getYoutubeThumbnail(item.src);
  return yt;
}

// Get clean title (without tag)
export function getCleanTitle(title: string): string {
  return removeTag(title);
}

// Category icons - extensive list
function getCategoryIcon(name: string): string {
  const icons: Record<string, string> = {
    // Programming
    css: '🎨', html: '🌐', javascript: '⚡', js: '⚡', typescript: '📘', ts: '📘',
    react: '⚛️', vue: '💚', angular: '🔴', node: '💚', svelte: '🧡', nextjs: '▲',
    python: '🐍', java: '☕', php: '🐘', ruby: '💎', go: '🐹', rust: '🦀',
    sql: '🗄️', mongodb: '🍃', git: '🔀', docker: '🐳', aws: '☁️',
    api: '🔗', rest: '🔗', graphql: '◢', tailwind: '🌊', bootstrap: '🅱',
    // Languages
    english: '🇬🇧', hindi: '🇮🇳', spanish: '🇪🇸', french: '🇫🇷',
    german: '🇩🇪', chinese: '🇨🇳', japanese: '🇯🇵', korean: '🇰🇷',
    // Subjects
    math: '📐', physics: '⚛️', chemistry: '🧪', biology: '🧬',
    history: '📜', geography: '🗺️', economics: '💹', finance: '💰',
    // Categories
    tutorial: '📚', music: '🎵', nature: '🌿', abstract: '🎨',
    personal: '👤', screenshot: '📸', sample: '🎬', work: '💼',
    fun: '🎉', news: '📰', sports: '⚽', food: '🍕', travel: '✈️',
    'english-class': '🇬🇧',
  };
  return icons[name.toLowerCase()] || '📁';
}

// Category colors
function getColorForCategory(name: string): string {
  const colors: Record<string, string> = {
    css: '#8B5CF6', html: '#F97316', javascript: '#EAB308', js: '#EAB308',
    typescript: '#3B82F6', ts: '#3B82F6', react: '#06B6D4', vue: '#22C55E',
    angular: '#DC2626', node: '#22C55E', svelte: '#F97316', nextjs: '#000000',
    python: '#FBBF24', java: '#EC4899', php: '#8B5CF6', ruby: '#DC2626',
    english: '#3B82F6', 'english-class': '#3B82F6', hindi: '#FF9933',
    spanish: '#FCD34D', french: '#3B82F6', german: '#000000',
    math: '#10B981', physics: '#6366F1', chemistry: '#F59E0B', biology: '#22C55E',
    tutorial: '#6366F1', music: '#EC4899', nature: '#22C55E', abstract: '#8B5CF6',
    personal: '#F97316', screenshot: '#06B6D4', sample: '#64748B', work: '#3B82F6',
    fun: '#EC4899', news: '#EF4444', sports: '#22C55E', food: '#F97316', travel: '#06B6D4',
  };
  return colors[name.toLowerCase()] || '#6366F1';
}
