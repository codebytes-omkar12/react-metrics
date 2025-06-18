import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerformanceProvider } from './context/PerformanceContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerformanceProvider>
       <App />
    </PerformanceProvider>
   
  </StrictMode>
)
