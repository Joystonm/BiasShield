import React, { useState, useEffect } from 'react';
import DynamicChart from './DynamicChart';

const FairnessRemediationPanel = ({ biasMetrics }) => {
  // Simple state management to avoid complex interactions
  const [selectedAttribute, setSelectedAttribute] = useState('race');
  const [selectedMetric, setSelectedMetric] = useState('approval_rate');
  const [remediationStrategy, setRemediationStrategy] = useState('threshold_optimization');
  const [remediationStrength, setRemediationStrength] = useState(0.5);
  const [chartData, setChartData] = useState(null);
  const [isRemediated, setIsRemediated] = useState(false);
  const [error, setError] = useState(null);

  // Available protected attributes
  const attributes = [
    { id: 'gender', label: 'Gender' },
    { id: 'race', label: 'Race' },
    { id: 'age_group', label: 'Age Group' },
    { id: 'disability_status', label: 'Disability Status' }
  ];

  // Available metrics
  const metrics = [
    { id: 'approval_rate', label: 'Approval Rate' },
    { id: 'false_positive_rate', label: 'False Positive Rate' },
    { id: 'false_negative_rate', label: 'False Negative Rate' }
  ];

  // Available remediation strategies
  const strategies = [
    { id: 'threshold_optimization', label: 'Threshold Optimization' },
    { id: 'reweighing', label: 'Reweighing' },
    { id: 'adversarial_debiasing', label: 'Adversarial Debiasing' },
    { id: 'fair_representations', label: 'Fair Representations' }
  ];

  // Update chart data whenever any parameter changes
  useEffect(() => {
    updateChartData();
  }, [selectedAttribute, selectedMetric, remediationStrategy, remediationStrength, isRemediated, biasMetrics]);

  // Handle attribute change
  const handleAttributeChange = (e) => {
    setSelectedAttribute(e.target.value);
    setError(null);
  };

  // Update chart data based on current parameters
  const updateChartData = () => {
    try {
      // Check if we have data for this attribute
      if (!biasMetrics || !biasMetrics[selectedAttribute] || !biasMetrics[selectedAttribute].group_metrics) {
        setError(`No data available for ${selectedAttribute}`);
        setChartData(null);
        return;
      }

      setError(null);
      
      // Get the original metrics for the selected attribute
      const originalMetrics = biasMetrics[selectedAttribute];
      
      // Get groups and their original values
      const groups = Object.keys(originalMetrics.group_metrics);
      const originalValues = groups.map(group => originalMetrics.group_metrics[group][selectedMetric]);
      
      // Calculate remediated values if needed
      let remediatedValues = [...originalValues]; // Default to original values
      
      if (isRemediated) {
        // Apply remediation based on strategy and strength
        remediatedValues = applyRemediation(originalMetrics, groups, originalValues);
      }
      
      // Create chart data
      setChartData({
        labels: groups,
        datasets: [
          {
            label: 'Original',
            data: originalValues,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'Remediated',
            data: remediatedValues,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      });
    } catch (err) {
      console.error("Error updating chart data:", err);
      setError(`Error: ${err.message}`);
      setChartData(null);
    }
  };

  // Apply remediation strategy to metrics
  const applyRemediation = (originalMetrics, groups, originalValues) => {
    // Find privileged group (highest approval rate)
    let privilegedGroupIndex = 0;
    let maxValue = -Infinity;
    
    originalValues.forEach((value, index) => {
      if (value > maxValue) {
        maxValue = value;
        privilegedGroupIndex = index;
      }
    });
    
    // Apply different remediation strategies
    const remediatedValues = [...originalValues];
    
    groups.forEach((group, index) => {
      if (index === privilegedGroupIndex) return; // Skip privileged group
      
      const privilegedValue = originalValues[privilegedGroupIndex];
      const unprivilegedValue = originalValues[index];
      const difference = privilegedValue - unprivilegedValue;
      
      // Apply remediation based on strategy and strength
      switch (remediationStrategy) {
        case 'threshold_optimization':
          // Simple linear adjustment
          remediatedValues[index] = unprivilegedValue + (difference * remediationStrength);
          break;
          
        case 'reweighing':
          // Multiplicative adjustment
          const ratio = privilegedValue / (unprivilegedValue || 0.001); // Avoid division by zero
          const adjustmentFactor = 1 + ((ratio - 1) * remediationStrength);
          remediatedValues[index] = unprivilegedValue * adjustmentFactor;
          break;
          
        case 'adversarial_debiasing':
        case 'fair_representations':
          // More aggressive adjustment
          remediatedValues[index] = unprivilegedValue + (difference * remediationStrength * 1.2);
          break;
          
        default:
          // No remediation
          break;
      }
      
      // Ensure values are within valid range
      remediatedValues[index] = Math.max(0, Math.min(1, remediatedValues[index]));
    });
    
    return remediatedValues;
  };

  // Apply remediation to the model
  const handleApplyRemediation = () => {
    setIsRemediated(true);
  };

  // Reset remediation
  const handleResetRemediation = () => {
    setIsRemediated(false);
  };

  // Calculate improvement percentage
  const calculateImprovement = () => {
    if (!chartData || !chartData.datasets || chartData.datasets.length < 2) return 0;
    
    const originalValues = chartData.datasets[0].data;
    const remediatedValues = chartData.datasets[1].data;
    
    // Calculate disparity (max - min) for both sets
    const originalDisparity = Math.max(...originalValues) - Math.min(...originalValues);
    const remediatedDisparity = Math.max(...remediatedValues) - Math.min(...remediatedValues);
    
    if (originalDisparity === 0) return 0;
    
    return ((originalDisparity - remediatedDisparity) / originalDisparity) * 100;
  };

  // Get remediation suggestions based on metrics
  const getRemediationSuggestions = () => {
    if (!biasMetrics || !biasMetrics[selectedAttribute]) return [];
    
    const metrics = biasMetrics[selectedAttribute];
    const suggestions = [];
    
    // Check approval rate disparity
    if (metrics.approval_disparity > 0.05) {
      suggestions.push(`Adjust approval thresholds for ${getSelectedAttributeLabel()} groups to reduce the ${(metrics.approval_disparity * 100).toFixed(1)}% gap in approval rates.`);
    }
    
    // Check false positive rate disparity
    if (metrics.false_positive_disparity > 0.05) {
      suggestions.push(`Implement reweighing to balance false positive rates across ${getSelectedAttributeLabel()} groups.`);
    }
    
    // Check false negative rate disparity
    if (metrics.false_negative_disparity > 0.05) {
      suggestions.push(`Consider adversarial debiasing to equalize false negative rates across ${getSelectedAttributeLabel()} groups.`);
    }
    
    // Add general suggestions
    suggestions.push(`Collect more training data for underrepresented ${getSelectedAttributeLabel()} groups.`);
    suggestions.push(`Review feature importance to identify potential proxy variables for ${getSelectedAttributeLabel()}.`);
    
    return suggestions;
  };

  // Get the selected metric's label
  const getSelectedMetricLabel = () => {
    const metric = metrics.find(m => m.id === selectedMetric);
    return metric ? metric.label : selectedMetric;
  };

  // Get the selected attribute's label
  const getSelectedAttributeLabel = () => {
    const attr = attributes.find(a => a.id === selectedAttribute);
    return attr ? attr.label : selectedAttribute;
  };

  // Get the selected strategy's label
  const getSelectedStrategyLabel = () => {
    const strategy = strategies.find(s => s.id === remediationStrategy);
    return strategy ? strategy.label : remediationStrategy;
  };

  // Get strategy description
  const getStrategyDescription = () => {
    switch (remediationStrategy) {
      case 'threshold_optimization':
        return "Adjusts decision thresholds for different groups to equalize error rates or approval rates.";
      case 'reweighing':
        return "Assigns different weights to training examples to ensure fair representation of all groups.";
      case 'adversarial_debiasing':
        return "Uses adversarial techniques to remove information about protected attributes from the model.";
      case 'fair_representations':
        return "Transforms the feature space to ensure similar distributions across protected groups.";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Fairness Remediation</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          This panel allows you to simulate different bias mitigation strategies and see their impact on fairness metrics.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protected Attribute
            </label>
            <select
              value={selectedAttribute}
              onChange={handleAttributeChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {attributes.map(attr => (
                <option key={attr.id} value={attr.id}>{attr.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Metric
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
              Remediation Strategy
            </label>
            <select
              value={remediationStrategy}
              onChange={(e) => setRemediationStrategy(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{getStrategyDescription()}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remediation Strength
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={remediationStrength}
              onChange={(e) => setRemediationStrength(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Minimal</span>
              <span>Balanced</span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Impact Visualization</h3>
            
            {error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700">{error}</p>
                <p className="text-red-600 text-sm mt-2">Please select a different protected attribute.</p>
              </div>
            ) : chartData ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <DynamicChart
                  type="bar"
                  data={chartData}
                  options={{
                    plugins: {
                      title: {
                        display: true,
                        text: `${getSelectedMetricLabel()} by ${getSelectedAttributeLabel()}`
                      },
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 1
                      }
                    }
                  }}
                  height={300}
                />
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Improvement:</strong> {calculateImprovement().toFixed(1)}% reduction in {getSelectedMetricLabel()} disparity
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Strategy:</strong> {getSelectedStrategyLabel()} at {(remediationStrength * 100).toFixed(0)}% strength
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Remediation Suggestions</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              {error ? (
                <p className="text-red-600">No suggestions available. Please select a different attribute.</p>
              ) : (
                <>
                  <ul className="space-y-3">
                    {getRemediationSuggestions().map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 text-sm text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={handleApplyRemediation}
                      disabled={isRemediated || error}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isRemediated || error
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Apply {getSelectedStrategyLabel()}
                    </button>
                    
                    <button
                      onClick={handleResetRemediation}
                      disabled={!isRemediated}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        !isRemediated
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Reset Model
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FairnessRemediationPanel;
