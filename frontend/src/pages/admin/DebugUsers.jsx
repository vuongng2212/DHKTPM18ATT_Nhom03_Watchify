import React, { useState, useEffect } from 'react';
import { getUsersApi } from '../../services/api';

const DebugUsers = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    console.log('=== DEBUG USERS API TEST ===');
    console.log('Page:', page, 'Search:', search);
    
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await getUsersApi(page, 5, search);
      console.log('✅ API Success:', result);
      console.log('Response type:', typeof result);
      console.log('Response keys:', Object.keys(result || {}));
      console.log('Users array:', result?.users);
      console.log('Pagination:', result?.pagination);
      
      setResponse(result);
    } catch (err) {
      console.error('❌ API Error:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Debug Users API</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Page: 
            <input 
              type="number" 
              value={page} 
              onChange={(e) => setPage(Number(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Search: 
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter search term..."
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            />
          </label>
        </div>
        <button 
          onClick={fetchUsers}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>⏳ Loading...</h3>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: '#f8d7da', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>❌ Error</h3>
          <p><strong>Message:</strong> {error.message}</p>
          <p><strong>Status:</strong> {error.status}</p>
          <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(error.data, null, 2)}
          </pre>
        </div>
      )}

      {response && (
        <div style={{ padding: '20px', background: '#d4edda', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>✅ Success Response</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Summary</h4>
            <p>Total Users: {response.pagination?.totalUsers || 0}</p>
            <p>Current Page: {response.pagination?.currentPage + 1 || 1}</p>
            <p>Total Pages: {response.pagination?.totalPages || 1}</p>
            <p>Users in Response: {response.users?.length || 0}</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>Full Response</h4>
            <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          {response.users && response.users.length > 0 && (
            <div>
              <h4>Users Table</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead>
                  <tr style={{ background: '#007bff', color: 'white' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Full Name</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Locked</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {response.users.map((user, index) => (
                    <tr key={user.id || index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '11px' }}>
                        {user.id?.substring(0, 8)}...
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.email}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {user.fullName || user.tenNguoiDung || '-'}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{user.phone || user.sdt || '-'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          background: user.locked ? '#dc3545' : '#28a745',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {user.locked ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        {user.quyen?.tenQuyen || user.roles?.join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '20px', background: '#e7f3ff', borderRadius: '8px' }}>
        <h3>ℹ️ Instructions</h3>
        <ol>
          <li>Open browser console (F12) to see detailed logs</li>
          <li>Check the response structure above</li>
          <li>Verify users array is present</li>
          <li>Test pagination by changing page number</li>
          <li>Test search functionality</li>
        </ol>
        
        <h4 style={{ marginTop: '15px' }}>Expected Backend Response:</h4>
        <pre style={{ background: '#fff', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
{`{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "User Name",
      "tenNguoiDung": "User Name",
      "phone": "0123456789",
      "locked": false,
      "quyen": {
        "tenQuyen": "ADMIN"
      }
    }
  ],
  "pagination": {
    "currentPage": 0,
    "totalPages": 5,
    "totalUsers": 48,
    "hasNext": true,
    "hasPrevious": false
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default DebugUsers;