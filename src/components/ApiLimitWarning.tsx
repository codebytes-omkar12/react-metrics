import React from 'react';
import { usePerformanceStore } from '../stores/performanceStore';
import { AlertCircle } from 'lucide-react';

const ApiLimitWarning: React.FC = () => {
  const isApiLimitExceeded = usePerformanceStore((state) => state.isApiLimitExceeded);

  if (!isApiLimitExceeded) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-500 font-semibold animate-pulse">
      <AlertCircle size={16} />
      <span>API Token Limit Exceeded</span>
    </div>
  );
};

export default ApiLimitWarning;