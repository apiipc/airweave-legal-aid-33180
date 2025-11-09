import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Wrapper around the auto-generated client that adds safe fallbacks
// Never edit src/integrations/supabase/client.ts directly.
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  || (PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : undefined);
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Helpful diagnostic to surface what's missing in environments
  // without breaking silent failures.
  // eslint-disable-next-line no-console
  console.error('[Supabase Config] Missing configuration', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_PUBLISHABLE_KEY,
    projectId: PROJECT_ID,
  });
  throw new Error('Missing Supabase configuration. Please ensure VITE_SUPABASE_URL (or VITE_SUPABASE_PROJECT_ID) and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
