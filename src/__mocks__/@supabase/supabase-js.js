/**
 * Supabase Mock
 */

import { mockSupabase } from '../../__tests__/utils/testUtils';

// Supabaseクライアントのモック
export const supabase = mockSupabase;

export const createClient = jest.fn(() => mockSupabase);

export default {
  supabase,
  createClient,
};
