import React, { useEffect, useState } from 'react';

export default function UsersList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', { headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div>
      <h3>Users</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Institution</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.institution?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
