import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force purge all old cached browser localStorage data to ensure fresh Excel & memo dataset
const CURRENT_DATA_VERSION = 'v16_emp_cleared';
if (localStorage.getItem('itam_data_version') !== CURRENT_DATA_VERSION) {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('itam_') && key !== 'itam_akram_password' && key !== 'itam_is_logged_in') {
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
