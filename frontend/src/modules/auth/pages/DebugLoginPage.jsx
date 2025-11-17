import React, { useState } from 'react';
import { authApi } from '@/services/auth.api.js'
import { env } from '@/config/env.js'

export default function DebugLoginPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 INICIO DEBUG LOGIN');
      console.log('Configuración:', {
        USE_MOCKS: env.USE_MOCKS,
        API_BASE_URL: env.API_BASE_URL
      });
      
      console.log('Credenciales enviadas:', { email, password });
      
      const response = await authApi.login({ email, password });
      
      console.log('✅ Respuesta exitosa:', response);
      setResult(response);
    } catch (err) {
      console.log('❌ Error capturado:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { email: 'admin@moa.cl', password: 'admin' },
    { email: 'demo@moa.cl', password: 'demo' },
    { email: 'cliente@mail.com', password: 'demo' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔍 Debug Login MOA</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuración Actual</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
{JSON.stringify({
  USE_MOCKS: env.USE_MOCKS,
  API_BASE_URL: env.API_BASE_URL,
  NODE_ENV: env.NODE_ENV
}, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Pruebas Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => testLogin(user.email, user.password)}
                disabled={loading}
                className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-left"
              >
                <div className="font-semibold">{user.email}</div>
                <div className="text-sm text-gray-600">Contraseña: {user.password}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Prueba Manual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              className="p-2 border rounded"
              id="manual-email"
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border rounded"
              id="manual-password"
            />
            <button
              onClick={() => {
                const email = document.getElementById('manual-email').value;
                const password = document.getElementById('manual-password').value;
                testLogin(email, password);
              }}
              disabled={loading}
              className="p-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Probando...' : 'Probar Login'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
            <p className="text-yellow-800">⏳ Ejecutando login...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 p-4 rounded mb-4">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error:</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">
{JSON.stringify({
  message: error.message,
  status: error.status,
  data: error.data,
  stack: error.stack
}, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 p-4 rounded mb-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Éxito:</h3>
            <pre className="text-sm text-green-700">
{JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-100 border border-blue-400 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📝 Instrucciones:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Abre las DevTools del navegador (F12)</li>
            <li>Ve a la pestaña Console</li>
            <li>Prueba cualquiera de los botones de arriba</li>
            <li>Revisa los logs en la consola para ver exactamente qué está pasando</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
