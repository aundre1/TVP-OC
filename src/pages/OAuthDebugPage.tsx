// ============================================
// GOOGLE OAUTH DEBUG PAGE
// Temporary page to diagnose OAuth issues
// ============================================

import { useEffect, useState } from 'react';
import { OAUTH_CONFIG } from '@/config/oauth';

export default function OAuthDebugPage() {
  const [status, setStatus] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkOAuthStatus = () => {
      const clientId = OAUTH_CONFIG.google.clientId;
      const isConfigured = clientId && clientId !== 'your-client-id-here';

      const viteApiUrl = import.meta.env.VITE_API_URL;
      const apiHealthUrl = viteApiUrl ? `${viteApiUrl}/health` : 'N/A';

      setStatus({
        frontend: {
          viteGoogleClientId: clientId,
          isConfigured: isConfigured,
          clientIdLength: clientId?.length || 0,
          startsWith492: clientId?.startsWith('492'),
        },
        backend: {
          apiUrl: viteApiUrl,
          healthCheckUrl: apiHealthUrl,
        },
        environment: {
          nodeEnv: import.meta.env.MODE,
          isDev: import.meta.env.DEV,
          isProd: import.meta.env.PROD,
        },
      });
    };

    checkOAuthStatus();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Google OAuth Debug</h1>
      
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto mb-6">
        {JSON.stringify(status, null, 2)}
      </pre>

      <div className="space-y-4">
        <div className="border border-gray-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">✅ Frontend Configuration</h2>
          {status.frontend?.isConfigured ? (
            <p className="text-green-500">✓ VITE_GOOGLE_CLIENT_ID is set</p>
          ) : (
            <p className="text-red-500">✗ VITE_GOOGLE_CLIENT_ID is NOT set or placeholder</p>
          )}
        </div>

        <div className="border border-gray-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">🔧 Backend Endpoint</h2>
          <p>POST {status.backend?.apiUrl}/auth/google</p>
          <p className="text-sm text-gray-400">Expected payload: {"{ accessToken: string }"}</p>
        </div>

        <div className="border border-gray-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">📋 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>If Frontend Configuration shows ✗, set VITE_GOOGLE_CLIENT_ID on Vercel</li>
            <li>Set GOOGLE_CLIENT_ID on Railway backend</li>
            <li>Add OAuth redirect URIs in Google Cloud Console</li>
            <li>Clear browser cache and try again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
