'use client';

import React, { useState } from 'react';
import { analyzeData } from '@/lib/api';
import { AnalysisResult, AnalysisStatus } from '@/types/data';

import Header from '@/components/analysis/Header';
import DataInput from '@/components/analysis/DataInput';
import DataVisualizer from '@/components/analysis/DataVisualizer';
import InsightCard from '@/components/analysis/InsightCard';
import LoadingState from '@/components/analysis/LoadingState';
import ErrorState from '@/components/analysis/ErrorState';

import { Download, Share2 } from 'lucide-react';

export default function Page() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>({ status: 'idle' });
  const [currentData, setCurrentData] = useState<any>(null);

  const handleDataSubmit = async (data: any) => {
    setStatus({ status: 'loading' });
    setCurrentData(data);

    try {
      const result = await analyzeData(data);
      setAnalysisResult(result);
      setStatus({ status: 'success' });
    } catch (error) {
      console.error('Analysis error:', error);
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleRetry = () => {
    if (currentData) {
      handleDataSubmit(currentData);
    } else {
      setStatus({ status: 'idle' });
    }
  };

  const handleDownloadResults = () => {
    if (!analysisResult) return;

    const resultsData = {
      originalData: currentData,
      insights: analysisResult.insights,
      charts: analysisResult.charts,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(resultsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = async () => {
    if (!analysisResult) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Data Analysis Results',
          text: `Here are my data insights: ${analysisResult.insights
            .map((i) => i.title)
            .join(', ')}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  const renderContent = () => {
    switch (status.status) {
      case 'loading':
        return <LoadingState />;

      case 'error':
        return <ErrorState message={status.error || ''} onRetry={handleRetry} />;

      case 'success':
        if (!analysisResult) return null;

        return (
          <div className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Analysis Results
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadResults}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={handleShareResults}
                  className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {analysisResult.insights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}

            {analysisResult.charts.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Data Visualizations
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysisResult.charts.map((chart) => (
                    <DataVisualizer key={chart.id} chartData={chart} />
                  ))}
                </div>
              </div>
            )}

            {/* <div className="mt-8 text-center">
              <button
                onClick={() => setStatus({ status: 'idle' })}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Analyze Different Data
              </button>
            </div> */}
          </div>
        );

      case 'idle':
      default:
        return <DataInput onDataSubmit={handleDataSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
