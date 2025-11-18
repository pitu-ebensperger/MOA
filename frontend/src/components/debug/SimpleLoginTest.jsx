import React, { useState } from 'react';
import { useAuth } from '../../context/auth-context.js';

const SimpleLoginTest = () => {
  const { login, user, token, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('juan@test.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login...');
      const result = await login({ email, password });
      console.log('✅ Login exitoso:', result);
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      margin: '20px',
      background: '#f9f9f9'
    }}>
      <h3>🧪 Test de Login Simple</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Estado Actual:</strong></p>
        <p>• isAuthenticated: {String(isAuthenticated)}</p>
        <p>• Has token: {String(Boolean(token))}</p>
        <p>• Has user: {String(Boolean(user))}</p>
        {user && <p>• User: {user.nombre} ({user.email})</p>}
      </div>

      {!isAuthenticated && (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '5px', marginRight: '10px' }}
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '5px', marginRight: '10px' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '5px 10px' }}
            >
              {loading ? 'Cargando...' : 'Login'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}

      {isAuthenticated && (
        <div style={{ color: 'green', marginTop: '10px' }}>
          ✅ Login exitoso! Ya puedes ir al perfil.
          <br />
          <a href="/perfil" style={{ color: 'blue' }}>Ir al Perfil →</a>
        </div>
      )}
    </div>
  );
};

export default SimpleLoginTest;