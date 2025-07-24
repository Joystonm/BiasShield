import React from 'react';

const GroqComplianceInsights = ({ complianceData }) => {
  if (!complianceData) {
    return null;
  }

  // Format compliance scores
  const getComplianceStatus = (score) => {
    if (score >= 90) return { status: 'Compliant', color: 'text-green-600' };
    if (score >= 75) return { status: 'Partially Compliant', color: 'text-yellow-600' };
    return { status: 'Non-Compliant', color: 'text-red-600' };
  };

  const regulations = [
    { id: 'ecoa', name: 'Equal Credit Opportunity Act (ECOA)', score: complianceData.ecoa?.overallScore || 0 },
    { id: 'fha', name: 'Fair Housing Act (FHA)', score: complianceData.fha?.overallScore || 0 },
    { id: 'fcra', name: 'Fair Credit Reporting Act (FCRA)', score: complianceData.fcra?.overallScore || 0 },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Regulatory Compliance</h3>
      </div>
      
      <div className="prose max-w-none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regulation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regulations.map((reg) => {
                const { status, color } = getComplianceStatus(reg.score);
                return (
                  <tr key={reg.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reg.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reg.score.toFixed(1)}%
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${color}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroqComplianceInsights;
