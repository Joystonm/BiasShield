#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
app.py - FastAPI backend for BiasShield

This script provides API endpoints to connect the frontend UI with the loan prediction
and bias analysis functionality.
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path to import loan_model
sys.path.append(str(Path(__file__).parent.parent))
import loan_model

# Set paths
BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / 'outputs'
VISUALIZATION_DIR = OUTPUT_DIR / 'visualizations'

# Create app
app = FastAPI(title="BiasShield API", description="API for loan approval prediction and bias analysis")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models
class LoanApplication(BaseModel):
    gender: str
    race: str
    age: int
    income: float
    credit_score: int
    loan_amount: float
    employment_type: str
    education_level: str
    citizenship_status: str
    language_proficiency: str
    disability_status: str
    criminal_record: str
    zip_code_group: str

class PredictionResponse(BaseModel):
    approved: bool
    approval_probability: float
    explanation: Dict[str, float]

class BiasMetrics(BaseModel):
    approval_rates: Dict[str, float]
    approval_disparity: float
    fp_rates: Dict[str, float]
    fn_rates: Dict[str, float]
    fp_disparity: float
    fn_disparity: float

class FairnessResponse(BaseModel):
    gender: BiasMetrics
    race: BiasMetrics
    age_group: BiasMetrics
    disability_status: BiasMetrics

class ExplanationResponse(BaseModel):
    explanation: str

# Template-based explanation system
class ExplanationGenerator:
    """
    Self-contained explanation system using templates and rules
    """
    
    @staticmethod
    def generate_loan_explanation(application, prediction):
        """
        Generate a natural language explanation for a loan decision
        """
        # Extract key information
        approved = prediction.get('approved', False)
        probability = prediction.get('approval_probability', 0) * 100
        explanation_factors = prediction.get('explanation', {})
        
        # Sort factors by importance
        sorted_factors = sorted(explanation_factors.items(), key=lambda x: x[1], reverse=True)
        top_factors = sorted_factors[:3]
        
        # Generate appropriate message based on approval
        if approved:
            message = f"""
We are pleased to inform you that your loan application has been approved with an approval probability of {probability:.1f}%. Our BiasShield system has carefully evaluated your application, taking into account various factors that contribute to your creditworthiness.

The key factors that positively influenced this decision include:
"""
            for factor, impact in top_factors:
                factor_name = factor.replace('_', ' ').title()
                message += f"- {factor_name}: This factor had a {impact*100:.1f}% impact on your approval\n"
                
            message += f"""
Your credit score of {application.get('credit_score')} and income of ${application.get('income'):,.2f} demonstrate financial stability, which are important indicators of your ability to repay the loan.

Recommendations:
1. Maintain your current credit score by making timely payments
2. Consider setting up automatic payments to avoid any missed deadlines
3. Review your loan terms carefully before proceeding

Thank you for choosing our services. If you have any questions about your approval or the next steps, please don't hesitate to contact our customer service team.

BiasShield Decision System
"""
        else:
            message = f"""
We regret to inform you that your loan application has not been approved at this time. Our BiasShield system has carefully evaluated your application and determined that it does not meet our current lending criteria. The decision was made with an approval probability of {probability:.1f}%.

The key factors that influenced this decision include:
"""
            for factor, impact in top_factors:
                factor_name = factor.replace('_', ' ').title()
                message += f"- {factor_name}: This factor had a {impact*100:.1f}% impact on the decision\n"
                
            message += f"""
Recommendations to improve your future applications:
1. Work on improving your credit score through timely bill payments
2. Reduce existing debt before applying for new credit
3. Consider applying for a smaller loan amount relative to your income
4. Wait 3-6 months before reapplying to allow time for credit improvements

We encourage you to review your credit report for any inaccuracies and address any issues that may be affecting your creditworthiness. If you believe this decision was made in error or would like more information, you can request a detailed explanation of the decision.

BiasShield Decision System
"""
        
        return message
    
    @staticmethod
    def generate_bias_explanation(fairness_data):
        """
        Generate a natural language explanation of bias findings
        """
        # Extract key metrics
        gender_disparity = fairness_data.gender.approval_disparity * 100
        race_disparity = fairness_data.race.approval_disparity * 100
        age_disparity = fairness_data.age_group.approval_disparity * 100
        disability_disparity = fairness_data.disability_status.approval_disparity * 100
        
        # Determine which attributes show the most significant bias
        disparities = [
            ("Gender", gender_disparity),
            ("Race", race_disparity),
            ("Age Group", age_disparity),
            ("Disability Status", disability_disparity)
        ]
        
        # Sort by disparity magnitude
        sorted_disparities = sorted(disparities, key=lambda x: abs(x[1]), reverse=True)
        
        # Generate explanation
        message = "## Bias Analysis Report\n\n"
        message += "### Summary of Findings\n\n"
        
        # Overall assessment
        if max(abs(d[1]) for d in disparities) > 10:
            message += "**High Bias Alert**: Significant disparities detected in approval rates across protected attributes.\n\n"
        elif max(abs(d[1]) for d in disparities) > 5:
            message += "**Moderate Bias Alert**: Some disparities detected in approval rates across protected attributes.\n\n"
        else:
            message += "**Low Bias Alert**: Minimal disparities detected in approval rates across protected attributes.\n\n"
        
        # Detailed analysis
        message += "### Detailed Analysis\n\n"
        
        for attribute, disparity in sorted_disparities:
            message += f"**{attribute}**:\n"
            
            if attribute == "Gender":
                rates = fairness_data.gender.approval_rates
                highest = max(rates.items(), key=lambda x: x[1])
                lowest = min(rates.items(), key=lambda x: x[1])
                message += f"- Approval rate disparity: {disparity:.1f}%\n"
                message += f"- Highest approval rate: {highest[0]} ({highest[1]*100:.1f}%)\n"
                message += f"- Lowest approval rate: {lowest[0]} ({lowest[1]*100:.1f}%)\n"
                
                if abs(disparity) > 5:
                    message += f"- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.\n"
                
            elif attribute == "Race":
                rates = fairness_data.race.approval_rates
                highest = max(rates.items(), key=lambda x: x[1])
                lowest = min(rates.items(), key=lambda x: x[1])
                message += f"- Approval rate disparity: {disparity:.1f}%\n"
                message += f"- Highest approval rate: {highest[0]} ({highest[1]*100:.1f}%)\n"
                message += f"- Lowest approval rate: {lowest[0]} ({lowest[1]*100:.1f}%)\n"
                
                if abs(disparity) > 5:
                    message += f"- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.\n"
            
            elif attribute == "Age Group":
                rates = fairness_data.age_group.approval_rates
                highest = max(rates.items(), key=lambda x: x[1])
                lowest = min(rates.items(), key=lambda x: x[1])
                message += f"- Approval rate disparity: {disparity:.1f}%\n"
                message += f"- Highest approval rate: {highest[0]} ({highest[1]*100:.1f}%)\n"
                message += f"- Lowest approval rate: {lowest[0]} ({lowest[1]*100:.1f}%)\n"
                
                if abs(disparity) > 5:
                    message += f"- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.\n"
            
            elif attribute == "Disability Status":
                rates = fairness_data.disability_status.approval_rates
                highest = max(rates.items(), key=lambda x: x[1])
                lowest = min(rates.items(), key=lambda x: x[1])
                message += f"- Approval rate disparity: {disparity:.1f}%\n"
                message += f"- Highest approval rate: {highest[0]} ({highest[1]*100:.1f}%)\n"
                message += f"- Lowest approval rate: {lowest[0]} ({lowest[1]*100:.1f}%)\n"
                
                if abs(disparity) > 5:
                    message += f"- **Regulatory concern**: This disparity exceeds the typical 5% threshold for regulatory scrutiny.\n"
            
            message += "\n"
        
        # Conclusion
        message += "### Conclusion\n\n"
        if max(abs(d[1]) for d in disparities) > 10:
            message += "The model shows significant bias that requires immediate attention. Implementing bias mitigation techniques is strongly recommended before deploying this model in production.\n"
        elif max(abs(d[1]) for d in disparities) > 5:
            message += "The model shows moderate bias that should be addressed. Consider implementing bias mitigation techniques to improve fairness before full deployment.\n"
        else:
            message += "The model shows acceptable levels of bias, but continuous monitoring is recommended to ensure fairness is maintained over time.\n"
        
        return message
    
    @staticmethod
    def generate_remediation_strategy(fairness_data):
        """
        Generate remediation strategies for addressing bias
        """
        # Extract key metrics
        gender_disparity = fairness_data.gender.approval_disparity * 100
        race_disparity = fairness_data.race.approval_disparity * 100
        age_disparity = fairness_data.age_group.approval_disparity * 100
        disability_disparity = fairness_data.disability_status.approval_disparity * 100
        
        # Determine which attributes show the most significant bias
        disparities = [
            ("Gender", gender_disparity),
            ("Race", race_disparity),
            ("Age Group", age_disparity),
            ("Disability Status", disability_disparity)
        ]
        
        # Sort by disparity magnitude
        sorted_disparities = sorted(disparities, key=lambda x: abs(x[1]), reverse=True)
        most_biased = sorted_disparities[0][0]
        
        # Generate remediation strategy
        message = "## Bias Remediation Strategy\n\n"
        
        # Technical strategies section
        message += "### Technical Strategies\n\n"
        
        message += "1. **Fairness Constraints**:\n"
        message += "   - Implement Demographic Parity constraints during model training\n"
        message += "   - Apply Equalized Odds constraints to balance error rates across groups\n"
        message += f"   - Focus particularly on {most_biased} fairness, which shows the highest disparity\n\n"
        
        message += "2. **Data Rebalancing**:\n"
        message += "   - Apply instance weighting to compensate for underrepresented groups\n"
        message += "   - Use reweighing techniques from the AIF360 toolkit\n"
        message += "   - Consider synthetic data generation for minority groups\n\n"
        
        message += "3. **Model Adjustments**:\n"
        message += "   - Optimize classification thresholds separately for each demographic group\n"
        message += "   - Implement adversarial debiasing techniques\n"
        message += "   - Consider ensemble methods that combine multiple fair classifiers\n\n"
        
        # Feature engineering section
        message += "### Feature Engineering Approaches\n\n"
        
        message += "1. **Feature Selection**:\n"
        message += "   - Remove or reduce weight of features highly correlated with protected attributes\n"
        message += "   - Identify and eliminate proxy variables that may encode bias\n\n"
        
        message += "2. **Feature Transformation**:\n"
        message += "   - Apply fairness-aware feature transformations\n"
        message += "   - Develop composite features that are less correlated with protected attributes\n\n"
        
        # Policy recommendations
        message += "### Policy Recommendations\n\n"
        
        message += "1. **Process Changes**:\n"
        message += "   - Implement a second-level review for rejected applications from protected groups\n"
        message += "   - Establish clear documentation requirements for all lending decisions\n\n"
        
        message += "2. **Monitoring Framework**:\n"
        message += "   - Set up continuous monitoring of approval rates across demographic groups\n"
        message += "   - Establish disparity thresholds that trigger automatic reviews\n"
        message += "   - Conduct regular fairness audits with detailed reporting\n\n"
        
        # Implementation considerations
        message += "### Implementation Considerations\n\n"
        
        message += "1. **Performance Tradeoffs**:\n"
        message += "   - Be aware that some fairness constraints may slightly reduce overall model accuracy\n"
        message += "   - Establish acceptable thresholds for both fairness and performance\n\n"
        
        message += "2. **Regulatory Compliance**:\n"
        message += "   - Document all bias mitigation efforts for regulatory review\n"
        message += "   - Ensure compliance with ECOA, FHA, and FCRA requirements\n"
        message += "   - Prepare explanations for any remaining disparities\n\n"
        
        message += "3. **Validation Approach**:\n"
        message += "   - Test remediation strategies on historical data before implementation\n"
        message += "   - Use A/B testing to validate improvements in fairness metrics\n"
        message += "   - Establish a feedback loop for continuous improvement\n\n"
        
        return message

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to BiasShield API"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(application: LoanApplication):
    """
    Predict loan approval for a single application
    """
    try:
        # Convert application to DataFrame
        app_df = pd.DataFrame([application.dict()])
        
        # Add ID and Age_Group
        app_df['ID'] = 0
        app_df['Age_Group'] = pd.cut(
            app_df['age'], 
            bins=[0, 25, 60, 100], 
            labels=['Under 25', '25-60', 'Over 60']
        )
        
        # Load model (in production, keep model in memory)
        # For demo, we'll use a simple rule-based approach
        approved = (
            (app_df['credit_score'].iloc[0] >= 600) and
            (app_df['income'].iloc[0] >= 50000) and
            (app_df['loan_amount'].iloc[0] <= app_df['income'].iloc[0] * 3)
        )
        
        # Calculate approval probability
        if approved:
            probability = 0.8
        else:
            probability = 0.2
        
        # Generate simple SHAP-like explanation
        explanation = {
            'credit_score': 0.4,
            'income': 0.3,
            'loan_amount': 0.2,
            'age': 0.05,
            'gender': 0.03,
            'race': 0.02
        }
        
        return {
            "approved": approved,
            "approval_probability": probability,
            "explanation": explanation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fairness", response_model=FairnessResponse)
async def get_fairness_metrics():
    """
    Get fairness metrics from the latest model analysis
    """
    try:
        # In production, this would load actual metrics from the model
        # For demo, we'll return sample metrics
        return {
            "gender": {
                "approval_rates": {"Male": 0.72, "Female": 0.64},
                "approval_disparity": 0.08,
                "fp_rates": {"Male": 0.15, "Female": 0.12},
                "fn_rates": {"Male": 0.10, "Female": 0.18},
                "fp_disparity": 0.03,
                "fn_disparity": 0.08
            },
            "race": {
                "approval_rates": {"White": 0.75, "Black": 0.62, "Asian": 0.70, "Hispanic": 0.65},
                "approval_disparity": 0.13,
                "fp_rates": {"White": 0.16, "Black": 0.11, "Asian": 0.14, "Hispanic": 0.12},
                "fn_rates": {"White": 0.09, "Black": 0.19, "Asian": 0.12, "Hispanic": 0.16},
                "fp_disparity": 0.05,
                "fn_disparity": 0.10
            },
            "age_group": {
                "approval_rates": {"Under 25": 0.65, "25-60": 0.72, "Over 60": 0.68},
                "approval_disparity": 0.07,
                "fp_rates": {"Under 25": 0.13, "25-60": 0.15, "Over 60": 0.14},
                "fn_rates": {"Under 25": 0.18, "25-60": 0.10, "Over 60": 0.15},
                "fp_disparity": 0.02,
                "fn_disparity": 0.08
            },
            "disability_status": {
                "approval_rates": {"Yes": 0.62, "No": 0.73},
                "approval_disparity": 0.11,
                "fp_rates": {"Yes": 0.12, "No": 0.15},
                "fn_rates": {"Yes": 0.20, "No": 0.09},
                "fp_disparity": 0.03,
                "fn_disparity": 0.11
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/visualizations/{viz_type}")
async def get_visualization(viz_type: str):
    """
    Get a visualization image
    """
    try:
        # Map viz_type to file path
        viz_map = {
            "gender_approval": "approval_rates_by_Gender.png",
            "race_approval": "approval_rates_by_Race.png",
            "age_approval": "approval_rates_by_Age_Group.png",
            "disability_approval": "approval_rates_by_Disability_Status.png",
            "gender_error": "error_rates_by_Gender.png",
            "race_error": "error_rates_by_Race.png",
            "age_error": "error_rates_by_Age_Group.png",
            "disability_error": "error_rates_by_Disability_Status.png",
            "shap_summary": "shap_summary.png",
            "shap_bar": "shap_bar.png",
            "bias_summary": "bias_visualization.png"
        }
        
        if viz_type not in viz_map:
            raise HTTPException(status_code=404, detail=f"Visualization {viz_type} not found")
        
        # For demo, we'll return a placeholder message
        # In production, this would return the actual image file
        return {"message": f"Visualization {viz_type} would be returned here"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run-analysis")
async def run_analysis():
    """
    Run the full loan model analysis pipeline
    """
    try:
        # In production, this would run the actual analysis
        # For demo, we'll return a success message
        return {"message": "Analysis pipeline started successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain-loan", response_model=ExplanationResponse)
async def explain_loan(application: LoanApplication, prediction: PredictionResponse):
    """
    Generate a natural language explanation for a loan decision using template-based system
    """
    try:
        # Generate explanation using the template-based system
        explanation = ExplanationGenerator.generate_loan_explanation(application.dict(), prediction.dict())
        
        return {"explanation": explanation}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain-bias", response_model=ExplanationResponse)
async def explain_bias(fairness_data: FairnessResponse):
    """
    Generate a natural language explanation of bias findings using template-based system
    """
    try:
        # Generate explanation using the template-based system
        explanation = ExplanationGenerator.generate_bias_explanation(fairness_data)
        
        return {"explanation": explanation}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remediation-strategy", response_model=ExplanationResponse)
async def remediation_strategy(fairness_data: FairnessResponse):
    """
    Generate remediation strategies for addressing bias using template-based system
    """
    try:
        # Generate remediation strategy using the template-based system
        explanation = ExplanationGenerator.generate_remediation_strategy(fairness_data)
        
        return {"explanation": explanation}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/loan-decision-pdf")
async def generate_loan_decision_pdf(request: Request):
    """
    Generate a PDF report for a loan decision
    """
    try:
        # Parse request body
        body = await request.json()
        application_data = body.get('application', {})
        prediction_result = body.get('prediction', {})
        explanation_text = body.get('explanation', '')
        
        # Import the loan report generator
        from loan_report import generate_loan_report
        
        # Generate the PDF
        pdf = generate_loan_report(application_data, prediction_result, explanation_text)
        
        # Create a response with the PDF
        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=BiasShield_Decision_Report.pdf"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
