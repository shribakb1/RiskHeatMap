import React, { useState, useRef } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, ZAxis, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';

import { riskData } from './riskData';

import { exportCSV, exportExcel, exportJSON } from './exportUtils';

const RiskDashboard = () => {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMitigation, setShowMitigation] = useState(false);
  const heatmapRef = useRef(null);
  const categoryRef = useRef(null);

  const getRiskColor = (score) => {
    if (score >= 15) return '#ef4444';
    if (score >= 10) return '#f97316';
    if (score >= 6) return '#eab308';
    return '#22c55e';
  };

  const getRiskLevel = (score) => {
    if (score >= 15) return 'CRITICAL';
    if (score >= 10) return 'HIGH';
    if (score >= 6) return 'MEDIUM';
    return 'LOW';
  };

  // Filter risks
  const filteredRisks = riskData.filter(risk => {
    const categoryMatch = filterCategory === 'All' || risk.category === filterCategory;
    const statusMatch = filterStatus === 'All' || risk.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.id.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const spreadRisks = filteredRisks.map((risk, index, arr) => {
    const samePos = arr.filter(r => r.probability === risk.probability && r.impact === risk.impact);
    if (samePos.length > 1) {
      const posIdx = samePos.findIndex(r => r.id === risk.id);
      const offset = (posIdx - (samePos.length - 1) / 2) * 0.2;
      return {
        ...risk,
        displayProb: risk.probability + offset,
        displayImp: risk.impact + (posIdx % 2 === 0 ? offset * 0.5 : -offset * 0.5)
      };
    }
    return { ...risk, displayProb: risk.probability, displayImp: risk.impact };
  });

  // Calculate statistics (always from all data)
  const criticalCount = riskData.filter(r => r.score >= 15).length;
  const highCount = riskData.filter(r => r.score >= 10 && r.score < 15).length;
  const mediumCount = riskData.filter(r => r.score >= 6 && r.score < 10).length;
  const lowCount = riskData.filter(r => r.score < 6).length;

  // Category breakdown (filtered data)
  const categories = ['Integration', 'Security', 'Quality', 'Business', 'Technical'];
  const categoryData = categories.map(cat => {
    const risks = filteredRisks.filter(r => r.category === cat);
    return {
      category: cat,
      low: risks.filter(r => r.score < 6).length,
      medium: risks.filter(r => r.score >= 6 && r.score < 10).length,
      high: risks.filter(r => r.score >= 10 && r.score < 15).length,
      critical: risks.filter(r => r.score >= 15).length,
    };
  }).filter(c => c.low + c.medium + c.high + c.critical > 0);

  const statusData = [
    { name: 'OPEN', value: filteredRisks.filter(r => r.status === 'OPEN').length, color: '#f59e0b' },
    { name: 'WATCH', value: filteredRisks.filter(r => r.status === 'WATCH').length, color: '#3b82f6' },
    { name: 'STABLE', value: filteredRisks.filter(r => r.status === 'STABLE').length, color: '#10b981' },
  ].filter(item => item.value > 0);

  const exportBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
  };


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: 'white', border: '2px solid #ddd', borderRadius: '8px', padding: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '300px' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{data.id}: {data.name}</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>Category: {data.category}</p>
          <p style={{ margin: '4px 0' }}>Probability: {data.probability}/5</p>
          <p style={{ margin: '4px 0' }}>Impact: {data.impact}/5</p>
          <p style={{ margin: '4px 0', fontWeight: 'bold', color: getRiskColor(data.score) }}>
            Score: {data.score} ({getRiskLevel(data.score)})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', marginTop: 0 }}>
              FinTech MVP - Risk Register
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Total Risks: {riskData.length} | Showing: {filteredRisks.length}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => exportCSV(filteredRisks, getRiskLevel)} style={exportBtnStyle}>
              Export CSV
            </button>

            <button onClick={() => exportExcel(filteredRisks, getRiskLevel)} style={{ ...exportBtnStyle, background: '#22c55e' }}>
              Export Excel
            </button>

            <button onClick={() => exportJSON(filteredRisks)} style={{ ...exportBtnStyle, background: '#f59e0b' }}>
              Export JSON
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #fca5a5' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc2626' }}>{criticalCount}</div>
            <div style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600' }}>Critical Risks</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #fdba74' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ea580c' }}>{highCount}</div>
            <div style={{ color: '#9a3412', fontSize: '14px', fontWeight: '600' }}>High Risks</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #facc15' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ca8a04' }}>{mediumCount}</div>
            <div style={{ color: '#854d0e', fontSize: '14px', fontWeight: '600' }}>Medium Risks</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #4ade80' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a' }}>{lowCount}</div>
            <div style={{ color: '#166534', fontSize: '14px', fontWeight: '600' }}>Low Risks</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Search:</label>
            <input type="text" placeholder="Search by ID or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '180px' }}>
              <option value="All">All Categories</option>
              <option value="Integration">Integration</option>
              <option value="Security">Security</option>
              <option value="Quality">Quality</option>
              <option value="Business">Business</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '180px' }}>
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="WATCH">Watch</option>
              <option value="STABLE">Stable</option>
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* Heatmap */}
          <div ref={heatmapRef} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Risk Heat Map</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="displayProb" domain={[0, 6]} label={{ value: 'Probability', position: 'bottom', offset: 40 }} />
                <YAxis type="number" dataKey="displayImp" domain={[0, 6]} label={{ value: 'Impact', angle: -90, position: 'left', offset: 40 }} />
                <ZAxis type="number" dataKey="score" range={[400, 1800]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={spreadRisks} onClick={(data) => setSelectedRisk(data)}>
                  {spreadRisks.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={getRiskColor(entry.score)} opacity={selectedRisk && selectedRisk.id === entry.id ? 1 : 0.75} style={{ cursor: 'pointer' }} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Status Distribution</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => name + ': ' + value} outerRadius={120} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div ref={categoryRef} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={90} />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
              <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
              <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Risk Register</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showMitigation} onChange={(e) => setShowMitigation(e.target.checked)} />
              Show Mitigation
            </label>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Risk Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>P</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>I</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  {showMitigation && <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Mitigation</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((risk, index) => (
                  <tr key={risk.id} onClick={() => setSelectedRisk(risk)} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer', background: selectedRisk && selectedRisk.id === risk.id ? '#f0f9ff' : index % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{risk.id}</td>
                    <td style={{ padding: '12px', maxWidth: '280px' }}>{risk.name.length > 50 ? risk.name.substring(0, 50) + '...' : risk.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500', background: '#e0e7ff', color: '#3730a3' }}>
                        {risk.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{risk.probability}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{risk.impact}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '6px', fontWeight: '700', background: getRiskColor(risk.score), color: 'white' }}>
                        {risk.score}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: risk.status === 'OPEN' ? '#fef3c7' : risk.status === 'WATCH' ? '#dbeafe' : '#d1fae5', color: risk.status === 'OPEN' ? '#92400e' : risk.status === 'WATCH' ? '#1e40af' : '#065f46' }}>
                        {risk.status}
                      </span>
                    </td>
                    {showMitigation && <td style={{ padding: '12px', fontSize: '12px' }}>{risk.mitigation}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRisks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p>No risks match your filters</p>
            </div>
          )}

          {selectedRisk && (
            <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid #0ea5e9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>{selectedRisk.id}: {selectedRisk.name}</h3>
                <button onClick={() => setSelectedRisk(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 8px' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px', marginBottom: '12px' }}>
                <div><strong>Category:</strong> {selectedRisk.category}</div>
                <div><strong>Probability:</strong> {selectedRisk.probability}/5</div>
                <div><strong>Impact:</strong> {selectedRisk.impact}/5</div>
                <div><strong>Score:</strong> <span style={{ fontWeight: '700', color: getRiskColor(selectedRisk.score) }}>{selectedRisk.score} - {getRiskLevel(selectedRisk.score)}</span></div>
                <div><strong>Owner:</strong> {selectedRisk.owner}</div>
                <div><strong>Status:</strong> {selectedRisk.status}</div>
              </div>
              <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Mitigation:</strong>
                <p style={{ margin: 0, fontSize: '13px' }}>{selectedRisk.mitigation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              <p style={{ margin: '0 0 4px 0' }}>
                <strong>Risk Scoring:</strong> Score = Probability × Impact (Scale: 1-5)
              </p>
              <p style={{ margin: 0 }}>
                <strong>Risk Levels:</strong> Critical (≥15) | High (10-14) | Medium (6-9) | Low (1-5)
              </p>
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;