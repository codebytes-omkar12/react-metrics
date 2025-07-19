import { useState } from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface ChildComponentProps {
  someProp: string;
}

const ChildComponent = ({ someProp }: ChildComponentProps) => {
  const [childCount, setChildCount] = useState(0);

  return (
    <div className="border w-full border-gray-300 p-4 m-2 rounded-md bg-white shadow-sm flex flex-col items-center justify-center">
      <p className="text-gray-600">
        Child State: <span className="font-medium">{childCount}</span>
      </p>
      <p className="text-gray-600">
        Child Prop (someProp): <span className="font-medium">{someProp}</span>
      </p>
      <button
        onClick={() => setChildCount((prev) => prev + 1)}
        className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
      >
        Update Child Count
      </button>
    </div>
  );
};

export default ChildComponent;
