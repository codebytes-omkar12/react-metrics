import React, { useState, useEffect } from "react";
import ChildComponent from "./ChildComponent";
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface TestComponentProps {
  someProp: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ someProp }) => {
  const [clickCount, setClickCount] = useState(0);
  usePerformanceMonitor({id:"TestComponent"});

  useEffect(() => {
    const clickInterval = setInterval(() => {
      setClickCount((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(clickInterval);
  }, []);

  return (
    <div className="border w-full border-blue-300 p-6 m-4 rounded-lg bg-blue-50 shadow-md flex flex-col items-center space-y-4 flex-1 min-w-[300px] max-w-sm sm:max-w-md lg:max-w-[48%]">
      <p className="text-gray-700">
        Internal State (Click Count): <span className="font-semibold">{clickCount}</span>
      </p>
      <p className="text-gray-700">
        Prop (someProp): <span className="font-semibold">{someProp}</span>
      </p>
      <ChildComponent someProp="A prop for the child" />
    </div>
  );
};

// ✅ Apply the same explicit ID pattern here.
export default withPerformanceMonitor(TestComponent, { id: 'TestComponent' });