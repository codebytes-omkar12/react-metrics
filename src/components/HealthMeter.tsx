import React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { LoaderPinwheel } from 'lucide-react';
import { useEffect } from 'react';
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { useParentId } from "../context/ParentMonitorContext";



interface HealthMeterProps {
  healthScore?: number;
  loading?: boolean;
}

const HealthMeter: React.FC<HealthMeterProps> = React.memo(({ healthScore = 0, loading = false }) => {
  
  usePerformanceMonitor({
    id: 'HealthMeter', // A unique ID for this component
    displayName: 'Health Meter',
  
    // Pass the component's props so the hook can track when they change
    props: { healthScore, loading },
  });
  let color = 'red';
  let label = 'Bad';


  if (healthScore >= 80) {
    color = 'green';
    label = 'Good';
  } else if (healthScore >= 50) {
    color = 'orange';
    label = 'Needs Improvement';
  }

  return (
    <div className="dark:bg-gray-900 rounded-xl p-4  flex flex-col items-center justify-center min-w-[160px]">
      <div className="w-36 h-36 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <LoaderPinwheel className="animate-spin-color h-40 w-40" />

          </div>
        ) : (
          <CircularProgressbar
            value={healthScore}
            text={`${healthScore}`}
            strokeWidth={10}
            styles={buildStyles({
              textSize: '24px',
              pathColor: color,
              textColor: color,
              trailColor: '#eee',
            })}
          />
        )}
      </div>
      {!loading && (
        <p className="mt-2 text-center font-semibold" style={{ color }}>
          {label}
        </p>
      )}
    </div>
  );
});

export default HealthMeter;
