import React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { HashLoader, RingLoader } from 'react-spinners';
import withPerformanceMonitor from "../HOC/withPerformanceMonitor";

interface HealthMeterProps {
  healthScore?: number;
  loading?: boolean;
}

const HealthMeter: React.FC<HealthMeterProps> = React.memo((props) => {
  const { healthScore = 0, loading = false } = props;

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
            <HashLoader size={100} color="#6042f5"/>
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

export default withPerformanceMonitor(HealthMeter, { id: 'HealthMeter' });