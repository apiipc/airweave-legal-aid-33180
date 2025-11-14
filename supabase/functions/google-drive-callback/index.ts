import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(
      `<html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error: '${error}' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (code) {
    return new Response(
      `<html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_CODE', code: '${code}' }, '*');
            window.close();
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  return new Response('Invalid request', { status: 400 });
});
