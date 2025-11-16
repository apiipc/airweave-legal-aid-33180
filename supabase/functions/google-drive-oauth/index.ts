import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, accessToken } = await req.json();

    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const redirectUri = `${supabaseUrl}/functions/v1/google-drive-callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Generate authorization URL
    if (action === 'getAuthUrl') {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/drive.readonly');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      console.log('Generated auth URL with redirect:', redirectUri);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for tokens
    if (action === 'exchangeCode') {
      if (!code) {
        throw new Error('Authorization code is required');
      }

      console.log('Exchanging code for tokens...');

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange error:', error);
        throw new Error('Failed to exchange authorization code');
      }

      const tokens = await tokenResponse.json();
      console.log('Successfully obtained tokens');
      
      return new Response(
        JSON.stringify(tokens),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List Google Drive files
    if (action === 'listFiles') {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      console.log('Fetching files from Google Drive...');

      // List files from Google Drive
      const filesResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,webViewLink,createdTime)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!filesResponse.ok) {
        const error = await filesResponse.text();
        console.error('Drive API error:', error);
        throw new Error('Failed to fetch files from Google Drive');
      }

      const driveData = await filesResponse.json();
      
      // Transform to match our document format
      const documents = driveData.files.map((file: any) => ({
        id: file.id,
        filename: file.name,
        source: 'Google Drive',
        url: file.webViewLink,
        link: file.webViewLink, // Use webViewLink for direct browser access
        metadata: {
          mimeType: file.mimeType,
          createdTime: file.createdTime,
        },
      }));

      console.log(`Listed ${documents.length} files from Google Drive`);

      return new Response(
        JSON.stringify({ documents }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
