import { Surprise } from '../types';

export function encodeSurpriseToHash(surprise: Surprise): string {
  try {
    const jsonStr = JSON.stringify(surprise);
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
