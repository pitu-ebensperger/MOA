import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "../modules/auth/context/AuthContext.jsx";

import { App } from './App.jsx'

import '../styles/global.css'
import '../styles/motion.css'
import '../styles/tokens.css'
import '../styles/components/buttons.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
