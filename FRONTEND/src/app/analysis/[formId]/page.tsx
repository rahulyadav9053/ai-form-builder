"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DataVisualizer from "@/components/analysis/DataVisualizer";
import InsightCard from "@/components/analysis/InsightCard";
import { ENDPOINTS } from "@/constants";

export default function AnalysisPage() {
  const { formId } = useParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [charts, setCharts] = useState<any[]>([]);

  useEffect(() => {
    if (!formId) return;
    const fetchAnalysis = async () => {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_PATH}${ENDPOINTS.ANALYSIS}/${formId}`);
        if (!res.ok) {
          const errorText = await res.text();
          setError(`API error: ${res.status} - ${errorText}`);
          setStatus("error");
          return;
        }
        const data = await res.json();
        setInsights(data.insights || []);
        setCharts(data.charts || []);
        setStatus("success");
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setStatus("error");
      }
    };
    fetchAnalysis();
  }, [formId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <span className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4" />
        <p className="text-lg text-gray-600">Analyzing submissions...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-600">
        <p className="text-lg font-semibold mb-2">Error</p>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded"
          onClick={() => setStatus("idle")}
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-lg text-gray-600">Ready to analyze form submissions.</p>
      </div>
    );
  }

  // Success
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">{insights.length > 0? "Data Analysis Results" :"No Data Available"}</h2>
      {insights.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      )}
      {charts.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-4">Data Visualizations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <DataVisualizer key={chart.id} chartData={chart} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
