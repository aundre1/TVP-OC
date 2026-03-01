// ============================================
// THE VIDEO POOL - Spotify OAuth Callback Page
// Handles the PKCE code exchange after Spotify redirects back.
// Runs in a popup opened by SocialLoginGrid.
// ============================================

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SpotifyCallbackPage() {
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error || !code) {
        window.opener?.postMessage({ type: 'spotify-oauth-token', accessToken: null }, window.location.origin);
        window.close();
        return;
      }

      const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
      if (!codeVerifier) {
        window.opener?.postMessage({ type: 'spotify-oauth-token', accessToken: null }, window.location.origin);
        window.close();
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/spotify/callback`;
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

        const body = new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        });

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });

        const data = await response.json();
        sessionStorage.removeItem('spotify_code_verifier');

        window.opener?.postMessage(
          { type: 'spotify-oauth-token', accessToken: data.access_token ?? null },
          window.location.origin
        );
      } catch {
        window.opener?.postMessage({ type: 'spotify-oauth-token', accessToken: null }, window.location.origin);
      }

      window.close();
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary">
      <div className="flex flex-col items-center gap-3 text-tvp-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        <p className="text-sm">Completing Spotify sign-in…</p>
      </div>
    </div>
  );
}
