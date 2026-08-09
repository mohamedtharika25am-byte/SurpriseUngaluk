import { Surprise } from '../types';

// Bulletproof UTF-8 to Base64 encoder (supports emojis, Tamil, Unicode)
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

  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function encodeSurpriseToHash(surprise: Surprise): string {
  try {
    // Ultra-compact minified representation (~150 chars total) for WhatsApp compatibility
    const minified = {
      r: surprise.recipient_name,
      o: surprise.occasion_type,
      d: surprise.occasion_datetime,
      s: surprise.sender_name,
      m: surprise.message,
      b: surprise.birth_date || undefined,
      p: surprise.partner_name || undefined,
      n: surprise.nickname || undefined,
      t: surprise.theme_preference || undefined,
      x: surprise.timer_enabled ? 1 : 0
    };

    const jsonStr = JSON.stringify(minified);
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

    if (parsed) {
      // Minified compact format handling
      if (parsed.r) {
        return {
          id: parsed.i || 's_' + Date.now(),
          recipient_name: parsed.r,
          occasion_type: parsed.o || 'birthday',
          occasion_datetime: parsed.d || new Date().toISOString(),
          sender_name: parsed.s || 'Friend',
          message: parsed.m || '',
          photo_urls: [
            'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'
          ],
          song_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a81617.mp3?filename=happy-birthday-110058.mp3',
          timer_enabled: parsed.x !== 0,
          created_at: new Date().toISOString(),
          birth_date: parsed.b || null,
          partner_name: parsed.p || null,
          nickname: parsed.n || null,
          theme_preference: parsed.t || 'midnight',
          cake_cutting_enabled: true,
          balloons_game_enabled: true
        } as Surprise;
      }

      // Legacy full format handling
      if (parsed.id && parsed.recipient_name) {
        return parsed as Surprise;
      }
    }
  } catch (e) {
    console.warn('Failed to decode surprise from hash:', e);
  }
  return null;
}
