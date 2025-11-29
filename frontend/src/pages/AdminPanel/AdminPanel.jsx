import React, { useState } from 'react';
import UsersList from './UsersList';
import Tenants from './Tenants';
import ImportExport from './ImportExport';
import BrandSettings from './BrandSettings';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>
      <nav style={{ marginBottom: 12 }}>
        <button onClick={() => setTab('users')}>Users</button>{' '}
        <button onClick={() => setTab('tenants')}>Tenants</button>{' '}
        <button onClick={() => setTab('import')}>Import/Export</button>{' '}
        <button onClick={() => setTab('brand')}>Brand Settings</button>
      </nav>

      <div>
        {tab === 'users' && <UsersList />}
        {tab === 'tenants' && <Tenants />}
        {tab === 'import' && <ImportExport />}
        {tab === 'brand' && <BrandSettings />}
      </div>
    </div>
  );
}
