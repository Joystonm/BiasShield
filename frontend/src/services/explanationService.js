/**
 * Service for interacting with our explanation system via the backend API
 * Provides natural language explanations and insights
 */

import { getExplanation, getBiasExplanation, getRemediationStrategy, generateLoanDecisionPDF } from './api';

/**
 * Generate a natural language explanation for a loan decision
 * @param {Object} applicationData - The loan application data
 * @param {Object} predictionResult - The prediction result from the model
 * @returns {Promise<string>} - Promise with the explanation text
 */
export const generateLoanExplanation = async (applicationData, predictionResult) => {
  try {
    // Make an API call to our backend
    const response = await getExplanation(applicationData, predictionResult);
    
    // Process the explanation to remove markdown formatting if needed
    let processedExplanation = response.explanation
      .replace(/\*\*/g, '') // Remove all double asterisks
      .replace(/\*/g, ''); // Remove single asterisks as well
    
    return processedExplanation;
  } catch (error) {
    console.error('Error generating loan explanation:', error);
    // Fallback to mock explanation if API call fails
    return generateMockLoanExplanation(applicationData, predictionResult);
  }
};

/**
 * Generate a natural language explanation for bias findings
 * @param {Object} biasMetrics - The bias metrics from the fairness analysis
 * @returns {Promise<string>} - Promise with the explanation text
 */
export const generateBiasExplanation = async (biasMetrics) => {
  try {
    // Make an API call to our backend
    const response = await getBiasExplanation(biasMetrics);
    
    // Process the explanation to remove markdown formatting if needed
    let processedExplanation = response.explanation
      .replace(/\*\*/g, '') // Remove all double asterisks
      .replace(/\*/g, ''); // Remove single asterisks as well
    
    return processedExplanation;
  } catch (error) {
    console.error('Error generating bias explanation:', error);
    // Fallback to mock explanation if API call fails
    return generateMockBiasExplanation(biasMetrics);
  }
};

/**
 * Generate remediation strategy recommendations
 * @param {Object} biasMetrics - The bias metrics from the fairness analysis
 * @returns {Promise<string>} - Promise with the remediation recommendations
 */
export const generateRemediationStrategy = async (biasMetrics) => {
  try {
    // Make an API call to our backend
    const response = await getRemediationStrategy(biasMetrics);
    
    // Process the explanation to remove markdown formatting if needed
    let processedExplanation = response.explanation
      .replace(/\*\*/g, '') // Remove all double asterisks
      .replace(/\*/g, ''); // Remove single asterisks as well
    
    return processedExplanation;
  } catch (error) {
    console.error('Error generating remediation strategy:', error);
    // Fallback to mock explanation if API call fails
    return generateMockRemediationStrategy(biasMetrics);
  }
};

/**
 * Download loan decision report as PDF
 * @param {Object} applicationData - The loan application data
 * @param {Object} predictionResult - The prediction result from the model
 * @param {String} explanation - The explanation text
 * @returns {Promise<Blob>} - Promise with the PDF blob
 */
export const downloadLoanDecisionPDF = async (applicationData, predictionResult, explanation) => {
  try {
    // Make an API call to our backend
    const blob = await generateLoanDecisionPDF(applicationData, predictionResult, explanation);
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'BiasShield_Decision_Report.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading loan decision report:', error);
    return false;
  }
};

// Mock functions for fallback

const generateMockLoanExplanation = (applicationData, predictionResult) => {
  const { credit_score, income, loan_amount } = applicationData;
  const { approved, approval_probability, explanation } = predictionResult;
  
  const topFactors = Object.entries(explanation)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3)
    .map(([factor]) => factor);
  
  if (approved) {
    return `Dear Applicant,

We are pleased to inform you that your loan application has been approved with an approval probability of ${(approval_probability * 100).toFixed(1)}%. Our BiasShield system has carefully evaluated your application, taking into account various factors that contribute to your creditworthiness.

Reason for Approval:

The primary factors contributing to this approval are:

1. ${formatFactor(topFactors[0])}: Your ${formatFactorValue(topFactors[0], applicationData)} is considered strong and demonstrates financial stability.

2. ${formatFactor(topFactors[1])}: Your ${formatFactorValue(topFactors[1], applicationData)} indicates a favorable risk profile.

3. ${formatFactor(topFactors[2])}: Your ${formatFactorValue(topFactors[2], applicationData)} meets our lending criteria.

The loan-to-income ratio of ${((loan_amount / income) * 100).toFixed(1)}% is within our acceptable range, indicating that the loan amount is appropriate relative to your income.

Please note that this approval is subject to final verification of the information provided in your application.

Sincerely,
BiasShield Decision System`;
  } else {
    return `Dear Applicant,

We regret to inform you that your loan application has been denied. The model calculated an approval probability of ${(approval_probability * 100).toFixed(1)}%, which is below our threshold for approval.
    
Reason for Denial:

The primary factors contributing to this decision are:

1. ${formatFactor(topFactors[0])}: Your ${formatFactorValue(topFactors[0], applicationData)} does not meet our current lending criteria.

2. ${formatFactor(topFactors[1])}: Your ${formatFactorValue(topFactors[1], applicationData)} indicates elevated risk.

3. ${formatFactor(topFactors[2])}: Your ${formatFactorValue(topFactors[2], applicationData)} is a concern for this loan type.

The loan-to-income ratio of ${((loan_amount / income) * 100).toFixed(1)}% exceeds our recommended maximum of 40%, suggesting that the requested loan amount may be too high relative to your income.

You may consider reapplying with a lower loan amount, improving your credit score, or providing additional income documentation. If you believe this decision was made in error, you have the right to request a detailed explanation and to submit additional information for reconsideration.

Sincerely,
BiasShield Decision System`;
  }
};

const generateMockBiasExplanation = (biasMetrics) => {
  const disparities = [];
  
  if (biasMetrics.gender && biasMetrics.gender.approval_disparity > 0.05) {
    disparities.push(`gender (${(biasMetrics.gender.approval_disparity * 100).toFixed(1)}% disparity)`);
  }
  
  if (biasMetrics.race && biasMetrics.race.approval_disparity > 0.05) {
    disparities.push(`race (${(biasMetrics.race.approval_disparity * 100).toFixed(1)}% disparity)`);
  }
  
  if (biasMetrics.age_group && biasMetrics.age_group.approval_disparity > 0.05) {
    disparities.push(`age (${(biasMetrics.age_group.approval_disparity * 100).toFixed(1)}% disparity)`);
  }
  
  if (biasMetrics.disability_status && biasMetrics.disability_status.approval_disparity > 0.05) {
    disparities.push(`disability status (${(biasMetrics.disability_status.approval_disparity * 100).toFixed(1)}% disparity)`);
  }
  
  if (disparities.length === 0) {
    return "Our analysis shows that the current model demonstrates relatively fair treatment across protected attributes. No significant disparities were detected in approval rates or error rates between demographic groups.";
  }
  
  return `## Bias Analysis Report

### Summary of Findings

Moderate Bias Alert: Some disparities detected in approval rates across protected attributes.

### Detailed Analysis

Race:
- Approval rate disparity: ${(biasMetrics.race?.approval_disparity * 100 || 0).toFixed(1)}%
- Highest approval rate: White (${(biasMetrics.race?.approval_rates?.White * 100 || 0).toFixed(1)}%)
- Lowest approval rate: Black (${(biasMetrics.race?.approval_rates?.Black * 100 || 0).toFixed(1)}%)
- Regulatory concern: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

Gender:
- Approval rate disparity: ${(biasMetrics.gender?.approval_disparity * 100 || 0).toFixed(1)}%
- Highest approval rate: Male (${(biasMetrics.gender?.approval_rates?.Male * 100 || 0).toFixed(1)}%)
- Lowest approval rate: Female (${(biasMetrics.gender?.approval_rates?.Female * 100 || 0).toFixed(1)}%)
- Regulatory concern: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

Disability Status:
- Approval rate disparity: ${(biasMetrics.disability_status?.approval_disparity * 100 || 0).toFixed(1)}%
- Highest approval rate: No (${(biasMetrics.disability_status?.approval_rates?.No * 100 || 0).toFixed(1)}%)
- Lowest approval rate: Yes (${(biasMetrics.disability_status?.approval_rates?.Yes * 100 || 0).toFixed(1)}%)
- Regulatory concern: This disparity exceeds the typical 5% threshold for regulatory scrutiny.

### Conclusion

The model shows moderate bias that should be addressed. Consider implementing bias mitigation techniques to improve fairness before full deployment.`;
};

const generateMockRemediationStrategy = (biasMetrics) => {
  const highestDisparity = Math.max(
    biasMetrics.gender?.approval_disparity || 0,
    biasMetrics.race?.approval_disparity || 0,
    biasMetrics.age_group?.approval_disparity || 0,
    biasMetrics.disability_status?.approval_disparity || 0
  );
  
  if (highestDisparity < 0.05) {
    return "## Bias Remediation Strategy\n\nBased on the relatively low disparities in your model, we recommend a light-touch approach to bias mitigation. Continue monitoring fairness metrics and consider implementing preventative measures such as regular bias audits and fairness-aware feature selection processes. This proactive approach will help maintain the current level of fairness while preventing future bias from emerging.";
  } else if (highestDisparity < 0.10) {
    return "## Bias Remediation Strategy\n\nYour model shows moderate disparities that should be addressed. We recommend implementing post-processing techniques such as threshold optimization to equalize error rates across groups. Additionally, consider enhancing your training data with synthetic examples for underrepresented groups to improve balance. These approaches offer a good balance between effectiveness and implementation complexity.";
  } else {
    return `## Bias Remediation Strategy

### Technical Strategies

1. Fairness Constraints:
   - Implement Demographic Parity constraints during model training
   - Apply Equalized Odds constraints to balance error rates across groups
   - Focus particularly on Race fairness, which shows the highest disparity

2. Data Rebalancing:
   - Apply instance weighting to compensate for underrepresented groups
   - Use reweighing techniques from the AIF360 toolkit
   - Consider synthetic data generation for minority groups

3. Model Adjustments:
   - Optimize classification thresholds separately for each demographic group
   - Implement adversarial debiasing techniques
   - Consider ensemble methods that combine multiple fair classifiers

### Feature Engineering Approaches

1. Feature Selection:
   - Remove or reduce weight of features highly correlated with protected attributes
   - Identify and eliminate proxy variables that may encode bias

2. Feature Transformation:
   - Apply fairness-aware feature transformations
   - Develop composite features that are less correlated with protected attributes

### Implementation Considerations

1. Performance Tradeoffs:
   - Be aware that some fairness constraints may slightly reduce overall model accuracy
   - Establish acceptable thresholds for both fairness and performance

2. Validation Approach:
   - Test remediation strategies on historical data before implementation
   - Use A/B testing to validate improvements in fairness metrics
   - Establish a feedback loop for continuous improvement`;
  }
};

// Helper functions
const formatFactor = (factor) => {
  return factor
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatFactorValue = (factor, applicationData) => {
  switch (factor) {
    case 'credit_score':
      return `credit score of ${applicationData.credit_score}`;
    case 'income':
      return `annual income of $${applicationData.income.toLocaleString()}`;
    case 'loan_amount':
      return `requested loan amount of $${applicationData.loan_amount.toLocaleString()}`;
    case 'employment_type':
      return `employment status (${applicationData.employment_type})`;
    case 'age':
      return `age (${applicationData.age})`;
    default:
      return factor.replace('_', ' ');
  }
};
