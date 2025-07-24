import React, { useState, useEffect } from 'react';

const IntersectionalBiasHeatmap = ({ biasData }) => {
  const [primaryAttribute, setPrimaryAttribute] = useState('gender');
  const [secondaryAttribute, setSecondaryAttribute] = useState('race');
  const [metric, setMetric] = useState('approval_rate');
  const [heatmapData, setHeatmapData] = useState(null);
  const [metricRange, setMetricRange] = useState({ min: 0, max: 1 });
  const [availableCombinations, setAvailableCombinations] = useState([]);

  // Available protected attributes
  const attributes = [
    { id: 'gender', label: 'Gender' },
    { id: 'race', label: 'Race' },
    { id: 'age_group', label: 'Age Group' },
    { id: 'income_level', label: 'Income Level' },
    { id: 'disability_status', label: 'Disability Status' }
  ];

  // Available metrics
  const metrics = [
    { id: 'approval_rate', label: 'Approval Rate', goodHigh: true },
    { id: 'false_positive_rate', label: 'False Positive Rate', goodHigh: false },
    { id: 'false_negative_rate', label: 'False Negative Rate', goodHigh: false },
    { id: 'disparate_impact', label: 'Disparate Impact', goodHigh: true }
  ];

  // Get available combinations when biasData changes
  useEffect(() => {
    if (!biasData || !biasData.intersectional) return;
    
    const combinations = Object.keys(biasData.intersectional).map(key => {
      const [attr1, attr2] = key.split('_');
      return { key, attr1, attr2 };
    });
    
    setAvailableCombinations(combinations);
    
    // Set default secondary attribute based on primary attribute
    const validSecondaryAttrs = getAvailableSecondaryAttributes(primaryAttribute, combinations);
    if (validSecondaryAttrs.length > 0 && !validSecondaryAttrs.find(attr => attr.id === secondaryAttribute)) {
      setSecondaryAttribute(validSecondaryAttrs[0].id);
    }
  }, [biasData]);

  // Process data for heatmap when attributes or metric changes
  useEffect(() => {
    if (!biasData || !biasData.intersectional) return;
    
    // Try different key combinations
    const directKey = `${primaryAttribute}_${secondaryAttribute}`;
    const reverseKey = `${secondaryAttribute}_${primaryAttribute}`;
    
    let intersectionalData = null;
    
    if (biasData.intersectional[directKey]) {
      intersectionalData = biasData.intersectional[directKey];
    } else if (biasData.intersectional[reverseKey]) {
      intersectionalData = biasData.intersectional[reverseKey];
    }
    
    if (!intersectionalData) {
      setHeatmapData(null);
      return;
    }
    
    // Extract unique values for each attribute
    const primaryValues = [...new Set(intersectionalData.map(item => item[primaryAttribute]))];
    const secondaryValues = [...new Set(intersectionalData.map(item => item[secondaryAttribute]))];
    
    // Calculate min and max values for the selected metric
    const metricValues = intersectionalData.map(item => item[metric]).filter(val => val !== null && val !== undefined);
    const min = Math.min(...metricValues);
    const max = Math.max(...metricValues);
    
    setMetricRange({ min, max });
    
    setHeatmapData({
      primaryValues,
      secondaryValues,
      data: intersectionalData
    });
  }, [biasData, primaryAttribute, secondaryAttribute, metric]);

  // Get a human-readable metric name
  const getMetricLabel = () => {
    const metricObj = metrics.find(m => m.id === metric);
    return metricObj ? metricObj.label : metric;
  };

  // Get attribute labels
  const getPrimaryAttributeLabel = () => {
    const attr = attributes.find(a => a.id === primaryAttribute);
    return attr ? attr.label : primaryAttribute;
  };
  
  const getSecondaryAttributeLabel = () => {
    const attr = attributes.find(a => a.id === secondaryAttribute);
    return attr ? attr.label : secondaryAttribute;
  };

  // Is higher value better for this metric?
  const isHigherBetter = () => {
    const metricObj = metrics.find(m => m.id === metric);
    return metricObj ? metricObj.goodHigh : true;
  };

  // Function to get color based on value
  const getColorForValue = (value) => {
    if (value === null || value === undefined) return 'bg-gray-100';
    
    // Normalize value between 0 and 1 for color scale
    const { min, max } = metricRange;
    const normalized = max > min ? (value - min) / (max - min) : 0.5;
    
    // Choose color based on metric type
    if (isHigherBetter()) {
      // Green (good) to red (bad) scale for metrics where higher is better
      const r = Math.round(255 * (1 - normalized));
      const g = Math.round(255 * normalized);
      return `rgb(${r}, ${g}, 0)`;
    } else {
      // Red (bad) to green (good) scale for metrics where lower is better
      const r = Math.round(255 * normalized);
      const g = Math.round(255 * (1 - normalized));
      return `rgb(${r}, ${g}, 0)`;
    }
  };

  // Create a custom heatmap table for better visualization
  const renderHeatmapTable = () => {
    if (!heatmapData) return null;
    
    const { primaryValues, secondaryValues, data } = heatmapData;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-50">{getPrimaryAttributeLabel()} / {getSecondaryAttributeLabel()}</th>
              {secondaryValues.map(value => (
                <th key={value} className="border p-2 bg-gray-50">{value}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {primaryValues.map(primaryValue => (
              <tr key={primaryValue}>
                <th className="border p-2 bg-gray-50 text-left">{primaryValue}</th>
                {secondaryValues.map(secondaryValue => {
                  const item = data.find(
                    d => d[primaryAttribute] === primaryValue && d[secondaryAttribute] === secondaryValue
                  );
                  const value = item ? item[metric] : null;
                  
                  return (
                    <td 
                      key={secondaryValue} 
                      className="border p-2 text-center" 
                      style={{ 
                        backgroundColor: getColorForValue(value),
                        color: value !== null && ((isHigherBetter() && value > (metricRange.min + metricRange.max) / 2) || 
                                (!isHigherBetter() && value < (metricRange.min + metricRange.max) / 2)) ? 'white' : 'black'
                      }}
                    >
                      {value !== null && value !== undefined ? value.toFixed(2) : 'N/A'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render color legend
  const renderColorLegend = () => {
    const { min, max } = metricRange;
    const steps = 5;
    const stepValues = [];
    
    for (let i = 0; i <= steps; i++) {
      stepValues.push(min + (max - min) * (i / steps));
    }
    
    return (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Color Legend:</p>
        <div className="flex items-center">
          <div className="flex-grow flex h-6">
            {stepValues.map((_, index) => {
              const normalizedValue = index / steps;
              let backgroundColor;
              
              if (isHigherBetter()) {
                // Green (good) to red (bad)
                const r = Math.round(255 * (1 - normalizedValue));
                const g = Math.round(255 * normalizedValue);
                backgroundColor = `rgb(${r}, ${g}, 0)`;
              } else {
                // Red (bad) to green (good)
                const r = Math.round(255 * normalizedValue);
                const g = Math.round(255 * (1 - normalizedValue));
                backgroundColor = `rgb(${r}, ${g}, 0)`;
              }
              
              return (
                <div 
                  key={index} 
                  className="flex-grow h-full" 
                  style={{ backgroundColor }}
                ></div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between mt-1">
          {stepValues.map((value, index) => (
            <div key={index} className="text-xs text-gray-600">
              {value.toFixed(2)}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <div className="text-xs font-medium text-gray-700">
            {isHigherBetter() ? 'Worse' : 'Better'}
          </div>
          <div className="text-xs font-medium text-gray-700">
            {isHigherBetter() ? 'Better' : 'Worse'}
          </div>
        </div>
      </div>
    );
  };

  // Get available secondary attributes based on primary attribute
  const getAvailableSecondaryAttributes = (primary = primaryAttribute, combos = availableCombinations) => {
    // Filter to only include attributes that have data with the primary attribute
    const validSecondaryAttrs = [];
    const usedIds = new Set();
    
    if (combos.length > 0) {
      combos.forEach(combo => {
        let secondaryId = null;
        
        if (combo.attr1 === primary) {
          secondaryId = combo.attr2;
        } else if (combo.attr2 === primary) {
          secondaryId = combo.attr1;
        }
        
        if (secondaryId && !usedIds.has(secondaryId) && secondaryId !== primary) {
          const attr = attributes.find(a => a.id === secondaryId);
          if (attr) {
            validSecondaryAttrs.push(attr);
            usedIds.add(secondaryId);
          }
        }
      });
    }
    
    // If no valid attributes found, return all attributes except primary
    if (validSecondaryAttrs.length === 0) {
      return attributes.filter(attr => attr.id !== primary);
    }
    
    return validSecondaryAttrs;
  };

  // Handle primary attribute change
  const handlePrimaryAttributeChange = (e) => {
    const newPrimary = e.target.value;
    setPrimaryAttribute(newPrimary);
    
    // Update secondary attribute if needed
    const validSecondaryAttrs = getAvailableSecondaryAttributes(newPrimary);
    if (!validSecondaryAttrs.find(attr => attr.id === secondaryAttribute)) {
      setSecondaryAttribute(validSecondaryAttrs[0]?.id || 'race');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Intersectional Bias Analysis</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          This heatmap shows how combinations of protected attributes affect model outcomes, 
          revealing potential intersectional biases.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Attribute
            </label>
            <select
              value={primaryAttribute}
              onChange={handlePrimaryAttributeChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {attributes.map(attr => (
                <option key={attr.id} value={attr.id}>{attr.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Attribute
            </label>
            <select
              value={secondaryAttribute}
              onChange={(e) => setSecondaryAttribute(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {getAvailableSecondaryAttributes().map(attr => (
                <option key={attr.id} value={attr.id}>{attr.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {metrics.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {heatmapData ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderHeatmapTable()}
            {renderColorLegend()}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">No intersectional data available for {getPrimaryAttributeLabel()} + {getSecondaryAttributeLabel()}</p>
            
            <div className="text-sm text-gray-500 mt-2">
              <p>Try a different combination of attributes.</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>How to interpret:</strong> For {getMetricLabel()}, {isHigherBetter() ? 'higher values (green) are better' : 'lower values (green) are better'}. 
          The heatmap reveals patterns of bias across intersecting demographic groups.</p>
          
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Key Insights:</h4>
            {metric === 'approval_rate' && (
              <ul className="list-disc pl-5 mt-1 text-blue-800">
                <li>Look for clusters of red cells that indicate systematically disadvantaged groups</li>
                <li>Compare approval rates between similar groups to identify potential discrimination</li>
                <li>Pay special attention to intersections that show worse outcomes than either attribute alone</li>
              </ul>
            )}
            {metric === 'false_positive_rate' && (
              <ul className="list-disc pl-5 mt-1 text-blue-800">
                <li>Higher false positive rates (red) indicate groups incorrectly approved for loans they can't repay</li>
                <li>This can lead to higher default rates and financial harm to these communities</li>
              </ul>
            )}
            {metric === 'false_negative_rate' && (
              <ul className="list-disc pl-5 mt-1 text-blue-800">
                <li>Higher false negative rates (red) indicate groups incorrectly denied loans they could repay</li>
                <li>This represents lost opportunity for both applicants and lenders</li>
              </ul>
            )}
            {metric === 'disparate_impact' && (
              <ul className="list-disc pl-5 mt-1 text-blue-800">
                <li>Values below 0.80 (red) may indicate legally actionable disparate impact</li>
                <li>Regulatory guidelines often use 80% rule (0.80) as a threshold for potential discrimination</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntersectionalBiasHeatmap;
