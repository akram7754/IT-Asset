import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force purge all old cached browser localStorage data to ensure fresh Excel & memo dataset
const CURRENT_DATA_VERSION = 'v18_hash_routing_fix';
if (localStorage.getItem('itam_data_version') !== CURRENT_DATA_VERSION) {
  const keysToKeep = ['itam_akram_password', 'itam_is_logged_in', 'itam_user_name', 'itam_user_role', 'itam_user_email'];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('itam_') && !keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('itam_data_version', CURRENT_DATA_VERSION);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
