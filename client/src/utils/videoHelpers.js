/**
 * Video Helper Utilities
 * Parses and extracts embed/stream information for tutor video introductions.
 * Supports: YouTube, Vimeo, Loom, Google Drive, and Direct Video Files (MP4/WebM/MOV).
 */

export function getVideoEmbedInfo(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, etc.
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      platform: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      videoId: ytMatch[1],
      originalUrl: trimmed
    };
  }

  // 2. Vimeo
  // Matches: vimeo.com/123456789 or player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      platform: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
      videoId: vimeoMatch[1],
      originalUrl: trimmed
    };
  }

  // 3. Loom
  // Matches: loom.com/share/ID or loom.com/embed/ID
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'loom',
      platform: 'Loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      videoId: loomMatch[1],
      originalUrl: trimmed
    };
  }

  // 4. Google Drive Preview
  // Matches: drive.google.com/file/d/ID/...
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: 'gdrive',
      platform: 'Google Drive',
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      videoId: gdriveMatch[1],
      originalUrl: trimmed
    };
  }

  // 5. Direct Video File or Local Server Upload
  const isDirectVideo =
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov|mkv|avi)(\?.*)?$/i.test(trimmed);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const fullSrc = trimmed.startsWith('/')
    ? `${backendUrl}${trimmed}`
    : trimmed;

  return {
    type: isDirectVideo ? 'direct' : 'direct',
    platform: isDirectVideo ? 'Direct Video' : 'Web Video',
    src: fullSrc,
    originalUrl: trimmed
  };
}

export function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:')
  );
}

export function getVideoPlatformLabel(url) {
  const info = getVideoEmbedInfo(url);
  return info ? info.platform : 'Video Link';
}

