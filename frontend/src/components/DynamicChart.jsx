import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const DynamicChart = ({ type, data, options, height = 300 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If chart already exists, destroy it before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Handle special chart types
      let chartType = type;
      let chartData = data;
      let chartOptions = { ...options };
      
      // Convert heatmap type to standard chart types
      if (type === 'heatmap') {
        // Use a standard chart type instead
        chartType = 'bar';
        
        if (data && data.datasets) {
          // Transform the data structure for a stacked bar chart that looks like a heatmap
          chartOptions = {
            ...chartOptions,
            indexAxis: 'y',
            scales: {
              x: {
                stacked: true,
                grid: {
                  display: false
                },
                ...(options.scales?.x || {})
              },
              y: {
                stacked: true,
                grid: {
                  display: false
                },
                ...(options.scales?.y || {})
              }
            },
            plugins: {
              ...options.plugins,
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                },
                ...(options.plugins?.tooltip || {})
              }
            }
          };
        }
      }
      
      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...chartOptions
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DynamicChart;
