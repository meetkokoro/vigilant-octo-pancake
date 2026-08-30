import { supabase } from '../lib/supabase';
import { SwipeDirection, IncomingLike, ReportReason } from '../types/dating';

export interface SwipeResult {
  isMatch: boolean;
  matchId: string | null;
}

/**
 * Records a swipe. The `record_swipe` SQL function creates the match row
 * server-side when the like is mutual, so the client can never fabricate one.
 */
export async function recordSwipe(
  targetId: string,
  direction: SwipeDirection
): Promise<SwipeResult> {
  if (!supabase) return { isMatch: false, matchId: null };

  const { data, error } = await supabase.rpc('record_swipe', {
    target_id: targetId,
    direction,
  });

  if (error) {
    console.error('[matchService] recordSwipe', error.message);
    return { isMatch: false, matchId: null };
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    isMatch: Boolean(result?.is_match),
    matchId: result?.match_id ?? null,
  };
}

export async function undoLastSwipe(): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.rpc('undo_last_swipe');
  if (error) {
    console.error('[matchService] undoLastSwipe', error.message);
    return false;
  }
  return true;
}

export async function fetchIncomingLikes(): Promise<IncomingLike[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('incoming_likes');
  if (error) {
    console.error('[matchService] fetchIncomingLikes', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    profileId: row.actor_id,
    likedAt: row.created_at,
    isSuperLike: row.direction === 'super',
  }));
}

export async function blockUser(targetId: string): Promise<boolean> {
  if (!supabase) return true;

  const { error } = await supabase.rpc('block_user', { target_id: targetId });
  if (error) {
    console.error('[matchService] blockUser', error.message);
    return false;
  }
  return true;
}

export async function unblockUser(targetId: string): Promise<boolean> {
  if (!supabase) return true;

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocked_id', targetId);
  if (error) {
    console.error('[matchService] unblockUser', error.message);
    return false;
  }
  return true;
}

export async function fetchBlockedIds(): Promise<string[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('blocks').select('blocked_id');
  if (error) {
    console.error('[matchService] fetchBlockedIds', error.message);
    return [];
  }
  return (data ?? []).map((row) => row.blocked_id as string);
}

export async function reportUser(
  targetId: string,
  reason: ReportReason,
  details: string
): Promise<boolean> {
  if (!supabase) return true;

  const { error } = await supabase.from('reports').insert({
    reported_id: targetId,
    reason,
    details: details.slice(0, 1000),
  });

  if (error) {
    console.error('[matchService] reportUser', error.message);
    return false;
  }
  return true;
}

export async function unmatch(matchId: string): Promise<boolean> {
  if (!supabase) return true;

  const { error } = await supabase.from('matches').delete().eq('id', matchId);
  if (error) {
    console.error('[matchService] unmatch', error.message);
    return false;
  }
  return true;
}
