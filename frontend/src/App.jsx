import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PredictionForm from "./components/PredictionForm";
import SHAPVisualizer from "./components/SHAPVisualizer";
import BiasSummary from "./components/BiasSummary";
import ComplianceDashboard from "./components/ComplianceDashboard";
import IntersectionalBiasAnalysis from "./components/IntersectionalBiasAnalysis";
import BiasRemediationRecommendations from "./components/BiasRemediationRecommendations";
import GroqBiasInsights from "./components/GroqBiasInsights";
import GroqComplianceInsights from "./components/GroqComplianceInsights";
import GroqRemediationStrategy from "./components/GroqRemediationStrategy";
import IntersectionalBiasHeatmap from "./components/IntersectionalBiasHeatmap";
import FairnessRemediationPanel from "./components/FairnessRemediationPanel";
import TemporalBiasTracker from "./components/TemporalBiasTracker";
import { generateMockIntersectionalData } from "./services/intersectionalBiasService";
import { generateMockTemporalData } from "./services/temporalBiasService";

const App = () => {
  const [activeTab, setActiveTab] = useState("prediction");
  const [predictionResult, setPredictionResult] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [intersectionalData] = useState(generateMockIntersectionalData());
  const [temporalData] = useState(generateMockTemporalData());

  const handlePredictionResult = (result, formData) => {
    setPredictionResult(result);
    setApplicationData(formData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mock bias metrics for demo purposes - ensure consistent structure
  const [biasMetricsData] = useState({
    gender: {
      group_metrics: {
        Male: { 
          approval_rate: 0.72, 
          false_positive_rate: 0.15, 
          false_negative_rate: 0.1,
          count: 5000
        },
        Female: { 
          approval_rate: 0.64, 
          false_positive_rate: 0.12, 
          false_negative_rate: 0.18,
          count: 4500
        },
        Other: { 
          approval_rate: 0.61, 
          false_positive_rate: 0.11, 
          false_negative_rate: 0.19,
          count: 500
        }
      },
      approval_disparity: 0.11,
      false_positive_disparity: 0.04,
      false_negative_disparity: 0.09,
    },
    race: {
      group_metrics: {
        White: { 
          approval_rate: 0.75, 
          false_positive_rate: 0.16, 
          false_negative_rate: 0.09,
          count: 6000
        },
        Black: { 
          approval_rate: 0.62, 
          false_positive_rate: 0.11, 
          false_negative_rate: 0.19,
          count: 2000
        },
        Asian: { 
          approval_rate: 0.7, 
          false_positive_rate: 0.14, 
          false_negative_rate: 0.12,
          count: 1500
        },
        Hispanic: { 
          approval_rate: 0.65, 
          false_positive_rate: 0.12, 
          false_negative_rate: 0.16,
          count: 1800
        },
        Other: { 
          approval_rate: 0.63, 
          false_positive_rate: 0.12, 
          false_negative_rate: 0.17,
          count: 700
        }
      },
      approval_disparity: 0.13,
      false_positive_disparity: 0.05,
      false_negative_disparity: 0.1,
    },
    age_group: {
      group_metrics: {
        "Under 25": { 
          approval_rate: 0.65, 
          false_positive_rate: 0.13, 
          false_negative_rate: 0.18,
          count: 1800
        },
        "25-60": { 
          approval_rate: 0.72, 
          false_positive_rate: 0.15, 
          false_negative_rate: 0.1,
          count: 7000
        },
        "Over 60": { 
          approval_rate: 0.68, 
          false_positive_rate: 0.14, 
          false_negative_rate: 0.15,
          count: 2500
        }
      },
      approval_disparity: 0.07,
      false_positive_disparity: 0.02,
      false_negative_disparity: 0.08,
    },
    disability_status: {
      group_metrics: {
        Yes: { 
          approval_rate: 0.62, 
          false_positive_rate: 0.12, 
          false_negative_rate: 0.2,
          count: 1200
        },
        No: { 
          approval_rate: 0.73, 
          false_positive_rate: 0.15, 
          false_negative_rate: 0.09,
          count: 10000
        }
      },
      approval_disparity: 0.11,
      false_positive_disparity: 0.03,
      false_negative_disparity: 0.11,
    },
  });

  // Mock compliance data for demo purposes
  const complianceData = {
    ecoa: {
      name: "Equal Credit Opportunity Act (ECOA)",
      description:
        "Prohibits credit discrimination on the basis of race, color, religion, national origin, sex, marital status, age, or because a person receives public assistance.",
      requirements: [
        {
          id: 1,
          name: "Non-discrimination in credit decisions",
          status: "Compliant",
          score: 92,
        },
        {
          id: 2,
          name: "Equal treatment regardless of protected class",
          status: "Attention Needed",
          score: 78,
        },
        {
          id: 3,
          name: "Notification of adverse action",
          status: "Compliant",
          score: 95,
        },
        {
          id: 4,
          name: "Consistent evaluation criteria",
          status: "Compliant",
          score: 88,
        },
        { id: 5, name: "Record retention", status: "Compliant", score: 100 },
      ],
      overallStatus: "Partially Compliant",
      overallScore: 90,
    },
    fha: {
      name: "Fair Housing Act (FHA)",
      description:
        "Prohibits discrimination in residential real estate-related transactions because of race, color, religion, sex, disability, familial status, or national origin.",
      requirements: [
        {
          id: 1,
          name: "Non-discrimination in housing-related lending",
          status: "Compliant",
          score: 94,
        },
        {
          id: 2,
          name: "Equal access to housing loans",
          status: "Attention Needed",
          score: 76,
        },
        {
          id: 3,
          name: "Consistent application of lending criteria",
          status: "Compliant",
          score: 89,
        },
        {
          id: 4,
          name: "Non-discriminatory marketing practices",
          status: "Compliant",
          score: 97,
        },
      ],
      overallStatus: "Partially Compliant",
      overallScore: 89,
    },
    fcra: {
      name: "Fair Credit Reporting Act (FCRA)",
      description:
        "Promotes the accuracy, fairness, and privacy of information in the files of consumer reporting agencies.",
      requirements: [
        {
          id: 1,
          name: "Permissible purpose for credit checks",
          status: "Compliant",
          score: 100,
        },
        {
          id: 2,
          name: "Adverse action notifications",
          status: "Compliant",
          score: 95,
        },
        {
          id: 3,
          name: "Disclosure of credit score use",
          status: "Compliant",
          score: 98,
        },
        {
          id: 4,
          name: "Risk-based pricing notices",
          status: "Compliant",
          score: 92,
        },
        {
          id: 5,
          name: "Accuracy of information used",
          status: "Compliant",
          score: 96,
        },
      ],
      overallStatus: "Compliant",
      overallScore: 96,
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6">
          {predictionResult && activeTab === "prediction" && (
            <div
              className={`mb-8 p-6 rounded-lg ${
                predictionResult.approved ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <h2 className="text-2xl font-bold mb-2">
                {predictionResult.approved ? "Loan Approved" : "Loan Denied"}
              </h2>
              <p className="text-lg">
                Approval probability:{" "}
                {(predictionResult.approval_probability * 100).toFixed(1)}%
              </p>
            </div>
          )}

          {activeTab === "prediction" && (
            <>
              {/* Decision explanation removed as requested */}
              <PredictionForm onPredictionResult={handlePredictionResult} />
              {predictionResult && (
                <SHAPVisualizer predictionResult={predictionResult} />
              )}
            </>
          )}

          {activeTab === "fairness" && (
            <>
              <BiasSummary />
              <GroqBiasInsights biasMetrics={biasMetricsData} />
            </>
          )}

          {activeTab === "intersectional" && (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Intersectional Bias Heatmap</h2>
                </div>
                <p className="text-gray-600">
                  Analyze how combinations of protected attributes affect model outcomes, revealing potential intersectional biases that may not be apparent when examining attributes in isolation.
                </p>
              </div>
              <IntersectionalBiasHeatmap biasData={intersectionalData} />
            </>
          )}

          {activeTab === "fairness_remediation" && (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Fairness Remediation Panel</h2>
                </div>
                <p className="text-gray-600">
                  Simulate different bias mitigation strategies and see their impact on fairness metrics. Apply and undo remediation strategies dynamically to understand their effects.
                </p>
              </div>
              {/* Pass biasMetricsData directly to avoid any reference issues */}
              <FairnessRemediationPanel 
                biasMetrics={{...biasMetricsData}} 
              />
            </>
          )}

          {activeTab === "temporal" && (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Temporal Bias Tracking</h2>
                </div>
                <p className="text-gray-600">
                  Track how fairness metrics change over time to detect if a model gets more biased as it learns from new data. This analysis is crucial for ongoing model governance and documentation.
                </p>
              </div>
              <TemporalBiasTracker temporalData={temporalData} />
            </>
          )}

          {activeTab === "compliance" && (
            <>
              <ComplianceDashboard />
              <GroqComplianceInsights complianceData={complianceData} />
            </>
          )}

          {activeTab === "remediation" && (
            <>
              <BiasRemediationRecommendations />
              <GroqRemediationStrategy biasMetrics={biasMetricsData} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
