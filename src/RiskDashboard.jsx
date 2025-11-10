import React, { useState } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, ZAxis } from 'recharts';

// Risk data from your register
const riskData = [
  { id: 'R01', name: 'KYC vendor API downtime', category: 'Integration', probability: 3, impact: 5, score: 15, owner: 'Backend Lead', status: 'OPEN' },
  { id: 'R02', name: 'KYC document images stored insecurely', category: 'Security', probability: 2, impact: 5, score: 10, owner: 'Security Lead', status: 'OPEN' },
  { id: 'R03', name: 'Poor KYC document photo quality', category: 'Quality', probability: 4, impact: 3, score: 12, owner: 'Frontend Lead', status: 'OPEN' },
  { id: 'R04', name: 'Users abandon registration at KYC step', category: 'Business', probability: 4, impact: 4, score: 16, owner: 'Product Owner', status: 'OPEN' },
  { id: 'R05', name: 'OTP SMS delivery delays', category: 'Technical', probability: 3, impact: 3, score: 9, owner: 'Backend Lead', status: 'WATCH' },
];

// Category breakdown data
const categoryData = [
  { category: 'Integration', low: 0, medium: 0, high: 1 },
  { category: 'Security', low: 0, medium: 1, high: 0 },
  { category: 'Quality', low: 0, medium: 0, high: 1 },
  { category: 'Business', low: 0, medium: 0, high: 1 },
  { category: 'Technical', low: 0, medium: 1, high: 0 },
];

const RiskDashboard = () => {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Get color based on risk score
  const getRiskColor = (score) => {
    if (score >= 15) return '#ef4444'; // Red - Critical
    if (score >= 10) return '#f97316'; // Orange - High
    if (score >= 6) return '#eab308'; // Yellow - Medium
    return '#22c55e'; // Green - Low
  };

  // Get risk level text
  const getRiskLevel = (score) => {
    if (score >= 15) return 'CRITICAL';
    if (score >= 10) return 'HIGH';
    if (score >= 6) return 'MEDIUM';
    return 'LOW';
  };

  // Filter risks based on selected filters
  const filteredRisks = riskData.filter(risk => {
    const categoryMatch = filterCategory === 'All' || risk.category === filterCategory;
    const statusMatch = filterStatus === 'All' || risk.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  // Custom tooltip for scatter chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>{data.id}: {data.name}</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Probability: {data.probability} ({(data.probability * 20).toFixed(0)}%)</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Impact: {data.impact} ({(data.impact * 20).toFixed(0)}%)</p>
          <p style={{ margin: '4px 0', fontWeight: 'bold', color: getRiskColor(data.score) }}>
            Risk Score: {data.score} ({getRiskLevel(data.score)})
          </p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#9ca3af' }}>Owner: {data.owner}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            NULPBank MVP - Risk Register Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Epic 1: Onboarding & Authentication</p>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Filter by Category:
            </label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                minWidth: '180px'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Integration">Integration</option>
              <option value="Security">Security</option>
              <option value="Quality">Quality</option>
              <option value="Business">Business</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Filter by Status:
            </label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                minWidth: '180px'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="WATCH">Watch</option>
              <option value="STABLE">Stable</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '3px' }}></div>
                <span>Critical (≥15)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', background: '#f97316', borderRadius: '3px' }}></div>
                <span>High (10-14)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', background: '#eab308', borderRadius: '3px' }}></div>
                <span>Medium (6-9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '3px' }}></div>
                <span>Low (1-5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 1: Risk Heatmap (Scatter) */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            1. Risk Heat Map (Probability × Impact)
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="probability" 
                name="Probability" 
                domain={[0, 6]}
                label={{ value: 'Probability (Likelihood)', position: 'bottom', offset: 40, style: { fontSize: 14, fontWeight: 600 } }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="impact" 
                name="Impact" 
                domain={[0, 6]}
                label={{ value: 'Impact', angle: -90, position: 'left', offset: 40, style: { fontSize: 14, fontWeight: 600 } }}
                tick={{ fontSize: 12 }}
              />
              <ZAxis type="number" dataKey="score" range={[400, 2000]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                data={filteredRisks} 
                onClick={(data) => setSelectedRisk(data)}
              >
                {filteredRisks.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getRiskColor(entry.score)}
                    opacity={selectedRisk?.id === entry.id ? 1 : 0.7}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '13px', color: '#6b7280' }}>
            💡 <strong>Tip:</strong> Click on any bubble to see detailed risk information. Bubble size represents risk score. Top-right corner = highest risk.
          </div>
        </div>

        {/* Chart 2: Category Breakdown (Stacked Bar) */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            2. Risk Breakdown by Category
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={categoryData} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" label={{ value: 'Number of Risks', position: 'bottom', offset: 0 }} />
              <YAxis type="category" dataKey="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low Risk" />
              <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium Risk" />
              <Bar dataKey="high" stackId="a" fill="#ef4444" name="High/Critical Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Interactive Risk List */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            3. Interactive Risk Register
          </h2>
          
          <div style={{ marginBottom: '16px', padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
              📊 Showing {filteredRisks.length} of {riskData.length} risks
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Risk ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Risk Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>P</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>I</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk, index) => (
                  <tr 
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      background: selectedRisk?.id === risk.id ? '#f0f9ff' : index % 2 === 0 ? 'white' : '#f9fafb',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedRisk?.id === risk.id ? '#f0f9ff' : index % 2 === 0 ? 'white' : '#f9fafb'}
                  >
                    <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937' }}>{risk.id}</td>
                    <td style={{ padding: '12px', color: '#374151', maxWidth: '300px' }}>
                      {risk.name.length > 60 ? risk.name.substring(0, 60) + '...' : risk.name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#e0e7ff',
                        color: '#3730a3'
                      }}>
                        {risk.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{risk.probability}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>{risk.impact}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        background: getRiskColor(risk.score),
                        color: 'white'
                      }}>
                        {risk.score}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '13px' }}>{risk.owner}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: risk.status === 'OPEN' ? '#fef3c7' : risk.status === 'WATCH' ? '#fed7aa' : '#d1fae5',
                        color: risk.status === 'OPEN' ? '#92400e' : risk.status === 'WATCH' ? '#9a3412' : '#065f46'
                      }}>
                        {risk.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Risk Details */}
          {selectedRisk && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', margin: 0 }}>
                  {selectedRisk.id}: {selectedRisk.name}
                </h3>
                <button
                  onClick={() => setSelectedRisk(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '0 8px'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
                <div>
                  <strong style={{ color: '#475569' }}>Category:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedRisk.category}</p>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Probability:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedRisk.probability}/5 ({(selectedRisk.probability * 20).toFixed(0)}%)</p>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Impact:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedRisk.impact}/5 ({(selectedRisk.impact * 20).toFixed(0)}%)</p>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Risk Score:</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: getRiskColor(selectedRisk.score) }}>
                    {selectedRisk.score} - {getRiskLevel(selectedRisk.score)}
                  </p>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Owner:</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{selectedRisk.owner}</p>
                </div>
                <div>
                  <strong style={{ color: '#475569' }}>Status:</strong>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#1e293b' }}>{selectedRisk.status}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
              {riskData.filter(r => r.score >= 15).length}
            </div>
            <div style={{ color: '#991b1b', fontSize: '14px', marginTop: '4px' }}>Critical Risks</div>
          </div>
          <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f97316' }}>
              {riskData.filter(r => r.score >= 10 && r.score < 15).length}
            </div>
            <div style={{ color: '#9a3412', fontSize: '14px', marginTop: '4px' }}>High Risks</div>
          </div>
          <div style={{ background: '#fefce8', padding: '20px', borderRadius: '8px', border: '1px solid #fde047' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eab308' }}>
              {riskData.filter(r => r.score >= 6 && r.score < 10).length}
            </div>
            <div style={{ color: '#854d0e', fontSize: '14px', marginTop: '4px' }}>Medium Risks</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
              {riskData.filter(r => r.score < 6).length}
            </div>
            <div style={{ color: '#166534', fontSize: '14px', marginTop: '4px' }}>Low Risks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;