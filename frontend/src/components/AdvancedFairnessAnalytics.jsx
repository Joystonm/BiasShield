import React, { useState, useEffect } from 'react';
import IntersectionalBiasHeatmap from './IntersectionalBiasHeatmap';
import FairnessRemediationPanel from './FairnessRemediationPanel';
import TemporalBiasTracker from './TemporalBiasTracker';
import { generateMockIntersectionalData } from '../services/intersectionalBiasService';
import { generateMockTemporalData } from '../services/temporalBiasService';

const AdvancedFairnessAnalytics = ({ biasMetrics }) => {
  const [activeTab, setActiveTab] = useState('intersectional');
  const [intersectionalData, setIntersectionalData] = useState(null);
  const [temporalData, setTemporalData] = useState(null);

  // Load mock data for demonstration
  useEffect(() => {
    // Generate mock intersectional data
    const mockIntersectionalData = generateMockIntersectionalData();
    setIntersectionalData(mockIntersectionalData);
    
    // Generate mock temporal data
    const mockTemporalData = generateMockTemporalData();
    setTemporalData(mockTemporalData);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('intersectional')}
              className={`${
                activeTab === 'intersectional'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Intersectional Bias Analysis
            </button>
            <button
              onClick={() => setActiveTab('remediation')}
              className={`${
                activeTab === 'remediation'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Fairness Remediation
            </button>
            <button
              onClick={() => setActiveTab('temporal')}
              className={`${
                activeTab === 'temporal'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Temporal Bias Tracking
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'intersectional' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Intersectional Bias Analysis</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Advanced Feature
                </span>
              </div>
              <p className="text-gray-600">
                Analyze how combinations of protected attributes affect model outcomes, revealing potential intersectional biases that may not be apparent when examining attributes in isolation.
              </p>
              <IntersectionalBiasHeatmap biasData={intersectionalData} />
            </div>
          )}
          
          {activeTab === 'remediation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Fairness Remediation</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Advanced Feature
                </span>
              </div>
              <p className="text-gray-600">
                Simulate different bias mitigation strategies and see their impact on fairness metrics. Apply and undo remediation strategies dynamically to understand their effects.
              </p>
              <FairnessRemediationPanel biasMetrics={biasMetrics} />
            </div>
          )}
          
          {activeTab === 'temporal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Temporal Bias Tracking</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Advanced Feature
                </span>
              </div>
              <p className="text-gray-600">
                Track how fairness metrics change over time to detect if a model gets more biased as it learns from new data. This analysis is crucial for ongoing model governance and documentation.
              </p>
              <TemporalBiasTracker temporalData={temporalData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedFairnessAnalytics;
