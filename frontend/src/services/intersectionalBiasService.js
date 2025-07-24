/**
 * Service for generating and analyzing intersectional bias data
 */

// Generate mock intersectional bias data for testing
export const generateMockIntersectionalData = () => {
  const genders = ['Male', 'Female', 'Non-binary'];
  const races = ['White', 'Black', 'Hispanic', 'Asian', 'Other'];
  const ageGroups = ['18-25', '26-35', '36-50', '51-65', '65+'];
  const incomeLevels = ['Low', 'Medium', 'High'];
  const disabilityStatus = ['Yes', 'No'];
  
  // Generate gender-race intersectional data
  const genderRaceData = [];
  genders.forEach(gender => {
    races.forEach(race => {
      // Base approval rate varies by group with intentional bias patterns
      let baseApprovalRate = 0.7;
      
      // Add gender bias
      if (gender === 'Male') baseApprovalRate += 0.08;
      if (gender === 'Female') baseApprovalRate -= 0.05;
      if (gender === 'Non-binary') baseApprovalRate -= 0.07;
      
      // Add race bias
      if (race === 'White') baseApprovalRate += 0.1;
      if (race === 'Black') baseApprovalRate -= 0.13;
      if (race === 'Hispanic') baseApprovalRate -= 0.08;
      if (race === 'Asian') baseApprovalRate += 0.05;
      if (race === 'Other') baseApprovalRate -= 0.03;
      
      // Add intersectional effects (e.g., Black women face more bias than would be expected from gender and race separately)
      if (gender === 'Female' && race === 'Black') baseApprovalRate -= 0.07;
      if (gender === 'Non-binary' && race === 'Black') baseApprovalRate -= 0.09;
      if (gender === 'Female' && race === 'Hispanic') baseApprovalRate -= 0.04;
      if (gender === 'Male' && race === 'White') baseApprovalRate += 0.03;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact (ratio to most privileged group - White Male)
      const disparateImpact = approvalRate / 0.88; // 0.88 is approx. White Male approval rate
      
      genderRaceData.push({
        gender,
        race,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate gender-age intersectional data
  const genderAgeData = [];
  genders.forEach(gender => {
    ageGroups.forEach(age_group => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add gender bias
      if (gender === 'Male') baseApprovalRate += 0.08;
      if (gender === 'Female') baseApprovalRate -= 0.05;
      if (gender === 'Non-binary') baseApprovalRate -= 0.07;
      
      // Add age bias
      if (age_group === '18-25') baseApprovalRate -= 0.12;
      if (age_group === '26-35') baseApprovalRate += 0.05;
      if (age_group === '36-50') baseApprovalRate += 0.1;
      if (age_group === '51-65') baseApprovalRate += 0.02;
      if (age_group === '65+') baseApprovalRate -= 0.08;
      
      // Add intersectional effects
      if (gender === 'Female' && age_group === '18-25') baseApprovalRate -= 0.05;
      if (gender === 'Male' && age_group === '36-50') baseApprovalRate += 0.05;
      if (gender === 'Non-binary' && age_group === '18-25') baseApprovalRate -= 0.08;
      if (gender === 'Female' && age_group === '65+') baseApprovalRate -= 0.04;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.93; // 0.93 is approx. Male 36-50 approval rate
      
      genderAgeData.push({
        gender,
        age_group,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate race-income intersectional data
  const raceIncomeData = [];
  races.forEach(race => {
    incomeLevels.forEach(income_level => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add race bias
      if (race === 'White') baseApprovalRate += 0.1;
      if (race === 'Black') baseApprovalRate -= 0.13;
      if (race === 'Hispanic') baseApprovalRate -= 0.08;
      if (race === 'Asian') baseApprovalRate += 0.05;
      if (race === 'Other') baseApprovalRate -= 0.03;
      
      // Add income bias
      if (income_level === 'Low') baseApprovalRate -= 0.15;
      if (income_level === 'Medium') baseApprovalRate += 0.05;
      if (income_level === 'High') baseApprovalRate += 0.15;
      
      // Add intersectional effects
      if (race === 'Black' && income_level === 'Low') baseApprovalRate -= 0.08;
      if (race === 'Hispanic' && income_level === 'Low') baseApprovalRate -= 0.05;
      if (race === 'White' && income_level === 'High') baseApprovalRate += 0.05;
      if (race === 'Asian' && income_level === 'High') baseApprovalRate += 0.03;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.95; // 0.95 is approx. White High-Income approval rate
      
      raceIncomeData.push({
        race,
        income_level,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate race-disability intersectional data
  const raceDisabilityData = [];
  races.forEach(race => {
    disabilityStatus.forEach(disability_status => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add race bias
      if (race === 'White') baseApprovalRate += 0.1;
      if (race === 'Black') baseApprovalRate -= 0.13;
      if (race === 'Hispanic') baseApprovalRate -= 0.08;
      if (race === 'Asian') baseApprovalRate += 0.05;
      if (race === 'Other') baseApprovalRate -= 0.03;
      
      // Add disability bias
      if (disability_status === 'Yes') baseApprovalRate -= 0.11;
      
      // Add intersectional effects
      if (race === 'Black' && disability_status === 'Yes') baseApprovalRate -= 0.07;
      if (race === 'Hispanic' && disability_status === 'Yes') baseApprovalRate -= 0.05;
      if (race === 'White' && disability_status === 'No') baseApprovalRate += 0.03;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.8; // 0.8 is approx. White No-Disability approval rate
      
      raceDisabilityData.push({
        race,
        disability_status,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate gender-disability intersectional data
  const genderDisabilityData = [];
  genders.forEach(gender => {
    disabilityStatus.forEach(disability_status => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add gender bias
      if (gender === 'Male') baseApprovalRate += 0.08;
      if (gender === 'Female') baseApprovalRate -= 0.05;
      if (gender === 'Non-binary') baseApprovalRate -= 0.07;
      
      // Add disability bias
      if (disability_status === 'Yes') baseApprovalRate -= 0.11;
      
      // Add intersectional effects
      if (gender === 'Female' && disability_status === 'Yes') baseApprovalRate -= 0.06;
      if (gender === 'Non-binary' && disability_status === 'Yes') baseApprovalRate -= 0.08;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.78; // 0.78 is approx. Male No-Disability approval rate
      
      genderDisabilityData.push({
        gender,
        disability_status,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate gender-income intersectional data
  const genderIncomeData = [];
  genders.forEach(gender => {
    incomeLevels.forEach(income_level => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add gender bias
      if (gender === 'Male') baseApprovalRate += 0.08;
      if (gender === 'Female') baseApprovalRate -= 0.05;
      if (gender === 'Non-binary') baseApprovalRate -= 0.07;
      
      // Add income bias
      if (income_level === 'Low') baseApprovalRate -= 0.15;
      if (income_level === 'Medium') baseApprovalRate += 0.05;
      if (income_level === 'High') baseApprovalRate += 0.15;
      
      // Add intersectional effects
      if (gender === 'Female' && income_level === 'Low') baseApprovalRate -= 0.07;
      if (gender === 'Non-binary' && income_level === 'Low') baseApprovalRate -= 0.09;
      if (gender === 'Male' && income_level === 'High') baseApprovalRate += 0.04;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.93; // 0.93 is approx. Male High-Income approval rate
      
      genderIncomeData.push({
        gender,
        income_level,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate race-age intersectional data
  const raceAgeData = [];
  races.forEach(race => {
    ageGroups.forEach(age_group => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add race bias
      if (race === 'White') baseApprovalRate += 0.1;
      if (race === 'Black') baseApprovalRate -= 0.13;
      if (race === 'Hispanic') baseApprovalRate -= 0.08;
      if (race === 'Asian') baseApprovalRate += 0.05;
      if (race === 'Other') baseApprovalRate -= 0.03;
      
      // Add age bias
      if (age_group === '18-25') baseApprovalRate -= 0.12;
      if (age_group === '26-35') baseApprovalRate += 0.05;
      if (age_group === '36-50') baseApprovalRate += 0.1;
      if (age_group === '51-65') baseApprovalRate += 0.02;
      if (age_group === '65+') baseApprovalRate -= 0.08;
      
      // Add intersectional effects
      if (race === 'Black' && age_group === '18-25') baseApprovalRate -= 0.08;
      if (race === 'Hispanic' && age_group === '18-25') baseApprovalRate -= 0.06;
      if (race === 'White' && age_group === '36-50') baseApprovalRate += 0.05;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.9; // 0.9 is approx. White 36-50 approval rate
      
      raceAgeData.push({
        race,
        age_group,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate age-income intersectional data
  const ageIncomeData = [];
  ageGroups.forEach(age_group => {
    incomeLevels.forEach(income_level => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add age bias
      if (age_group === '18-25') baseApprovalRate -= 0.12;
      if (age_group === '26-35') baseApprovalRate += 0.05;
      if (age_group === '36-50') baseApprovalRate += 0.1;
      if (age_group === '51-65') baseApprovalRate += 0.02;
      if (age_group === '65+') baseApprovalRate -= 0.08;
      
      // Add income bias
      if (income_level === 'Low') baseApprovalRate -= 0.15;
      if (income_level === 'Medium') baseApprovalRate += 0.05;
      if (income_level === 'High') baseApprovalRate += 0.15;
      
      // Add intersectional effects
      if (age_group === '18-25' && income_level === 'Low') baseApprovalRate -= 0.07;
      if (age_group === '65+' && income_level === 'Low') baseApprovalRate -= 0.06;
      if (age_group === '36-50' && income_level === 'High') baseApprovalRate += 0.06;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.91; // 0.91 is approx. 36-50 High-Income approval rate
      
      ageIncomeData.push({
        age_group,
        income_level,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate age-disability intersectional data
  const ageDisabilityData = [];
  ageGroups.forEach(age_group => {
    disabilityStatus.forEach(disability_status => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add age bias
      if (age_group === '18-25') baseApprovalRate -= 0.12;
      if (age_group === '26-35') baseApprovalRate += 0.05;
      if (age_group === '36-50') baseApprovalRate += 0.1;
      if (age_group === '51-65') baseApprovalRate += 0.02;
      if (age_group === '65+') baseApprovalRate -= 0.08;
      
      // Add disability bias
      if (disability_status === 'Yes') baseApprovalRate -= 0.11;
      
      // Add intersectional effects
      if (age_group === '65+' && disability_status === 'Yes') baseApprovalRate -= 0.09;
      if (age_group === '18-25' && disability_status === 'Yes') baseApprovalRate -= 0.06;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.8; // 0.8 is approx. 36-50 No-Disability approval rate
      
      ageDisabilityData.push({
        age_group,
        disability_status,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Generate income-disability intersectional data
  const incomeDisabilityData = [];
  incomeLevels.forEach(income_level => {
    disabilityStatus.forEach(disability_status => {
      // Base approval rate
      let baseApprovalRate = 0.7;
      
      // Add income bias
      if (income_level === 'Low') baseApprovalRate -= 0.15;
      if (income_level === 'Medium') baseApprovalRate += 0.05;
      if (income_level === 'High') baseApprovalRate += 0.15;
      
      // Add disability bias
      if (disability_status === 'Yes') baseApprovalRate -= 0.11;
      
      // Add intersectional effects
      if (income_level === 'Low' && disability_status === 'Yes') baseApprovalRate -= 0.08;
      if (income_level === 'High' && disability_status === 'No') baseApprovalRate += 0.04;
      
      // Ensure rates are between 0 and 1
      const approvalRate = Math.max(0.1, Math.min(0.95, baseApprovalRate));
      
      // Calculate error rates based on approval rate
      const falsePositiveRate = Math.max(0.05, Math.min(0.3, 0.15 - (approvalRate * 0.05)));
      const falseNegativeRate = Math.max(0.05, Math.min(0.3, 0.2 - (approvalRate * 0.1)));
      
      // Calculate disparate impact
      const disparateImpact = approvalRate / 0.89; // 0.89 is approx. High-Income No-Disability approval rate
      
      incomeDisabilityData.push({
        income_level,
        disability_status,
        approval_rate: approvalRate,
        false_positive_rate: falsePositiveRate,
        false_negative_rate: falseNegativeRate,
        disparate_impact: disparateImpact
      });
    });
  });
  
  // Return all intersectional data with consistent key naming
  return {
    intersectional: {
      // Use consistent key naming format to match attribute IDs
      gender_race: genderRaceData,
      race_gender: genderRaceData,
      gender_age_group: genderAgeData,
      age_group_gender: genderAgeData,
      gender_income_level: genderIncomeData,
      income_level_gender: genderIncomeData,
      gender_disability_status: genderDisabilityData,
      disability_status_gender: genderDisabilityData,
      race_age_group: raceAgeData,
      age_group_race: raceAgeData,
      race_income_level: raceIncomeData,
      income_level_race: raceIncomeData,
      race_disability_status: raceDisabilityData,
      disability_status_race: raceDisabilityData,
      age_group_income_level: ageIncomeData,
      income_level_age_group: ageIncomeData,
      age_group_disability_status: ageDisabilityData,
      disability_status_age_group: ageDisabilityData,
      income_level_disability_status: incomeDisabilityData,
      disability_status_income_level: incomeDisabilityData
    }
  };
};

// Calculate intersectional bias metrics from raw data
export const calculateIntersectionalBias = (data, primaryAttribute, secondaryAttribute) => {
  if (!data || !data.length) return [];
  
  // Group data by the combination of attributes
  const groupedData = {};
  data.forEach(item => {
    const primaryValue = item[primaryAttribute];
    const secondaryValue = item[secondaryAttribute];
    const key = `${primaryValue}-${secondaryValue}`;
    
    if (!groupedData[key]) {
      groupedData[key] = {
        total: 0,
        approved: 0,
        falsePositives: 0,
        falseNegatives: 0
      };
    }
    
    groupedData[key].total++;
    if (item.approved) groupedData[key].approved++;
    if (item.approved && !item.should_approve) groupedData[key].falsePositives++;
    if (!item.approved && item.should_approve) groupedData[key].falseNegatives++;
  });
  
  // Calculate metrics for each group
  const result = [];
  Object.entries(groupedData).forEach(([key, stats]) => {
    const [primaryValue, secondaryValue] = key.split('-');
    
    result.push({
      [primaryAttribute]: primaryValue,
      [secondaryAttribute]: secondaryValue,
      approval_rate: stats.approved / stats.total,
      false_positive_rate: stats.falsePositives / (stats.falsePositives + (stats.total - stats.approved - stats.falseNegatives)),
      false_negative_rate: stats.falseNegatives / (stats.falseNegatives + stats.approved - stats.falsePositives)
    });
  });
  
  return result;
};

// Find the most privileged group (highest approval rate)
export const findMostPrivilegedGroup = (intersectionalData) => {
  if (!intersectionalData || !intersectionalData.length) return null;
  
  return intersectionalData.reduce((highest, current) => {
    return current.approval_rate > highest.approval_rate ? current : highest;
  }, intersectionalData[0]);
};

// Calculate disparate impact for all groups compared to most privileged
export const calculateDisparateImpact = (intersectionalData) => {
  if (!intersectionalData || !intersectionalData.length) return [];
  
  const mostPrivileged = findMostPrivilegedGroup(intersectionalData);
  
  return intersectionalData.map(group => ({
    ...group,
    disparate_impact: group.approval_rate / mostPrivileged.approval_rate
  }));
};
