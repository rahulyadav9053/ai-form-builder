import React from 'react';
import { BarChart, LineChart, PieChart } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 animate-pulse-slow">
      <div className="flex gap-4 mb-8">
        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          <BarChart size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          <LineChart size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          <PieChart size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      
      <div className="h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-2 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      
      <p className="mt-8 text-gray-500 dark:text-gray-400 text-center">
        Analyzing your data<br />
        <span className="text-sm">Our AI is extracting insights...</span>
      </p>
    </div>
  );
};

export default LoadingState;