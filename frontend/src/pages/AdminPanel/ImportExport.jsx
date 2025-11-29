import React, { useState } from 'react';

export default function ImportExport() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const upload = async () => {
    if (!file) return setMessage('Select a CSV file');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/users/import', { method: 'POST', body: form });
    const data = await res.json();
    setMessage(data.message + ' - created: ' + (data.createdCount || 0));
  };

  const download = () => {
    window.location.href = '/api/admin/users/export';
  };

  return (
    <div>
      <h3>Import / Export Users</h3>
      <div>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
        <button onClick={upload}>Upload CSV</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={download}>Download users.csv</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}
