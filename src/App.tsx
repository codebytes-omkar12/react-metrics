import './App.css'
import PerformanceDashboard from './components/PerformanceDashBoard'
import { PerformanceProvider } from './context/PerformanceContext'
import TestComponent from './components/TestComponent'
import { useState } from 'react'


function App() {
  
    // console.log((performance?.memory as any));
    const[dynamicPropValue,setDynamicPropvalue]=useState("initial dynamic prop");

    const handleDynamicProp=()=>{
      setDynamicPropvalue(new Date().toLocaleTimeString());
    }

  return (
    <PerformanceProvider>
      <div className="text-center mb-6">
          <button
            onClick={handleDynamicProp}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-lg"
          >
            Change Dynamic Prop for TestComponent (id=1)
          </button>
        </div>

      
        <TestComponent id={1} someProp={dynamicPropValue} />

        {/* <TestComponent id={2} someProp="static prop value" /> */}

      <PerformanceDashboard/>
       
    </PerformanceProvider>
  )
}

export default App
