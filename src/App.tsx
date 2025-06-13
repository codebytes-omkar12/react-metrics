import './App.css'
import PerformanceDashboard from './components/PerformanceDashBoard'
import { PerformanceProvider } from './context/PerformanceContext'


function App() {
  
    // console.log((performance?.memory as any));

  return (
    <PerformanceProvider>
      <PerformanceDashboard/>
    </PerformanceProvider>
  )
}

export default App
