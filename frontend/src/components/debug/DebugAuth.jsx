import React from 'react';
import { useAuth } from '../../context/auth-context.js';

const DebugAuth = () => {
  const { user, token, status, error, isAuthenticated } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Debug Auth</h4>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
      <p><strong>Has Token:</strong> {String(Boolean(token))}</p>
      <p><strong>Has User:</strong> {String(Boolean(user))}</p>
      {user && (
        <div>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>User Name:</strong> {user.nombre}</p>
          <p><strong>User Email:</strong> {user.email}</p>
        </div>
      )}
      {error && (
        <div style={{ color: 'red' }}>
          <p><strong>Error:</strong> {error.message}</p>
        </div>
      )}
    </div>
  );
};

export default DebugAuth;