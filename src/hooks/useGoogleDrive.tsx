import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const GOOGLE_DRIVE_TOKEN_KEY = 'google_drive_token';

interface GoogleDriveTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export const useGoogleDrive = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a valid token
    const storedToken = localStorage.getItem(GOOGLE_DRIVE_TOKEN_KEY);
    setIsConnected(!!storedToken);
  }, []);

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get auth URL from edge function
      const { data: authData, error: authError } = await supabase.functions.invoke(
        'google-drive-oauth',
        {
          body: { action: 'getAuthUrl' }
        }
      );

      if (authError) throw authError;

      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authData.authUrl,
        'Google Drive OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_OAUTH_CODE') {
          const code = event.data.code;
          
          try {
            const { data: tokenData, error: exchangeError } = await supabase.functions.invoke(
              'google-drive-oauth',
              {
                body: { action: 'exchangeCode', code }
              }
            );

            if (exchangeError) throw exchangeError;

            // Store tokens
            localStorage.setItem(GOOGLE_DRIVE_TOKEN_KEY, JSON.stringify(tokenData));
            setIsConnected(true);
            popup?.close();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to connect';
            setError(message);
          } finally {
            setIsLoading(false);
          }
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          setError('OAuth failed: ' + event.data.error);
          setIsLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Cleanup listener after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        setIsLoading(false);
      }, 5 * 60 * 1000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem(GOOGLE_DRIVE_TOKEN_KEY);
    setIsConnected(false);
  };

  const listFiles = async () => {
    const tokenData = localStorage.getItem(GOOGLE_DRIVE_TOKEN_KEY);
    if (!tokenData) {
      throw new Error('Not connected to Google Drive');
    }

    const tokens: GoogleDriveTokens = JSON.parse(tokenData);

    const { data, error: fetchError } = await supabase.functions.invoke(
      'google-drive-oauth',
      {
        body: { 
          action: 'listFiles',
          accessToken: tokens.access_token 
        }
      }
    );

    if (fetchError) throw fetchError;
    return data.documents || [];
  };

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    listFiles,
  };
};
