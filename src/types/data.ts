export interface Insight {
    title: string;
    description: string;
    id: string;
  }

  export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'area';
    title: string;
    description: string;
    data: any[];
    keys: {
      xAxis?: string;
      yAxis?: string;
      category?: string;
      value?: string;
    };
    id: string;
  }

  export interface AnalysisResult {
    insights: Insight[];
    charts: ChartData[];
    rawResponse?: string;
  }

  export interface AnalysisStatus {
    status: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
  }