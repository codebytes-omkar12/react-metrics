import { useState, memo } from "react"; // Ensure memo is imported
import React from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";


interface testProps {
    id:number;
    someProp:string;
}

// Apply React.memo here
const TestComponent:React.FC<testProps>= memo(({id,someProp,...props})=>{

    usePerformanceMonitor("testComponent",{id,someProp,...props});
    const [clickCount, setClickCount] = useState<number>(0);

    const handleClick=()=>{
        setClickCount(prev=>prev+1);
    }

    return(
        <div className="p-4 border border-blue-300 rounded-md bg-blue-50 mb-4 text-center">
            <h4 className="text-lg font-semibold text-blue-800">Monitored Component: {id}</h4>
            <p className="text-gray-700">Prop `someProp`: "{someProp}"</p>
            <p className="text-gray-700">Internal Count: {clickCount}</p>
            <button
                onClick={handleClick}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                Increment Count (Triggers Re-render)
            </button>
        </div>
    )
}); // <- Add the closing parenthesis and semicolon for memo

export default TestComponent;