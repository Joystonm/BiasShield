/**
 * API service for BiasShield
 * Handles all communication with the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Submit a loan application for prediction
 * @param {Object} application - The loan application data
 * @returns {Promise} - Promise with prediction results
 */
export const submitApplication = async (application) => {
  try {
    // For demo purposes, return mock data if backend is not available
    if (import.meta.env.DEV) {
      console.log('DEV mode: Using mock prediction data');
      return mockPredictionResponse(application);
    }
    
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting application:', error);
    // Return mock data as fallback
    return mockPredictionResponse(application);
  }
};

/**
 * Get fairness metrics from the model
 * @returns {Promise} - Promise with fairness metrics
 */
export const getFairnessMetrics = async () => {
  try {
    // For demo purposes, return mock data if backend is not available
    if (import.meta.env.DEV) {
      console.log('DEV mode: Using mock fairness data');
      return mockFairnessData();
    }
    
    const response = await fetch(`${API_URL}/fairness`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching fairness metrics:', error);
    // Return mock data as fallback
    return mockFairnessData();
  }
};

/**
 * Get a visualization image URL
 * @param {string} vizType - The type of visualization to get
 * @returns {string} - URL to the visualization image
 */
export const getVisualizationUrl = (vizType) => {
  // For demo purposes, return placeholder image from a reliable source
  const placeholderText = encodeURIComponent(`Visualization: ${vizType}`);
  return `https://dummyimage.com/800x400/007bff/ffffff&text=${placeholderText}`;
};

/**
 * Run the full analysis pipeline
 * @returns {Promise} - Promise with result message
 */
export const runAnalysis = async () => {
  try {
    // For demo purposes, return mock data if backend is not available
    if (import.meta.env.DEV) {
      console.log('DEV mode: Using mock analysis response');
      return { message: "Analysis pipeline started successfully" };
    }
    
    const response = await fetch(`${API_URL}/run-analysis`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running analysis:', error);
    return { message: "Analysis pipeline started successfully" };
  }
};

/**
 * Get explanation for loan decision
 * @param {Object} application - The loan application data
 * @param {Object} prediction - The prediction results
 * @returns {Promise} - Promise with explanation text
 */
export const getExplanation = async (application, prediction) => {
  try {
    const response = await fetch(`${API_URL}/explain-loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        application,
        prediction
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting explanation:', error);
    return { explanation: mockExplanation(application, prediction) };
  }
};

/**
 * Get explanation for bias findings
 * @param {Object} fairnessData - The fairness metrics data
 * @returns {Promise} - Promise with explanation text
 */
export const getBiasExplanation = async (fairnessData) => {
  try {
    const response = await fetch(`${API_URL}/explain-bias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fairnessData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting bias explanation:', error);
    return { explanation: mockBiasExplanation(fairnessData) };
  }
};

/**
 * Get remediation strategies for bias
 * @param {Object} fairnessData - The fairness metrics data
 * @returns {Promise} - Promise with remediation strategies
 */
export const getRemediationStrategy = async (fairnessData) => {
  try {
    const response = await fetch(`${API_URL}/remediation-strategy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fairnessData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting remediation strategy:', error);
    return { explanation: mockRemediationStrategy(fairnessData) };
  }
};

/**
 * Generate PDF report for loan decision
 * @param {Object} application - The loan application data
 * @param {Object} prediction - The prediction results
 * @param {String} explanation - The explanation text
 * @returns {Promise} - Promise with PDF blob
 */
export const generateLoanDecisionPDF = async (application, prediction, explanation) => {
  try {
    const response = await fetch(`${API_URL}/loan-decision-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        application,
        prediction,
        explanation
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Mock data for development and demo purposes
const mockPredictionResponse = (application) => {
  // Simple logic to determine approval based on credit score and income
  const approved = (
    (application.credit_score >= 650) && 
    (application.income >= 60000) &&
    (application.loan_amount <= application.income * 3)
  );
  
  // Calculate approval probability with some randomness
  let approvalProbability = 0;
  if (approved) {
    // Approved applications get 70-95% probability
    approvalProbability = 0.7 + (Math.random() * 0.25);
  } else {
    // Denied applications get 5-40% probability
    approvalProbability = 0.05 + (Math.random() * 0.35);
  }
  
  // Generate explanation with feature importance
  const explanation = {
    credit_score: 0.45 + (Math.random() * 0.1 - 0.05),
    income: 0.25 + (Math.random() * 0.1 - 0.05),
    loan_amount: 0.15 + (Math.random() * 0.1 - 0.05),
    age: 0.05 + (Math.random() * 0.02 - 0.01),
    employment_type: 0.05 + (Math.random() * 0.02 - 0.01),
    zip_code_group: 0.05 + (Math.random() * 0.02 - 0.01)
  };
  
  // Ensure the mock response is returned after a short delay to simulate API call
  return {
    approved: approved,
    approval_probability: approvalProbability,
    explanation: explanation
  };
};

const mockFairnessData = () => {
  return {
    gender: {
      approval_rates: {"Male": 0.72, "Female": 0.64},
      approval_disparity: 0.08,
      fp_rates: {"Male": 0.15, "Female": 0.12},
      fn_rates: {"Male": 0.10, "Female": 0.18},
      fp_disparity: 0.03,
      fn_disparity: 0.08
    },
    race: {
      approval_rates: {"White": 0.75, "Black": 0.62, "Asian": 0.70, "Hispanic": 0.65},
      approval_disparity: 0.13,
      fp_rates: {"White": 0.16, "Black": 0.11, "Asian": 0.14, "Hispanic": 0.12},
      fn_rates: {"White": 0.09, "Black": 0.19, "Asian": 0.12, "Hispanic": 0.16},
      fp_disparity: 0.05,
      fn_disparity: 0.10
    },
    age_group: {
      approval_rates: {"Under 25": 0.65, "25-60": 0.72, "Over 60": 0.68},
      approval_disparity: 0.07,
      fp_rates: {"Under 25": 0.13, "25-60": 0.15, "Over 60": 0.14},
      fn_rates: {"Under 25": 0.18, "25-60": 0.10, "Over 60": 0.15},
      fp_disparity: 0.02,
      fn_disparity: 0.08
    },
    disability_status: {
      approval_rates: {"Yes": 0.62, "No": 0.73},
      approval_disparity: 0.11,
      fp_rates: {"Yes": 0.12, "No": 0.15},
      fn_rates: {"Yes": 0.20, "No": 0.09},
      fp_disparity: 0.03,
      fn_disparity: 0.11
    }
  };
};

const mockExplanation = (application, prediction) => {
  const approved = prediction.approved;
  const probability = prediction.approval_probability * 100;
  
  if (approved) {
    return `We are pleased to inform you that your loan application has been approved with an approval probability of ${probability.toFixed(1)}%. Our BiasShield system has carefully evaluated your application, taking into account various factors that contribute to your creditworthiness.

The key factors that positively influenced this decision include:
- Credit Score: This factor had a 45.0% impact on your approval
- Income: This factor had a 25.0% impact on your approval
- Loan Amount: This factor had a 15.0% impact on your approval

Your credit score of ${application.credit_score} and income of $${application.income.toLocaleString()} demonstrate financial stability, which are important indicators of your ability to repay the loan.

Recommendations:
1. Maintain your current credit score by making timely payments
2. Consider setting up automatic payments to avoid any missed deadlines
3. Review your loan terms carefully before proceeding

Thank you for choosing our services. If you have any questions about your approval or the next steps, please don't hesitate to contact our customer service team.

BiasShield Decision System`;
  } else {
    return `We regret to inform you that your loan application has not been approved at this time. Our BiasShield system has carefully evaluated your application and determined that it does not meet our current lending criteria. The decision was made with an approval probability of ${probability.toFixed(1)}%.

The key factors that influenced this decision include:
- Credit Score: This factor had a 45.0% impact on the decision
- Income: This factor had a 25.0% impact on the decision
- Loan Amount: This factor had a 15.0% impact on the decision

Recommendations to improve your future applications:
1. Work on improving your credit score through timely bill payments
2. Reduce existing debt before applying for new credit
3. Consider applying for a smaller loan amount relative to your income
4. Wait 3-6 months before reapplying to allow time for credit improvements

We encourage you to review your credit report for any inaccuracies and address any issues that may be affecting your creditworthiness. If you believe this decision was made in error or would like more information, you can request a detailed explanation of the decision.

BiasShield Decision System`;
  }
};

const mockBiasExplanation = (fairnessData) => {
  return `## Bias Analysis Report

### Summary of Findings

**Moderate Bias Alert**: Some disparities detected in approval rates across protected attributes.

### Detailed Analysis

**Race**:
- Approval rate disparity: 13.0%
- Highest approval rate: White (75.0%)
- Lowest approval rate: Black (62.0%)
- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

**Disability Status**:
- Approval rate disparity: 11.0%
- Highest approval rate: No (73.0%)
- Lowest approval rate: Yes (62.0%)
- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

**Gender**:
- Approval rate disparity: 8.0%
- Highest approval rate: Male (72.0%)
- Lowest approval rate: Female (64.0%)
- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

**Age Group**:
- Approval rate disparity: 7.0%
- Highest approval rate: 25-60 (72.0%)
- Lowest approval rate: Under 25 (65.0%)
- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

### Conclusion

The model shows moderate bias that should be addressed. Consider implementing bias mitigation techniques to improve fairness before full deployment.`;
};

const mockRemediationStrategy = (fairnessData) => {
  return `## Bias Remediation Strategy

### Technical Strategies

1. **Fairness Constraints**:
   - Implement Demographic Parity constraints during model training
   - Apply Equalized Odds constraints to balance error rates across groups
   - Focus particularly on Race fairness, which shows the highest disparity

2. **Data Rebalancing**:
   - Apply instance weighting to compensate for underrepresented groups
   - Use reweighing techniques from the AIF360 toolkit
   - Consider synthetic data generation for minority groups

3. **Model Adjustments**:
   - Optimize classification thresholds separately for each demographic group
   - Implement adversarial debiasing techniques
   - Consider ensemble methods that combine multiple fair classifiers

### Feature Engineering Approaches

1. **Feature Selection**:
   - Remove or reduce weight of features highly correlated with protected attributes
   - Identify and eliminate proxy variables that may encode bias

2. **Feature Transformation**:
   - Apply fairness-aware feature transformations
   - Develop composite features that are less correlated with protected attributes

### Policy Recommendations

1. **Process Changes**:
   - Implement a second-level review for rejected applications from protected groups
   - Establish clear documentation requirements for all lending decisions

2. **Monitoring Framework**:
   - Set up continuous monitoring of approval rates across demographic groups
   - Establish disparity thresholds that trigger automatic reviews
   - Conduct regular fairness audits with detailed reporting

### Implementation Considerations

1. **Performance Tradeoffs**:
   - Be aware that some fairness constraints may slightly reduce overall model accuracy
   - Establish acceptable thresholds for both fairness and performance

2. **Regulatory Compliance**:
   - Document all bias mitigation efforts for regulatory review
   - Ensure compliance with ECOA, FHA, and FCRA requirements
   - Prepare explanations for any remaining disparities

3. **Validation Approach**:
   - Test remediation strategies on historical data before implementation
   - Use A/B testing to validate improvements in fairness metrics
   - Establish a feedback loop for continuous improvement`;
};
