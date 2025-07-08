
import React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface HealthMeterProps {
  healthScore?: number;
}

const HealthMeter: React.FC<HealthMeterProps> = ({ healthScore = 0 }) => {
  let color = 'red';
  let label = 'Bad';

  if (healthScore >= 80) {
    color = 'green';
    label = 'Good';
  } else if (healthScore >= 50) {
    color = 'yellow';
    label = 'Needs Improvement';
  }

  return (
    <div className="...">
      <div className="w-40 h-40">
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
        <p className="mt-2 text-center font-semibold" style={{ color }}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default HealthMeter;
