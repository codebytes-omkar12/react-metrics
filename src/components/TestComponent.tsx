import React, { useState } from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import ChildComponent from "./ChildComponent";

/**
 * Props for the TestComponent
 * @property id - Unique ID of the component
 * @property displayName - Display name of the component
 * @property someProp - Some test prop to display and pass to children
 * @property parentId - (Optional) ID of the parent component
 */
interface TestComponentProps {
  id: string;
  displayName: string;
  someProp: string;
  parentId?: string;
}

/**
 * A test component that tracks internal state, performance metrics, and renders a child.
 * @param props - Component props including ID, display name, someProp, and optionally parent ID
 */
const TestComponent: React.FC<TestComponentProps> = ({
  id,
  displayName,
  someProp,
  parentId
}: TestComponentProps) => {


  const [clickCount, setClickCount] = 
    /**
   * Tracks the number of times the button has been clicked.
   * @param 0 - Initial click count value
   */
  useState(0);

const metrics = 
  /**
   * Monitors and reports performance metrics for this component.
   * @param id - Unique identifier for performance tracking
   * @param displayName - Display name label for metrics
   * @param someProp - Some test prop to display and pass to children
   * @param parentId - (Optional) ID of the parent component
   * @remarks This component internally tracks its own state and renders a child for profiling.
   */
usePerformanceMonitor(
    id,
    "Parent Component",
    { id, displayName, someProp, clickCount, parentId },
    parentId
  );

  /**
   * Increments the internal click count
   */
  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <div className="border w-full border-blue-300 p-6 m-4 rounded-lg bg-blue-50 shadow-md flex flex-col items-center space-y-4 flex-1 min-w-[300px] max-w-sm sm:max-w-md lg:max-w-[48%]">
      <h2 className="text-2xl font-bold text-blue-800">
        {metrics.displayName} <span className="text-base text-gray-500">(ID: {metrics.id})</span>
      </h2>
      <p className="text-gray-700">
        Internal State (Click Count): <span className="font-semibold">{clickCount}</span>
      </p>
      <p className="text-gray-700">
        Prop (someProp): <span className="font-semibold">{someProp}</span>
      </p>
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
