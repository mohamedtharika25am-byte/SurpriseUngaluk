import { Surprise } from '../types';

export function encodeSurpriseToHash(surprise: Surprise): string {
  try {
    // Clone and sanitize heavy base64 strings to ensure compact URL hash
    const sampleUnsplash = [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
    ];

    const sanitized: Surprise = {
      ...surprise,
      photo_urls: (surprise.photo_urls || []).map((url, i) =>
        url.startsWith('data:') ? sampleUnsplash[i % sampleUnsplash.length] : url
      ),
      song_url: surprise.song_url && surprise.song_url.startsWith('data:') ? null : surprise.song_url,
      voice_note_url: surprise.voice_note_url && surprise.voice_note_url.startsWith('data:') ? null : surprise.voice_note_url,
      before_after: surprise.before_after
        ? {
            ...surprise.before_after,
            beforeUrl: surprise.before_after.beforeUrl.startsWith('data:')
              ? sampleUnsplash[0]
              : surprise.before_after.beforeUrl,
            afterUrl: surprise.before_after.afterUrl.startsWith('data:')
              ? sampleUnsplash[1]
              : surprise.before_after.afterUrl
          }
        : null
    };

    const jsonStr = JSON.stringify(sanitized);
    const encoded = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return encoded;
  } catch (e) {
    console.warn('Failed to encode surprise to hash:', e);
    return '';
  }
}

export function decodeSurpriseFromHash(hashStr: string): Surprise | null {
  try {
    if (!hashStr) return null;
    let cleanHash = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
    if (cleanHash.startsWith('s=')) {
      cleanHash = cleanHash.slice(2);
    } else if (cleanHash.includes('s=')) {
      const match = cleanHash.match(/s=([^&]+)/);
      if (match) cleanHash = match[1];
    }
    cleanHash = decodeURIComponent(cleanHash);
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanHash), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.id && parsed.recipient_name) {
      return parsed as Surprise;
    }
  } catch (e) {
    console.warn('Failed to decode surprise from hash:', e);
  }
  return null;
}
