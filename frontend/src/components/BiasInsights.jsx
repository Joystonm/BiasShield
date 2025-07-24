import React from 'react';

const BiasInsights = ({ biasMetrics }) => {
  if (!biasMetrics) {
    return null;
  }

  // Format disparities for display
  const formatDisparity = (value) => {
    if (!value && value !== 0) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Bias Analysis</h3>
      </div>
      
      <div className="prose max-w-none">
        <p className="font-bold mb-4">Key Bias Findings:</p>
        
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">
            Significant disparities detected across 
            {biasMetrics.gender && <span> gender ({formatDisparity(biasMetrics.gender.approval_disparity)} disparity)</span>}
            {biasMetrics.race && <span>, race ({formatDisparity(biasMetrics.race.approval_disparity)} disparity)</span>}
            {biasMetrics.age_group && <span>, age ({formatDisparity(biasMetrics.age_group.approval_disparity)} disparity)</span>}
            {biasMetrics.disability_status && <span>, disability status ({formatDisparity(biasMetrics.disability_status.approval_disparity)} disparity)</span>}.
          </li>
          
          {biasMetrics.race && (
            <li className="mb-2">
              Race: {formatDisparity(biasMetrics.race.approval_disparity)} higher approval rate for White applicants compared to Black applicants.
            </li>
          )}
          
          {biasMetrics.gender && (
            <li className="mb-2">
              Gender: {formatDisparity(biasMetrics.gender.approval_disparity)} higher approval rate for Male applicants.
            </li>
          )}
          
          {biasMetrics.disability_status && (
            <li className="mb-2">
              Disability: {formatDisparity(biasMetrics.disability_status.approval_disparity)} higher approval rate for applicants without disabilities.
            </li>
          )}
        </ul>
        
        <p>
          These disparities exceed typical regulatory thresholds (5-10%) and require attention to ensure fair lending practices.
        </p>
      </div>
    </div>
  );
};

export default BiasInsights;
