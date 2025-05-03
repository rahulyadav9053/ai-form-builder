import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Insight } from '../types/data';

interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 h-full border-l-4 border-secondary-500 animate-slide-up transition-all duration-300 hover:shadow-card-hover">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-full text-secondary-600 dark:text-secondary-400">
          <Lightbulb size={20} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {insight.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;