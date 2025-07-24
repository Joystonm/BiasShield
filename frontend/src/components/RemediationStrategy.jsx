import React from 'react';

const RemediationStrategy = ({ biasMetrics }) => {
  if (!biasMetrics) {
    return null;
  }

  // Determine the highest disparity
  const getHighestDisparity = () => {
    const disparities = [
      biasMetrics.gender?.approval_disparity || 0,
      biasMetrics.race?.approval_disparity || 0,
      biasMetrics.age_group?.approval_disparity || 0,
      biasMetrics.disability_status?.approval_disparity || 0
    ];
    return Math.max(...disparities);
  };

  // Get appropriate remediation strategies based on disparity level
  const getRemediationStrategies = () => {
    const highestDisparity = getHighestDisparity();
    
    if (highestDisparity < 0.05) {
      return [
        "Continue monitoring fairness metrics",
        "Implement regular bias audits",
        "Use fairness-aware feature selection processes"
      ];
    } else if (highestDisparity < 0.10) {
      return [
        "Implement threshold optimization to equalize error rates",
        "Enhance training data with synthetic examples for underrepresented groups",
        "Review feature importance for potential bias indicators"
      ];
    } else {
      return [
        "Implement in-processing fairness constraints during model training",
        "Use adversarial debiasing or fair representations techniques",
        "Remove potential proxy variables for protected attributes",
        "Consider policy changes to address bias in the lending process"
      ];
    }
  };

  const strategies = getRemediationStrategies();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Bias Remediation Strategy</h3>
      </div>
      
      <div className="prose max-w-none">
        <p className="font-bold mb-4">Recommended Actions:</p>
        
        <ul className="list-disc pl-5">
          {strategies.map((strategy, index) => (
            <li key={index} className="mb-2">{strategy}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RemediationStrategy;
