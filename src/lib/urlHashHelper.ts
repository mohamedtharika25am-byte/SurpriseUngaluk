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
    // Compact minified representation preserving custom photos & interactive features
    const minified: any = {
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

    if (surprise.photo_urls && surprise.photo_urls.length > 0) {
      const httpPhotos = surprise.photo_urls.filter((u) => u && !u.startsWith('data:'));
      if (httpPhotos.length > 0) minified.u = httpPhotos;
    }
    if (surprise.before_after) {
      const ba = { ...surprise.before_after };
      if (ba.beforeUrl?.startsWith('data:')) delete ba.beforeUrl;
      if (ba.afterUrl?.startsWith('data:')) delete ba.afterUrl;
      minified.ba = ba;
    }
    if (surprise.timeline_events?.length) minified.te = surprise.timeline_events;
    if (surprise.quiz_questions?.length) minified.qq = surprise.quiz_questions;
    if (surprise.inside_jokes?.length) minified.ij = surprise.inside_jokes;
    if (surprise.hidden_messages?.length) minified.hm = surprise.hidden_messages;
    if (surprise.scratch_cards?.length) minified.sc = surprise.scratch_cards;
    if (surprise.voice_note_url && !surprise.voice_note_url.startsWith('data:')) minified.vn = surprise.voice_note_url;
    if (surprise.balloon_messages?.length) minified.bm = surprise.balloon_messages;
    if (surprise.cake_cutting_enabled !== undefined) minified.ck = surprise.cake_cutting_enabled ? 1 : 0;
    if (surprise.balloons_game_enabled !== undefined) minified.bg = surprise.balloons_game_enabled ? 1 : 0;

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
          photo_urls: (parsed.u && Array.isArray(parsed.u) && parsed.u.length > 0)
            ? parsed.u
            : [],
          song_url: parsed.su || null,
          timer_enabled: parsed.x !== 0,
          created_at: new Date().toISOString(),
          birth_date: parsed.b || null,
          partner_name: parsed.p || null,
          nickname: parsed.n || null,
          theme_preference: parsed.t || 'midnight',
          before_after: parsed.ba || null,
          timeline_events: parsed.te || null,
          quiz_questions: parsed.qq || null,
          inside_jokes: parsed.ij || null,
          hidden_messages: parsed.hm || null,
          scratch_cards: parsed.sc || null,
          voice_note_url: parsed.vn || null,
          balloon_messages: parsed.bm || null,
          cake_cutting_enabled: parsed.ck !== 0,
          balloons_game_enabled: parsed.bg !== 0
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
