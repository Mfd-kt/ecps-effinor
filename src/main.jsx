import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { BannerProvider } from '@/contexts/BannerContext';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <BannerProvider>
            <App />
          </BannerProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </>
);