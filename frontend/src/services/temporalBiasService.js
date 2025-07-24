/**
 * Service for generating and analyzing temporal bias data
 */

// Generate mock temporal bias data for testing
export const generateMockTemporalData = () => {
  // Generate dates for the past 24 months
  const dates = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Generate race bias data over time
  const raceData = dates.map((date, index) => {
    // Base values
    let approvalDisparity = 0.13;
    let falsePositiveDisparity = 0.08;
    let falseNegativeDisparity = 0.10;
    let demographicParity = 0.78;
    let equalizedOdds = 0.82;
    
    // Add time-based patterns
    
    // Pattern 1: Gradual improvement in first half, then slight regression
    if (index < dates.length / 2) {
      approvalDisparity -= 0.003 * index;
      falsePositiveDisparity -= 0.002 * index;
      falseNegativeDisparity -= 0.002 * index;
      demographicParity += 0.003 * index;
      equalizedOdds += 0.002 * index;
    } else {
      const midPoint = dates.length / 2;
      const midApprovalDisparity = approvalDisparity - 0.003 * midPoint;
      const midFalsePositiveDisparity = falsePositiveDisparity - 0.002 * midPoint;
      const midFalseNegativeDisparity = falseNegativeDisparity - 0.002 * midPoint;
      const midDemographicParity = demographicParity + 0.003 * midPoint;
      const midEqualizedOdds = equalizedOdds + 0.002 * midPoint;
      
      approvalDisparity = midApprovalDisparity + 0.001 * (index - midPoint);
      falsePositiveDisparity = midFalsePositiveDisparity + 0.0005 * (index - midPoint);
      falseNegativeDisparity = midFalseNegativeDisparity + 0.0005 * (index - midPoint);
      demographicParity = midDemographicParity - 0.001 * (index - midPoint);
      equalizedOdds = midEqualizedOdds - 0.0005 * (index - midPoint);
    }
    
    // Add some random noise
    const noise = () => (Math.random() - 0.5) * 0.02;
    
    return {
      date,
      approval_disparity: Math.max(0, Math.min(1, approvalDisparity + noise())),
      false_positive_disparity: Math.max(0, Math.min(1, falsePositiveDisparity + noise())),
      false_negative_disparity: Math.max(0, Math.min(1, falseNegativeDisparity + noise())),
      demographic_parity: Math.max(0, Math.min(1, demographicParity + noise())),
      equalized_odds: Math.max(0, Math.min(1, equalizedOdds + noise()))
    };
  });
  
  // Generate gender bias data over time
  const genderData = dates.map((date, index) => {
    // Base values
    let approvalDisparity = 0.08;
    let falsePositiveDisparity = 0.06;
    let falseNegativeDisparity = 0.07;
    let demographicParity = 0.85;
    let equalizedOdds = 0.88;
    
    // Add time-based patterns
    
    // Pattern 2: Initial stability, then worsening trend
    if (index < dates.length / 3) {
      // Stable period
      approvalDisparity += 0.0005 * index;
      falsePositiveDisparity += 0.0003 * index;
      falseNegativeDisparity += 0.0003 * index;
      demographicParity -= 0.0005 * index;
      equalizedOdds -= 0.0003 * index;
    } else {
      // Worsening period
      const stablePoint = dates.length / 3;
      const stableApprovalDisparity = approvalDisparity + 0.0005 * stablePoint;
      const stableFalsePositiveDisparity = falsePositiveDisparity + 0.0003 * stablePoint;
      const stableFalseNegativeDisparity = falseNegativeDisparity + 0.0003 * stablePoint;
      const stableDemographicParity = demographicParity - 0.0005 * stablePoint;
      const stableEqualizedOdds = equalizedOdds - 0.0003 * stablePoint;
      
      approvalDisparity = stableApprovalDisparity + 0.002 * (index - stablePoint);
      falsePositiveDisparity = stableFalsePositiveDisparity + 0.001 * (index - stablePoint);
      falseNegativeDisparity = stableFalseNegativeDisparity + 0.001 * (index - stablePoint);
      demographicParity = stableDemographicParity - 0.002 * (index - stablePoint);
      equalizedOdds = stableEqualizedOdds - 0.001 * (index - stablePoint);
    }
    
    // Add some random noise
    const noise = () => (Math.random() - 0.5) * 0.015;
    
    return {
      date,
      approval_disparity: Math.max(0, Math.min(1, approvalDisparity + noise())),
      false_positive_disparity: Math.max(0, Math.min(1, falsePositiveDisparity + noise())),
      false_negative_disparity: Math.max(0, Math.min(1, falseNegativeDisparity + noise())),
      demographic_parity: Math.max(0, Math.min(1, demographicParity + noise())),
      equalized_odds: Math.max(0, Math.min(1, equalizedOdds + noise()))
    };
  });
  
  // Generate age group bias data over time
  const ageGroupData = dates.map((date, index) => {
    // Base values
    let approvalDisparity = 0.07;
    let falsePositiveDisparity = 0.05;
    let falseNegativeDisparity = 0.06;
    let demographicParity = 0.87;
    let equalizedOdds = 0.89;
    
    // Add time-based patterns
    
    // Pattern 3: Consistent improvement trend
    approvalDisparity -= 0.002 * index;
    falsePositiveDisparity -= 0.0015 * index;
    falseNegativeDisparity -= 0.0015 * index;
    demographicParity += 0.002 * index;
    equalizedOdds += 0.0015 * index;
    
    // Add some random noise
    const noise = () => (Math.random() - 0.5) * 0.01;
    
    return {
      date,
      approval_disparity: Math.max(0, Math.min(1, approvalDisparity + noise())),
      false_positive_disparity: Math.max(0, Math.min(1, falsePositiveDisparity + noise())),
      false_negative_disparity: Math.max(0, Math.min(1, falseNegativeDisparity + noise())),
      demographic_parity: Math.max(0, Math.min(1, demographicParity + noise())),
      equalized_odds: Math.max(0, Math.min(1, equalizedOdds + noise()))
    };
  });
  
  // Generate disability status bias data over time
  const disabilityData = dates.map((date, index) => {
    // Base values
    let approvalDisparity = 0.11;
    let falsePositiveDisparity = 0.09;
    let falseNegativeDisparity = 0.10;
    let demographicParity = 0.80;
    let equalizedOdds = 0.82;
    
    // Add time-based patterns
    
    // Pattern 4: Cyclical pattern (improvement followed by regression)
    const cycle = Math.sin(index * Math.PI / 6); // 12-month cycle
    
    approvalDisparity += 0.02 * cycle;
    falsePositiveDisparity += 0.015 * cycle;
    falseNegativeDisparity += 0.015 * cycle;
    demographicParity -= 0.02 * cycle;
    equalizedOdds -= 0.015 * cycle;
    
    // Add some random noise
    const noise = () => (Math.random() - 0.5) * 0.015;
    
    return {
      date,
      approval_disparity: Math.max(0, Math.min(1, approvalDisparity + noise())),
      false_positive_disparity: Math.max(0, Math.min(1, falsePositiveDisparity + noise())),
      false_negative_disparity: Math.max(0, Math.min(1, falseNegativeDisparity + noise())),
      demographic_parity: Math.max(0, Math.min(1, demographicParity + noise())),
      equalized_odds: Math.max(0, Math.min(1, equalizedOdds + noise()))
    };
  });
  
  return {
    race: raceData,
    gender: genderData,
    age_group: ageGroupData,
    disability_status: disabilityData
  };
};

// Analyze temporal trends in bias metrics
export const analyzeTemporalTrends = (temporalData, attribute, metric) => {
  if (!temporalData || !temporalData[attribute]) return null;
  
  const data = temporalData[attribute];
  if (data.length < 2) return null;
  
  // Extract metric values
  const values = data.map(item => item[metric]);
  
  // Calculate trend
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const percentChange = ((lastValue - firstValue) / firstValue) * 100;
  
  // Calculate volatility
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const volatility = stdDev / mean;
  
  // Determine trend direction
  let trendDirection;
  if (percentChange < -10) {
    trendDirection = 'improving';
  } else if (percentChange > 10) {
    trendDirection = 'worsening';
  } else {
    trendDirection = 'stable';
  }
  
  // Determine volatility level
  let volatilityLevel;
  if (volatility > 0.2) {
    volatilityLevel = 'high';
  } else if (volatility < 0.05) {
    volatilityLevel = 'low';
  } else {
    volatilityLevel = 'moderate';
  }
  
  return {
    trendDirection,
    percentChange,
    volatility,
    volatilityLevel,
    startValue: firstValue,
    endValue: lastValue,
    minValue: Math.min(...values),
    maxValue: Math.max(...values)
  };
};
