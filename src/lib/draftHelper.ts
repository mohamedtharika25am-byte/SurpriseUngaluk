import { DraftSurprise } from '../types';

const SAVED_DRAFTS_KEY = 'surprise_saved_drafts';
const ACTIVE_DRAFT_KEY = 'surprise_active_draft';

// Fetch all saved drafts
export function getAllDrafts(): DraftSurprise[] {
  try {
    const data = localStorage.getItem(SAVED_DRAFTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error reading saved drafts:', e);
    return [];
  }
}

// Save or update a explicit named/saved draft
export function saveDraft(draftData: Omit<DraftSurprise, 'id' | 'updated_at'> & { id?: string }): DraftSurprise {
  const drafts = getAllDrafts();
  const now = new Date().toISOString();
  const id = draftData.id || `draft_${Date.now()}`;
  
  const recipientName = draftData.recipient_name.trim() || 'Untitled Recipient';
  const occasion = (draftData.occasion_type || 'birthday').toUpperCase();
  const title = `${recipientName}'s ${occasion} Surprise`;

  const fullDraft: DraftSurprise = {
    ...draftData,
    id,
    updated_at: now,
    title
  };

  const existingIdx = drafts.findIndex((d) => d.id === id);
  if (existingIdx >= 0) {
    drafts[existingIdx] = fullDraft;
  } else {
    drafts.unshift(fullDraft);
  }

  try {
    localStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.warn('Failed to save draft to localStorage:', e);
  }

  return fullDraft;
}

// Delete a single draft by ID
export function deleteDraft(id: string): void {
  try {
    const drafts = getAllDrafts().filter((d) => d.id !== id);
    localStorage.setItem(SAVED_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.warn('Failed to delete draft:', e);
  }
}

// Auto-save currently active form progress
export function autoSaveActiveDraft(draftData: Omit<DraftSurprise, 'id' | 'updated_at'>): void {
  try {
    // Only auto-save if user has typed something meaningful
    const hasData = 
      draftData.recipient_name.trim() ||
      draftData.sender_name.trim() ||
      draftData.message.trim() ||
      (draftData.photoPreviews && draftData.photoPreviews.length > 0);

    if (!hasData) return;

    const fullDraft: DraftSurprise = {
      ...draftData,
      id: 'active_auto_draft',
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(fullDraft));
  } catch (e) {
    console.warn('Failed to auto-save draft:', e);
  }
}

// Retrieve active auto-saved draft
export function getAutoSaveActiveDraft(): DraftSurprise | null {
  try {
    const data = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (!data) return null;
    return JSON.parse(data) as DraftSurprise;
  } catch (e) {
    console.warn('Error reading active auto-save draft:', e);
    return null;
  }
}

// Clear auto-save draft after submission or explicit discard
export function clearAutoSaveActiveDraft(): void {
  try {
    localStorage.removeItem(ACTIVE_DRAFT_KEY);
  } catch (e) {}
}
