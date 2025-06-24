import {useState} from "react";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

interface ChildComponentProps {
    id:string;
    someProp:string;
    parentId?:string;
}

const ChildComponent = ({ id, parentId, someProp }: ChildComponentProps) => {
    const [childCount, setChildCount] =/*To Configure the internal count state of the component*/ useState(0);
    const metrics =/*To extract the performance metrics*/ usePerformanceMonitor(id, "Child Component", { id, parentId, someProp ,childCount}, parentId);

    const incrementChild = () => setChildCount(prev => prev + 1);

    return (
        <div className="border w-full border-gray-300 p-4 m-2 rounded-md bg-white shadow-sm flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-gray-700">
                {metrics.displayName} <span className="text-sm text-gray-500">(ID: {metrics.id})</span>
            </h4>
            <p className="text-gray-600">Child State: <span className="font-medium">{childCount}</span></p>
            <p className="text-gray-600">Child Prop (someProp): <span className="font-medium">{someProp}</span></p>
            <button
                onClick={incrementChild}
                className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
            >
                {`Increment ${metrics.displayName} State`} 
            </button>
        </div>
    );
};

export default ChildComponent