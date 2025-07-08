import React, { useState, useEffect } from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import ChildComponent from "./ChildComponent";

/**
 * Props accepted by the TestComponent.
 */
interface TestComponentProps {
  /** A string passed down from the parent component */
  someProp: string;

  /** Optional parent component ID for tracking hierarchy */
  parentId?: string;
}

/**
 * A test component used to simulate dynamic state updates and measure React performance metrics.
 * It updates an internal counter every 5 seconds and passes props to a child component.
 *
 * @param someProp - A demo prop passed from the parent
 * @param parentId - Optional ID of the parent component
 */
const TestComponent: React.FC<TestComponentProps> = ({ someProp, parentId }) => {
 
  const [clickCount, setClickCount] = 
   /**
   * State to track how many times the component has internally updated.
   * @param initialCount - The initial click count (set to 0).
   */
  useState(0);

  /**
   * Automatically increments `clickCount` every 5 seconds.
   * Cleans up the interval on unmount to prevent memory leaks.
   */
  useEffect(() => {
    const clickInterval = setInterval(() => {
      setClickCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(clickInterval);
  }, []);

  
  const metrics = 
  /**
   * Extracts performance metrics for this component using a custom hook.
   * Tracks props, internal state, and assigns a display name.
   *
   * @param displayName - A user-friendly label for UI and logs
   * @param props - Props and internal state passed for analysis
   * @param parentId - Optional parent component ID to build hierarchy
   */
  usePerformanceMonitor({
    id:"TestComponent",
    displayName: "ParentComponent",
    props: { someProp, clickCount },
    parentId,
  });

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

      {/* Child component is rendered with inherited prop and parent ID */}
      <ChildComponent someProp={someProp} parentId={metrics.id} />
    </div>
  );
};

export default TestComponent;
