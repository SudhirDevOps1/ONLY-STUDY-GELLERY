import { MediaItem } from '../types';

// ============================================================
// PLAYLIST ENGINE - Auto-detect from (tag) prefix
// Supports: (tag) videos, (tag) images, mixed, category, keyword
// Example: "(html) Day 1" + "(html) Day 2" → HTML playlist
//          "(htmlimg) Day 1 Notes" + "(htmlvid) Day 1 Video" → auto group
// ============================================================

export interface Playlist {
  id: string;
  name: string;
  displayName: string;
  type: 'tag' | 'category' | 'keyword';
  primaryType: 'image' | 'video' | 'audio' | 'mixed';
  items: MediaItem[];
  count: number;
  videoCount: number;
  imageCount: number;
  audioCount: number;
  icon: string;
  color: string;
  description: string;
}

// ============================================================
// TAG EXTRACTION
// ============================================================

// Extract (tag) from start of title - e.g. "(html) Day 1" → "html"
export function extractTag(title: string): string | null {
  const match = title.match(/^\(([^)]+)\)/);
  return match ? match[1].trim().toLowerCase() : null;
}

// Remove tag from title - "(html) Day 1" → "Day 1"
export function removeTag(title: string): string {
  return title.replace(/^\([^)]+\)\s*/, '').trim();
}

// Beautify tag name - "cssvid" → "CSS Videos", "cssimg" → "CSS Images"
export function beautifyTag(tag: string): string {
  const t = tag.toLowerCase();
  // Detect vid/video suffix
  if (t.endsWith('vid') || t.endsWith('video') || t.endsWith('videos')) {
    const base = t.replace(/(vid|video|videos)$/, '');
    return `${base.toUpperCase()} Videos`;
  }
  // Detect img/image suffix
  if (t.endsWith('img') || t.endsWith('image') || t.endsWith('images') || t.endsWith('pic') || t.endsWith('pics')) {
    const base = t.replace(/(img|image|images|pic|pics)$/, '');
    return `${base.toUpperCase()} Images`;
  }
  // Detect audio suffix
  if (t.endsWith('aud') || t.endsWith('audio') || t.endsWith('song') || t.endsWith('songs') || t.endsWith('music')) {
    const base = t.replace(/(aud|audio|song|songs|music)$/, '');
    return `${base.toUpperCase()} Audio`;
  }
  return tag.toUpperCase();
}

// Get base tag for icon/color - "cssvid" → "css"
export function getBaseTag(tag: string): string {
  const t = tag.toLowerCase();
  return t.replace(/(vid|video|videos|img|image|images|pic|pics|aud|audio|song|songs|music)$/, '') || t;
}

// Determine primary type based on content distribution
function determinePrimaryType(videoCount: number, imageCount: number, audioCount: number): 'image' | 'video' | 'audio' | 'mixed' {
  const total = videoCount + imageCount + audioCount;
  if (total === 0) return 'mixed';
  
  // If all items are same type
  if (videoCount === total) return 'video';
  if (imageCount === total) return 'image';
  if (audioCount === total) return 'audio';
  
  // If dominant type (>50%)
  if (videoCount / total > 0.5) return 'video';
  if (imageCount / total > 0.5) return 'image';
  if (audioCount / total > 0.5) return 'audio';
  
  // Otherwise mixed
  return 'mixed';
}

// Extract sequence number
export function extractSequenceNumber(title: string): number {
  const cleaned = removeTag(title);
  const patterns = [
    /(?:day|part|lesson|class|chapter|module|episode|tutorial|session|lecture|ch|ep|#)\s*[#:]?\s*(\d+)/i,
    /^\s*(\d+)[\s\.\-:)]/,
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return parseInt(match[1]);
  }
  return 9999;
}

// ============================================================
// YOUTUBE THUMBNAIL
// ============================================================

export function getYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/,
    /(?:youtu\.be\/)([^"&?\/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

// Get thumbnail for any item
export function getItemThumbnail(item: MediaItem): string | null {
  if (item.type === 'image') return item.src;
  return getYoutubeThumbnail(item.src);
}

// ============================================================
// ICON & COLOR MAPPING (extensive)
// ============================================================

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  const icons: Record<string, string> = {
    // Programming languages
    html: '🌐', html5: '🌐', htmlcss: '🎨',
    css: '🎨', css3: '🎨', sass: '💅', scss: '💅', less: '🎨', tailwind: '🌊', bootstrap: '🅱', material: '🎨',
    javascript: '⚡', js: '⚡', es6: '⚡', es7: '⚡',
    typescript: '📘', ts: '📘',
    react: '⚛️', reactjs: '⚛️', next: '▲', nextjs: '▲', gatsby: '🟣',
    vue: '💚', vuejs: '💚', nuxt: '💚',
    angular: '🔴', angularjs: '🔴',
    svelte: '🧡', solid: '💙',
    node: '💚', nodejs: '💚', express: '🚂', nest: '🦅', deno: '🦕',
    python: '🐍', django: '🎸', flask: '🧪', fastapi: '⚡',
    java: '☕', spring: '🌱', kotlin: '🟪',
    php: '🐘', laravel: '🎭', wordpress: '📝',
    ruby: '💎', rails: '🛤️',
    go: '🐹', golang: '🐹',
    rust: '🦀',
    c: '🔤', cpp: '🔤', csharp: '🟦', dotnet: '🟦',
    sql: '🗄️', mysql: '🐬', postgresql: '🐘', mongodb: '🍃', redis: '🟥', firebase: '🔥', supabase: '⚡',
    git: '🔀', github: '🐙', gitlab: '🦊', bitbucket: '🪣',
    docker: '🐳', kubernetes: '☸️', k8s: '☸️',
    aws: '☁️', azure: '☁️', gcp: '☁️', cloud: '☁️',
    api: '🔗', rest: '🔗', graphql: '◢', grpc: '📡',
    // Languages
    english: '🇬🇧', hindi: '🇮🇳', spanish: '🇪🇸', french: '🇫🇷',
    german: '🇩🇪', chinese: '🇨🇳', japanese: '🇯🇵', korean: '🇰🇷',
    arabic: '🇸🇦', urdu: '🇵🇰', bengali: '🇧🇩', tamil: '🇮🇳',
    // Subjects
    math: '📐', mathematics: '📐', algebra: '🔢', calculus: '∫', geometry: '📏', trigonometry: '📐', statistics: '📊',
    physics: '⚛️', chemistry: '🧪', biology: '🧬', science: '🔬',
    history: '📜', geography: '🗺️', civics: '🏛️', economics: '💹',
    accounting: '🧾', business: '💼', finance: '💰', marketing: '📈',
    philosophy: '🤔', psychology: '🧠', sociology: '👥',
    // Media types
    tutorial: '📚', course: '🎓', lecture: '🎤',
    music: '🎵', song: '🎤', audio: '🎵', podcast: '🎙️',
    nature: '🌿', wildlife: '🦁', travel: '✈️', food: '🍕', cooking: '🍳',
    sports: '⚽', fitness: '💪', yoga: '🧘',
    art: '🎨', design: '✏️', photography: '📷', drawing: '✏️',
    // Other
    personal: '👤', notes: '📝', screenshot: '📸', sample: '🎬',
    work: '💼', project: '🛠️', portfolio: '💼',
    fun: '🎉', news: '📰', movie: '🎬', anime: '🎌',
  };
  return icons[n] || '📁';
}

function getCategoryColor(name: string): string {
  const n = name.toLowerCase();
  const colors: Record<string, string> = {
    html: '#F97316', html5: '#F97316', htmlcss: '#F97316',
    css: '#8B5CF6', css3: '#8B5CF6', sass: '#EC4899', scss: '#EC4899', tailwind: '#06B6D4', bootstrap: '#7952B3', material: '#3B82F6',
    javascript: '#EAB308', js: '#EAB308', es6: '#EAB308',
    typescript: '#3B82F6', ts: '#3B82F6',
    react: '#06B6D4', next: '#000000', nextjs: '#000000', gatsby: '#663399',
    vue: '#22C55E', nuxt: '#00DC82',
    angular: '#DC2626',
    svelte: '#FF3E00', solid: '#0361D8',
    node: '#22C55E', express: '#000000', nest: '#E0234E', deno: '#000000',
    python: '#FBBF24', django: '#0C4B33', flask: '#000000', fastapi: '#009688',
    java: '#EC4899', spring: '#6DB33F', kotlin: '#7F52FF',
    php: '#777BB4', laravel: '#FF2D20', wordpress: '#21759B',
    ruby: '#DC2626', rails: '#CC0000',
    go: '#00ADD8', golang: '#00ADD8',
    rust: '#CE422B',
    sql: '#4479A1', mysql: '#4479A1', postgresql: '#336791', mongodb: '#13AA52', redis: '#DC382D', firebase: '#FFCA28', supabase: '#3ECF8E',
    git: '#F05032', github: '#181717', gitlab: '#FC6D26', bitbucket: '#0052CC',
    docker: '#2496ED', kubernetes: '#326CE5', k8s: '#326CE5',
    aws: '#FF9900', azure: '#0078D4', gcp: '#4285F4', cloud: '#4285F4',
    api: '#6366F1', rest: '#6366F1', graphql: '#E535AB', grpc: '#244C5A',
    english: '#3B82F6', hindi: '#FF9933', spanish: '#FCD34D', french: '#3B82F6',
    german: '#000000', chinese: '#DC2626', japanese: '#EC4899', korean: '#3B82F6',
    math: '#10B981', mathematics: '#10B981', algebra: '#10B981', calculus: '#10B981', geometry: '#10B981', statistics: '#10B981',
    physics: '#6366F1', chemistry: '#F59E0B', biology: '#22C55E', science: '#06B6D4',
    history: '#F59E0B', geography: '#22C55E', economics: '#3B82F6',
    accounting: '#8B5CF6', finance: '#22C55E', marketing: '#EC4899',
    philosophy: '#8B5CF6', psychology: '#EC4899', sociology: '#06B6D4',
    tutorial: '#6366F1', course: '#8B5CF6', lecture: '#EC4899',
    music: '#EC4899', song: '#EC4899', audio: '#10B981', podcast: '#8B5CF6',
    nature: '#22C55E', travel: '#06B6D4', food: '#F97316', cooking: '#F97316',
    sports: '#22C55E', fitness: '#EF4444', yoga: '#A855F7',
    art: '#EC4899', design: '#8B5CF6', photography: '#3B82F6',
    personal: '#F97316', notes: '#EAB308', screenshot: '#06B6D4', sample: '#64748B', work: '#3B82F6', project: '#8B5CF6',
    fun: '#EC4899', news: '#EF4444', movie: '#8B5CF6', anime: '#EC4899',
  };
  return colors[n] || '#6366F1';
}

// ============================================================
// PLAYLIST GENERATION - 3 STRATEGIES
// ============================================================

export function generatePlaylists(items: MediaItem[]): { playlists: Playlist[]; directItems: MediaItem[] } {
  const playlists: Playlist[] = [];
  const usedIds = new Set<string | number>();

  // === STRATEGY 1: (tag) prefix grouping (HIGHEST PRIORITY) ===
  const tagGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    const tag = extractTag(item.title);
    if (tag) {
      const group = tagGroups.get(tag) || [];
      group.push(item);
      tagGroups.set(tag, group);
    }
  });

  tagGroups.forEach((group, tag) => {
    const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
    const videos = sorted.filter(i => i.type === 'video');
    const images = sorted.filter(i => i.type === 'image');
    const audios = sorted.filter(i => i.type === 'audio');

    const baseTag = getBaseTag(tag);
    playlists.push({
      id: `tag-${tag}`,
      name: tag,
      displayName: beautifyTag(tag),
      type: 'tag',
      primaryType: determinePrimaryType(videos.length, images.length, audios.length),
      items: sorted,
      count: sorted.length,
      videoCount: videos.length,
      imageCount: images.length,
      audioCount: audios.length,
      icon: getCategoryIcon(baseTag),
      color: getCategoryColor(baseTag),
      description: `${sorted.length} ${sorted.length > 1 ? 'items' : 'item'} • ${videos.length}v ${images.length}i ${audios.length}a`
    });
    sorted.forEach(i => usedIds.add(i.id));
  });

  // === STRATEGY 2: Same category grouping ===
  const categoryGroups = new Map<string, MediaItem[]>();
  items.forEach(item => {
    if (usedIds.has(item.id)) return;
    const cat = item.category?.toLowerCase() || '';
    if (cat) {
      const group = categoryGroups.get(cat) || [];
      group.push(item);
      categoryGroups.set(cat, group);
    }
  });

  categoryGroups.forEach((group, category) => {
    if (group.length >= 2) {
      const sorted = [...group].sort((a, b) => extractSequenceNumber(a.title) - extractSequenceNumber(b.title));
      const videos = sorted.filter(i => i.type === 'video');
      const images = sorted.filter(i => i.type === 'image');
      const audios = sorted.filter(i => i.type === 'audio');

      playlists.push({
        id: `cat-${category}`,
        name: category,
        displayName: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
        type: 'category',
        primaryType: determinePrimaryType(videos.length, images.length, audios.length),
        items: sorted,
        count: sorted.length,
        videoCount: videos.length,
        imageCount: images.length,
        audioCount: audios.length,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        description: `${sorted.length} items`
      });
      sorted.forEach(i => usedIds.add(i.id));
    }
  });

  // === STRATEGY 3: Direct items (no tag, no category group) ===
  const directItems = items.filter(i => !usedIds.has(i.id));

  // Sort: largest first, then by name
  playlists.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.displayName.localeCompare(b.displayName);
  });

  return { playlists, directItems };
}
