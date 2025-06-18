import './App.css'
import PerformanceDashboard from './components/PerformanceDashBoard'
import { PerformanceProvider } from './context/PerformanceContext'
import TestComponent from './components/TestComponent'
import { useState } from 'react'
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor'


function App() {
  
    // console.log((performance?.memory as any));
    const[dynamicPropValue,setDynamicPropvalue]=useState("initial dynamic prop");

    const handleDynamicProp=()=>{
      setDynamicPropvalue(new Date().toLocaleTimeString());
    }
usePerformanceMonitor("App", "Application Root", {dynamicPropValue}, undefined);
  return (
     <PerformanceProvider>
      <div className="min-h-screen flex flex-auto items-center justify-center bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container w-full mx-auto p-8 bg-white rounded-xl shadow-2xl">
          <h1 className="text-center text-4xl font-extrabold text-gray-800 mb-8 pb-4 border-b-4 border-gray-200">
            Performance Monitoring Dashboard
          </h1>

          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <p className="text-lg font-medium text-gray-700">
              Global Prop: <strong className="text-blue-700">{dynamicPropValue}</strong>
            </p>
            <button onClick={handleDynamicProp}className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
              Increment Global Prop
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-10 p-6 bg-gray-50 rounded-xl shadow-inner">
  
            <TestComponent
              id="testComp1"
              displayName="TestComponent A"
              someProp={dynamicPropValue}
              parentId="App"
            />
            <TestComponent
              id="testComp2"
              displayName="TestComponent B"
              someProp={dynamicPropValue}
              parentId="App"
            />
          </div>

          <hr className="my-10 border-t-2 border-gray-300 w-full" />

        
          <PerformanceDashboard />
          
        </div>
      </div>
    </PerformanceProvider>
  )
}

export default App
