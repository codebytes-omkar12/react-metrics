import { useState } from "react";
import React from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import ChildComponent from "./ChildComponent";

interface TestComponentProps {
    id: string;
    displayName: string;
    someProp: string;
    parentId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ id, displayName, someProp, parentId }: TestComponentProps) => {

 
    const [clickCount, setClickCount] = /*Handles Internal state*/useState(0);

    // Monitors component performance
    const metrics = /*Extract Metrics from the component*/usePerformanceMonitor(
        id,
        "Parent Component",
        { id, displayName, someProp, clickCount, parentId },
        parentId
    );

    const handleClick = () => {
        setClickCount(prev => prev + 1);
    };

    return (
        <div className="border w-full border-blue-300 p-6 m-4 rounded-lg bg-blue-50 shadow-md flex flex-col items-center space-y-4
                    flex-1 min-w-[300px] max-w-sm sm:max-w-md lg:max-w-[48%]">
            <h2 className="text-2xl font-bold text-blue-800">
                {metrics.displayName} <span className="text-base text-gray-500">(ID: {metrics.id})</span>
            </h2>
            <p className="text-gray-700">Internal State (Click Count): <span className="font-semibold">{clickCount}</span></p>
            <p className="text-gray-700">Prop (someProp): <span className="font-semibold">{someProp}</span></p>
            <button
                onClick={handleClick}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 transform hover:-translate-y-0.5"
            >
                {`Increment ${metrics.displayName} State`}
            </button>

            <ChildComponent
                id={`${id}-child`}
                parentId={id}
                someProp={someProp}
            />
        </div>
    );
};

export default TestComponent;
