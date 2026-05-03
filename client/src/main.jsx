import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e2535',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e2535' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e2535' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
