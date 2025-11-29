import React, { useState } from 'react';

export default function BrandSettings() {
  const [institutionId, setInstitutionId] = useState('');
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');

  const save = async () => {
    if (!institutionId) return alert('Enter institution id');
    const res = await fetch('/api/admin/brand/' + institutionId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo, theme: { primaryColor } })
    });
    const data = await res.json();
    alert(data.message || 'Updated');
  };

  return (
    <div>
      <h3>Brand Settings</h3>
      <div>
        <label>Institution ID:</label>
        <input value={institutionId} onChange={e => setInstitutionId(e.target.value)} />
      </div>
      <div>
        <label>Logo URL:</label>
        <input value={logo} onChange={e => setLogo(e.target.value)} />
      </div>
      <div>
        <label>Primary Color:</label>
        <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
      </div>
      <button onClick={save}>Save</button>
    </div>
  );
}
