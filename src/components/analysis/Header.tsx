import React from 'react';
import { Database } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <div className="text-primary-600 dark:text-primary-400">
              <Database size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Data Analyzer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automated insights from your data</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;