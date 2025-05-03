import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ChartData } from '../types/data';

interface DataVisualizerProps {
  chartData: ChartData;
}

const DataVisualizer: React.FC<DataVisualizerProps> = ({ chartData }) => {
  // Generate a set of colors for pie charts and other multi-series charts
  const COLORS = [
    '#0A2463', '#E84855', '#06A77D', '#3ac06d', '#e69e2e', 
    '#4dc6ae', '#f95a70', '#7685b3', '#a86a1a', '#1d8b50'
  ];

  const renderTooltip = (props: any) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }
    
    const { payload } = props;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
        {payload.map((entry: any, index: number) => (
          <p 
            key={`tooltip-${index}`} 
            className="text-sm" 
            style={{ color: entry.color }}
          >
            <span className="font-medium">{entry.name}: </span>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    switch (chartData.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={chartData.keys.xAxis || 'name'} 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Bar 
                dataKey={chartData.keys.yAxis || chartData.keys.value || 'value'} 
                fill="#0A2463" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={chartData.keys.xAxis || 'name'} 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={chartData.keys.yAxis || chartData.keys.value || 'value'} 
                stroke="#06A77D" 
                strokeWidth={2}
                dot={{ stroke: '#06A77D', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#06A77D', strokeWidth: 2, r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey={chartData.keys.value || 'value'}
                nameKey={chartData.keys.category || 'name'}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                animationDuration={1500}
              >
                {chartData.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={chartData.keys.xAxis || 'name'} 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={chartData.keys.yAxis || chartData.keys.value || 'value'} 
                stroke="#E84855" 
                fill="#E84855" 
                fillOpacity={0.3}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-60 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Unsupported chart type: {chartData.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 h-full animate-fade-in">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {chartData.title}
      </h3>
      {chartData.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {chartData.description}
        </p>
      )}
      {renderChart()}
    </div>
  );
};

export default DataVisualizer;