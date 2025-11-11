import * as XLSX from 'xlsx';
 
export const exportCSV = (filteredRisks, getRiskLevel) => {
  const headers = ['Risk ID', 'Name', 'Category', 'Prob', 'Impact', 'Score', 'Level', 'Owner', 'Status', 'Mitigation', 'Updated'];
  const rows = filteredRisks.map(r => [
    r.id,
    '"' + r.name + '"',
    r.category,
    r.probability,
    r.impact,
    r.score,
    getRiskLevel(r.score),
    r.owner,
    r.status,
    '"' + r.mitigation + '"',
    r.updated
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'risk_register_' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
};

export const exportExcel = (filteredRisks, getRiskLevel) => {
  const ws = XLSX.utils.json_to_sheet(
    filteredRisks.map(r => ({
      'Risk ID': r.id,
      Name: r.name,
      Category: r.category,
      Probability: r.probability,
      Impact: r.impact,
      Score: r.score,
      Level: getRiskLevel(r.score),
      Owner: r.owner,
      Status: r.status,
      Mitigation: r.mitigation,
      Updated: r.updated
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Risks');
  XLSX.writeFile(wb, `risk_register_${new Date().toISOString().split('T')[0]}.xlsx`);
};

  export const exportJSON = (filteredRisks) => {
    const json = JSON.stringify(filteredRisks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'risk_register_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
  };