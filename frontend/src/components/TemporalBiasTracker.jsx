import React, { useState, useEffect } from 'react';
import DynamicChart from './DynamicChart';

const TemporalBiasTracker = ({ temporalData }) => {
  const [selectedAttribute, setSelectedAttribute] = useState('race');
  const [selectedMetric, setSelectedMetric] = useState('approval_disparity');
  const [timeRange, setTimeRange] = useState('all');
  const [chartData, setChartData] = useState(null);

  // Available protected attributes
  const attributes = [
    { id: 'race', label: 'Race' },
    { id: 'gender', label: 'Gender' },
    { id: 'age_group', label: 'Age Group' },
    { id: 'disability_status', label: 'Disability Status' }
  ];

  // Available metrics
  const metrics = [
    { id: 'approval_disparity', label: 'Approval Rate Disparity' },
    { id: 'false_positive_disparity', label: 'False Positive Rate Disparity' },
    { id: 'false_negative_disparity', label: 'False Negative Rate Disparity' },
    { id: 'demographic_parity', label: 'Demographic Parity' },
    { id: 'equalized_odds', label: 'Equalized Odds' }
  ];

  // Available time ranges
  const timeRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'year', label: 'Last Year' },
    { id: 'quarter', label: 'Last Quarter' },
    { id: 'month', label: 'Last Month' }
  ];

  // Process data for chart when selections change
  useEffect(() => {
    if (!temporalData || !temporalData[selectedAttribute]) return;
    
    // Filter data by time range
    const filteredData = filterDataByTimeRange(temporalData[selectedAttribute], timeRange);
    
    // Format data for chart
    const formattedData = formatChartData(filteredData, selectedMetric);
    
    setChartData(formattedData);
  }, [temporalData, selectedAttribute, selectedMetric, timeRange]);

  // Filter data by time range
  const filterDataByTimeRange = (data, range) => {
    if (!data || range === 'all') return data;
    
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'quarter':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  // Format data for chart
  const formatChartData = (data, metric) => {
    if (!data) return null;
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Extract dates and metric values
    const dates = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item[metric]);
    
    // Calculate trend line (simple moving average)
    const trendValues = calculateTrendLine(values, 3);
    
    // Determine color based on metric type
    const color = getMetricColor(metric);
    
    return {
      labels: dates,
      datasets: [
        {
          label: getMetricLabel(metric),
          data: values,
          backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
          borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
          tension: 0.3
        },
        {
          label: 'Trend',
          data: trendValues,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.4
        }
      ]
    };
  };

  // Calculate trend line using simple moving average
  const calculateTrendLine = (values, windowSize) => {
    if (!values || values.length < windowSize) return values;
    
    const result = [];
    
    // Add null values at the beginning for alignment
    for (let i = 0; i < Math.floor(windowSize / 2); i++) {
      result.push(null);
    }
    
    // Calculate moving average
    for (let i = 0; i <= values.length - windowSize; i++) {
      const windowValues = values.slice(i, i + windowSize);
      const sum = windowValues.reduce((acc, val) => acc + val, 0);
      result.push(sum / windowSize);
    }
    
    // Add null values at the end for alignment
    for (let i = 0; i < Math.floor(windowSize / 2); i++) {
      result.push(null);
    }
    
    return result;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Get color for metric
  const getMetricColor = (metric) => {
    switch (metric) {
      case 'approval_disparity':
        return { r: 239, g: 68, b: 68 }; // Red
      case 'false_positive_disparity':
        return { r: 249, g: 115, b: 22 }; // Orange
      case 'false_negative_disparity':
        return { r: 234, g: 88, b: 12 }; // Dark orange
      case 'demographic_parity':
        return { r: 59, g: 130, b: 246 }; // Blue
      case 'equalized_odds':
        return { r: 16, g: 185, b: 129 }; // Green
      default:
        return { r: 107, g: 114, b: 128 }; // Gray
    }
  };

  // Get metric label
  const getMetricLabel = (metricId) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.label : metricId;
  };

  // Get attribute label
  const getAttributeLabel = (attributeId) => {
    const attribute = attributes.find(a => a.id === attributeId);
    return attribute ? attribute.label : attributeId;
  };

  // Analyze trend
  const analyzeTrend = () => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0].data) {
      return { trend: 'neutral', message: 'Insufficient data to analyze trend.' };
    }
    
    const values = chartData.datasets[0].data;
    if (values.length < 2) return { trend: 'neutral', message: 'Insufficient data to analyze trend.' };
    
    // Calculate average of first and last 3 points (or fewer if not available)
    const startCount = Math.min(3, Math.floor(values.length / 3));
    const endCount = Math.min(3, Math.floor(values.length / 3));
    
    const startValues = values.slice(0, startCount);
    const endValues = values.slice(values.length - endCount);
    
    const startAvg = startValues.reduce((sum, val) => sum + val, 0) / startValues.length;
    const endAvg = endValues.reduce((sum, val) => sum + val, 0) / endValues.length;
    
    const percentChange = ((endAvg - startAvg) / startAvg) * 100;
    
    // Determine trend direction
    if (percentChange < -10) {
      return { 
        trend: 'improving', 
        message: `${getMetricLabel(selectedMetric)} has decreased by ${Math.abs(percentChange).toFixed(1)}%, indicating improving fairness.` 
      };
    } else if (percentChange > 10) {
      return { 
        trend: 'worsening', 
        message: `${getMetricLabel(selectedMetric)} has increased by ${percentChange.toFixed(1)}%, indicating worsening fairness.` 
      };
    } else {
      return { 
        trend: 'stable', 
        message: `${getMetricLabel(selectedMetric)} has remained relatively stable (${percentChange.toFixed(1)}% change).` 
      };
    }
  };

  // Get insights based on temporal data
  const getInsights = () => {
    if (!temporalData || !temporalData[selectedAttribute]) {
      return ['No temporal data available for analysis.'];
    }
    
    const insights = [];
    const trend = analyzeTrend();
    
    // Add trend insight
    insights.push(trend.message);
    
    // Add insights based on trend
    if (trend.trend === 'worsening') {
      insights.push(`The increasing ${getMetricLabel(selectedMetric)} suggests the model may be learning biased patterns over time.`);
      insights.push(`Consider retraining the model with more diverse data or implementing stronger fairness constraints.`);
    } else if (trend.trend === 'improving') {
      insights.push(`The decreasing ${getMetricLabel(selectedMetric)} suggests that fairness interventions or data improvements are having a positive effect.`);
      insights.push(`Continue monitoring to ensure this positive trend continues.`);
    } else {
      insights.push(`The stable ${getMetricLabel(selectedMetric)} suggests that the model's fairness characteristics are consistent over time.`);
      insights.push(`Regular audits should be maintained to ensure fairness doesn't deteriorate.`);
    }
    
    // Add insight about volatility
    if (chartData && chartData.datasets && chartData.datasets[0].data) {
      const values = chartData.datasets[0].data;
      const volatility = calculateVolatility(values);
      
      if (volatility > 0.2) {
        insights.push(`High volatility in ${getMetricLabel(selectedMetric)} (${(volatility * 100).toFixed(1)}%) suggests inconsistent model behavior across different time periods.`);
      } else if (volatility < 0.05) {
        insights.push(`Low volatility in ${getMetricLabel(selectedMetric)} (${(volatility * 100).toFixed(1)}%) indicates consistent model behavior over time.`);
      }
    }
    
    return insights;
  };

  // Calculate volatility (coefficient of variation)
  const calculateVolatility = (values) => {
    if (!values || values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / mean;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fairness Over Time</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          This chart tracks how fairness metrics change over time, helping identify if bias increases or decreases as the model learns from new data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protected Attribute
            </label>
            <select
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {attributes.map(attr => (
                <option key={attr.id} value={attr.id}>{attr.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fairness Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {metrics.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {timeRanges.map(tr => (
                <option key={tr.id} value={tr.id}>{tr.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="lg:col-span-1">
            {chartData ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <DynamicChart
                  type="line"
                  data={chartData}
                  options={{
                    plugins: {
                      title: {
                        display: true,
                        text: `${getMetricLabel(selectedMetric)} for ${getAttributeLabel(selectedAttribute)} Over Time`
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toFixed(3)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: getMetricLabel(selectedMetric)
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time Period'
                        }
                      }
                    }
                  }}
                  height={350}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center h-[350px]">
                <p className="text-gray-500">No temporal data available for the selected attribute.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporalBiasTracker;
