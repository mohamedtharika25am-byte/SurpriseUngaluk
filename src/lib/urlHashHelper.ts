import { Surprise } from '../types';

// Bulletproof UTF-8 to Base64 encoder for browser environments (supports emojis, Tamil, Unicode)
function utf8ToBase64(str: string): string {
  try {
    if (typeof TextEncoder !== 'undefined') {
      const bytes = new TextEncoder().encode(str);
      let binString = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binString += String.fromCharCode(bytes[i]);
      }
      return btoa(binString);
    }
  } catch (e) {
    console.warn('TextEncoder base64 fallback:', e);
  }

  // Fallback for environments without TextEncoder
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

// Bulletproof Base64 to UTF-8 decoder
function base64ToUtf8(str: string): string {
  try {
    const binString = atob(str);
    if (typeof TextDecoder !== 'undefined') {
      const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
  } catch (e) {
    console.warn('TextDecoder base64 fallback:', e);
  }

  // Fallback for environments without TextDecoder
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function encodeSurpriseToHash(surprise: Surprise): string {
  try {
    const sampleUnsplash = [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
    ];

    // Sanitize heavy base64 data URLs to sample Unsplash URLs for compact hash representation
    const sanitized: Surprise = {
      ...surprise,
      photo_urls: (surprise.photo_urls || []).map((url, i) =>
        !url || url.startsWith('data:') ? sampleUnsplash[i % sampleUnsplash.length] : url
      ),
      song_url: surprise.song_url && surprise.song_url.startsWith('data:') ? null : surprise.song_url,
      voice_note_url: surprise.voice_note_url && surprise.voice_note_url.startsWith('data:') ? null : surprise.voice_note_url,
      before_after: surprise.before_after
        ? {
            ...surprise.before_after,
            beforeUrl: surprise.before_after.beforeUrl && surprise.before_after.beforeUrl.startsWith('data:')
              ? sampleUnsplash[0]
              : surprise.before_after.beforeUrl,
            afterUrl: surprise.before_after.afterUrl && surprise.before_after.afterUrl.startsWith('data:')
              ? sampleUnsplash[1]
              : surprise.before_after.afterUrl
          }
        : null
    };

    const jsonStr = JSON.stringify(sanitized);
    return utf8ToBase64(jsonStr);
  } catch (e) {
    console.error('Failed to encode surprise to hash:', e);
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
    const jsonStr = base64ToUtf8(cleanHash);
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.id && parsed.recipient_name) {
      return parsed as Surprise;
    }
  } catch (e) {
    console.warn('Failed to decode surprise from hash:', e);
  }
  return null;
}
