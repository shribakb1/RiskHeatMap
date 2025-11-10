import React, { useState, useRef } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, ZAxis, PieChart, Pie } from 'recharts';
import { Download, Filter, Search, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

// Complete risk data from your register (all 15 risks)
const riskData = [
  { id: 'R01', name: 'KYC vendor API downtime blocks user registration', category: 'Integration', probability: 3, impact: 5, score: 15, owner: 'Backend Lead', status: 'OPEN', mitigation: 'Fallback to manual KYC review, health monitoring, secondary vendor' },
  { id: 'R02', name: 'KYC document images stored insecurely', category: 'Security', probability: 2, impact: 5, score: 10, owner: 'Security Lead', status: 'OPEN', mitigation: 'AES-256 encryption, pre-signed URLs, 90-day auto-delete' },
  { id: 'R03', name: 'Poor KYC document photo quality causes high rejection rate', category: 'Quality', probability: 4, impact: 3, score: 12, owner: 'Frontend Lead', status: 'OPEN', mitigation: 'Real-time image validation, live camera feedback, example images' },
  { id: 'R04', name: 'Users abandon registration at KYC document upload step', category: 'Business', probability: 4, impact: 4, score: 16, owner: 'Product Owner', status: 'OPEN', mitigation: 'Progress indicator, trust badges, simplified upload, delayed KYC option' },
  { id: 'R05', name: 'OTP SMS delivery delays during password reset', category: 'Technical', probability: 3, impact: 3, score: 9, owner: 'Backend Lead', status: 'WATCH', mitigation: 'Twilio premium routing, extended validity, email OTP alternative' },
  { id: 'R06', name: 'External Transfer API downtime prevents money transfers', category: 'Integration', probability: 3, impact: 5, score: 15, owner: 'Backend Lead', status: 'OPEN', mitigation: 'Fallback queue, API monitoring, SLA with provider, secondary provider' },
  { id: 'R07', name: 'Biometric data could be extracted or spoofed', category: 'Security', probability: 2, impact: 5, score: 10, owner: 'Security Lead', status: 'OPEN', mitigation: 'Secure enclave storage, anti-spoofing detection, fallback to password' },
  { id: 'R08', name: 'Live chat delayed or out-of-order messages under high load', category: 'Quality', probability: 3, impact: 4, score: 12, owner: 'Frontend Lead', status: 'OPEN', mitigation: 'Load testing, optimized WebSocket, message queue with ordering' },
  { id: 'R09', name: 'Users may not adopt biometric or 2FA due to complexity', category: 'Business', probability: 3, impact: 3, score: 9, owner: 'Product Owner', status: 'WATCH', mitigation: 'Clear instructions, guided tutorials, password fallback' },
  { id: 'R10', name: 'Internal P2P transfer atomic transaction deadlock under load', category: 'Technical', probability: 3, impact: 4, score: 12, owner: 'Backend Lead', status: 'WATCH', mitigation: 'DB transaction isolation, deadlock monitoring, optimized locking' },
  { id: 'R11', name: 'Biometric authentication fails on older devices', category: 'Technical', probability: 3, impact: 3, score: 9, owner: 'Frontend Lead', status: 'WATCH', mitigation: 'Capability detection, OTP fallback, clear error messages' },
  { id: 'R12', name: 'Live chat backend fails under peak user load', category: 'Technical', probability: 4, impact: 4, score: 16, owner: 'Backend Lead', status: 'OPEN', mitigation: 'Load testing, message queue, WebSocket cluster + Redis pub/sub' },
  { id: 'R13', name: 'Chat messages stored without encryption expose data', category: 'Security', probability: 3, impact: 5, score: 15, owner: 'Security Lead', status: 'OPEN', mitigation: 'TLS 1.3 + AES-256 encryption, access logs, 90-day retention' },
  { id: 'R14', name: 'Push notifications expose sensitive info on lock screens', category: 'Security', probability: 3, impact: 4, score: 12, owner: 'Product Owner', status: 'OPEN', mitigation: 'Obfuscate notification details, hide sensitive info setting' },
  { id: 'R15', name: 'Unauthorized operator data access to customer profiles', category: 'Security', probability: 3, impact: 5, score: 15, owner: 'Security Lead', status: 'OPEN', mitigation: 'Role-based access, data masking, profile view logging' },
];

const RiskDashboard = () => {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMitigation, setShowMitigation] = useState(false);
  const heatmapRef = useRef(null);
  const categoryRef = useRef(null);

  // Get color based on risk score
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

  // Calculate statistics
  const criticalCount = riskData.filter(r => r.score >= 15).length;
  const highCount = riskData.filter(r => r.score >= 10 && r.score < 15).length;
  const mediumCount = riskData.filter(r => r.score >= 6 && r.score < 10).length;
  const lowCount = riskData.filter(r => r.score < 6).length;

  // Category breakdown data
  const categories = ['Integration', 'Security', 'Quality', 'Business', 'Technical'];
  const categoryData = categories.map(cat => {
    const risks = riskData.filter(r => r.category === cat);
    return {
      category: cat,
      low: risks.filter(r => r.score < 6).length,
      medium: risks.filter(r => r.score >= 6 && r.score < 10).length,
      high: risks.filter(r => r.score >= 10 && r.score < 15).length,
      critical: risks.filter(r => r.score >= 15).length,
      total: risks.length
    };
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'OPEN', value: riskData.filter(r => r.status === 'OPEN').length, color: '#f59e0b' },
    { name: 'WATCH', value: riskData.filter(r => r.status === 'WATCH').length, color: '#3b82f6' },
    { name: 'STABLE', value: riskData.filter(r => r.status === 'STABLE').length, color: '#10b981' },
    { name: 'CLOSED', value: riskData.filter(r => r.status === 'CLOSED').length, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Download chart as image
  const downloadChart = (ref, filename) => {
    if (!ref.current) return;
    
    const svg = ref.current.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Risk ID', 'Risk Name', 'Category', 'Probability', 'Impact', 'Score', 'Risk Level', 'Owner', 'Status', 'Mitigation'];
    const rows = filteredRisks.map(risk => [
      risk.id,
      `"${risk.name}"`,
      risk.category,
      risk.probability,
      risk.impact,
      risk.score,
      getRiskLevel(risk.score),
      risk.owner,
      risk.status,
      `"${risk.mitigation}"`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `risk_register_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>{data.id}: {data.name}</p>
          <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '13px' }}>Category: {data.category}</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Probability: {data.probability}/5 ({(data.probability * 20).toFixed(0)}%)</p>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>Impact: {data.impact}/5 ({(data.impact * 20).toFixed(0)}%)</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                🏦 NULPBank MVP - Risk Register Dashboard
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Epic 1: Onboarding & Authentication | Total Risks: {riskData.length}</p>
            </div>
            <button
              onClick={exportToCSV}
              style={{
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
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              <Download size={18} />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #fca5a5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc2626' }}>{criticalCount}</div>
                <div style={{ color: '#991b1b', fontSize: '14px', marginTop: '4px', fontWeight: '600' }}>Critical Risks</div>
              </div>
              <AlertTriangle size={32} color="#dc2626" />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #fdba74', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ea580c' }}>{highCount}</div>
                <div style={{ color: '#9a3412', fontSize: '14px', marginTop: '4px', fontWeight: '600' }}>High Risks</div>
              </div>
              <TrendingUp size={32} color="#ea580c" />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #facc15', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ca8a04' }}>{mediumCount}</div>
                <div style={{ color: '#854d0e', fontSize: '14px', marginTop: '4px', fontWeight: '600' }}>Medium Risks</div>
              </div>
              <Filter size={32} color="#ca8a04" />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #4ade80', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a' }}>{lowCount}</div>
                <div style={{ color: '#166534', fontSize: '14px', marginTop: '4px', fontWeight: '600' }}>Low Risks</div>
              </div>
              <FileText size={32} color="#16a34a" />
            </div>
          </div>
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
          flexWrap: 'wrap',
          alignItems: 'end'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              <Search size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Search Risks:
            </label>
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              Category:
            </label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '10px 12px',
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
              Status:
            </label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 12px',
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

          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px' }}></div>
                <span>Critical</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#f97316', borderRadius: '3px' }}></div>
                <span>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#eab308', borderRadius: '3px' }}></div>
                <span>Medium</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#22c55e', borderRadius: '3px' }}></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* Risk Heatmap */}
          <div ref={heatmapRef} style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Risk Heat Map
              </h2>
              <button
                onClick={() => downloadChart(heatmapRef, 'risk_heatmap.png')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <Download size={14} />
                PNG
              </button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  dataKey="probability" 
                  domain={[0, 6]}
                  label={{ value: 'Probability', position: 'bottom', offset: 40, style: { fontSize: 13, fontWeight: 600 } }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="impact" 
                  domain={[0, 6]}
                  label={{ value: 'Impact', angle: -90, position: 'left', offset: 40, style: { fontSize: 13, fontWeight: 600 } }}
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="score" range={[300, 1500]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  data={filteredRisks} 
                  onClick={(data) => setSelectedRisk(data)}
                >
                  {filteredRisks.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getRiskColor(entry.score)}
                      opacity={selectedRisk?.id === entry.id ? 1 : 0.75}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Risk Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div ref={categoryRef} style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Risk Breakdown by Category
            </h2>
            <button
              onClick={() => downloadChart(categoryRef, 'category_breakdown.png')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <Download size={14} />
              PNG
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={categoryData} 
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 13 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
              <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
              <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Table */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              Risk Register - Detailed View
            </h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showMitigation}
                onChange={(e) => setShowMitigation(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Show Mitigation
            </label>
          </div>
          
          <div style={{ marginBottom: '16px', padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
              📊 Showing <strong>{filteredRisks.length}</strong> of <strong>{riskData.length}</strong> risks
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Risk Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>P</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>I</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Score</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Owner</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                  {showMitigation && <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Mitigation</th>}
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
                    <td style={{ padding: '12px', color: '#374151', maxWidth: '280px' }}>
                      {risk.name.length > 50 ? risk.name.substring(0, 50) + '...' : risk.name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: '#e0e7ff',
                        color: '#3730a3'
                      }}>
                        {risk.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>{risk.probability}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>{risk.impact}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '12px',
                        background: getRiskColor(risk.score),
                        color: 'white'
                      }}>
                        {risk.score}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px' }}>{risk.owner}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: risk.status === 'OPEN' ? '#fef3c7' : risk.status === 'WATCH' ? '#dbeafe' : risk.status === 'STABLE' ? '#d1fae5' : '#e5e7eb',
                        color: risk.status === 'OPEN' ? '#92400e' : risk.status === 'WATCH' ? '#1e40af' : risk.status === 'STABLE' ? '#065f46' : '#374151'
                      }}>
                        {risk.status}
                      </span>
                    </td>
                    {showMitigation && (
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px', maxWidth: '300px' }}>
                        {risk.mitigation.length > 80 ? risk.mitigation.substring(0, 80) + '...' : risk.mitigation}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRisks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <p style={{ fontSize: '16px' }}>No risks match your current filters</p>
            </div>
          )}

          {/* Selected Risk Details */}
          {selectedRisk && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #0ea5e9',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#0c4a6e', margin: 0 }}>
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
                    padding: '0 8px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px', marginBottom: '16px' }}>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Category:</strong>
                  <span style={{ color: '#1e293b' }}>{selectedRisk.category}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Probability:</strong>
                  <span style={{ color: '#1e293b' }}>{selectedRisk.probability}/5 ({(selectedRisk.probability * 20).toFixed(0)}%)</span>
                </div>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Impact:</strong>
                  <span style={{ color: '#1e293b' }}>{selectedRisk.impact}/5 ({(selectedRisk.impact * 20).toFixed(0)}%)</span>
                </div>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Risk Score:</strong>
                  <span style={{ fontWeight: '700', color: getRiskColor(selectedRisk.score) }}>
                    {selectedRisk.score} - {getRiskLevel(selectedRisk.score)}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Owner:</strong>
                  <span style={{ color: '#1e293b' }}>{selectedRisk.owner}</span>
                </div>
                <div>
                  <strong style={{ color: '#475569', display: 'block', marginBottom: '4px' }}>Status:</strong>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{selectedRisk.status}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '12px' }}>
                <strong style={{ color: '#475569', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Mitigation Strategy:</strong>
                <p style={{ margin: 0, color: '#1e293b', fontSize: '13px', lineHeight: '1.6' }}>{selectedRisk.mitigation}</p>
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