import React, { useEffect, useState } from 'react';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);

  const fetchTenants = async () => {
    const res = await fetch('/api/admin/tenants');
    if (res.ok) setTenants(await res.json());
  };

  useEffect(() => { fetchTenants(); }, []);

  return (
    <div>
      <h3>Tenants / Institutions</h3>
      <ul>
        {tenants.map(t => (
          <li key={t._id}>{t.name} - {t.type}</li>
        ))}
      </ul>
    </div>
  );
}
