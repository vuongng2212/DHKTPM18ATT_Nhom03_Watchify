import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card, message, Space, Descriptions, Tag } from 'antd';
import { getUsersApi, updateProfileApi, lockUserApi, unlockUserApi, toggleUserLockApi } from '../../services/api';

const { Option } = Select;

const TestUserActions = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Edit form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [testResults, setTestResults] = useState([]);

  const addResult = (type, title, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [{
      type,
      title,
      data,
      timestamp,
      id: Date.now()
    }, ...prev]);
  };

  const fetchUsers = async () => {
    console.log('=== FETCHING USERS ===');
    setLoading(true);
    try {
      const response = await getUsersApi(1, 10, '');
      console.log('✅ Users fetched:', response);
      
      if (response && response.users) {
        setUsers(response.users);
        addResult('success', 'Fetch Users', `Found ${response.users.length} users`);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      addResult('error', 'Fetch Users Failed', error.message);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      setSelectedUser(user);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      addResult('info', 'User Selected', `Selected: ${user.email}`);
    }
  };

  const testUpdateUser = async () => {
    if (!selectedUserId) {
      message.warning('Please select a user first');
      return;
    }

    console.log('=== TEST UPDATE USER ===');
    console.log('User ID:', selectedUserId);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    console.log('Phone:', phone);

    setLoading(true);
    try {
      const updateData = {
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null
      };

      console.log('📤 Sending update data:', updateData);
      console.log('📍 Endpoint: PUT /api/v1/users/' + selectedUserId);

      const response = await updateProfileApi(selectedUserId, updateData);
      
      console.log('✅ Update successful:', response);
      addResult('success', 'Update User', JSON.stringify(updateData, null, 2));
      message.success('User updated successfully!');
      
      fetchUsers();
    } catch (error) {
      console.error('❌ Update failed:', error);
      console.error('Error response:', error.response);
      
      const errorMsg = error.response?.data?.message || error.message;
      addResult('error', 'Update User Failed', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testLockUser = async () => {
    if (!selectedUserId) {
      message.warning('Please select a user first');
      return;
    }

    console.log('=== TEST LOCK USER ===');
    console.log('User ID:', selectedUserId);
    console.log('📍 Endpoint: PUT /api/v1/users/' + selectedUserId + '/lock');

    setLoading(true);
    try {
      await lockUserApi(selectedUserId);
      console.log('✅ Lock successful');
      addResult('success', 'Lock User', `User ${selectedUserId} locked`);
      message.success('User locked successfully!');
      fetchUsers();
    } catch (error) {
      console.error('❌ Lock failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      addResult('error', 'Lock User Failed', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testUnlockUser = async () => {
    if (!selectedUserId) {
      message.warning('Please select a user first');
      return;
    }

    console.log('=== TEST UNLOCK USER ===');
    console.log('User ID:', selectedUserId);
    console.log('📍 Endpoint: PUT /api/v1/users/' + selectedUserId + '/unlock');

    setLoading(true);
    try {
      await unlockUserApi(selectedUserId);
      console.log('✅ Unlock successful');
      addResult('success', 'Unlock User', `User ${selectedUserId} unlocked`);
      message.success('User unlocked successfully!');
      fetchUsers();
    } catch (error) {
      console.error('❌ Unlock failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      addResult('error', 'Unlock User Failed', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testToggleLock = async () => {
    if (!selectedUserId) {
      message.warning('Please select a user first');
      return;
    }

    console.log('=== TEST TOGGLE LOCK ===');
    console.log('User ID:', selectedUserId);
    console.log('Current status:', selectedUser?.locked ? 'LOCKED' : 'UNLOCKED');
    console.log('📍 Endpoint: PUT /api/v1/users/' + selectedUserId + '/toggle-lock');

    setLoading(true);
    try {
      const response = await toggleUserLockApi(selectedUserId);
      console.log('✅ Toggle successful:', response);
      addResult('success', 'Toggle Lock', `User ${selectedUserId} toggled to ${response.locked ? 'LOCKED' : 'UNLOCKED'}`);
      message.success('User lock status toggled successfully!');
      fetchUsers();
    } catch (error) {
      console.error('❌ Toggle failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      addResult('error', 'Toggle Lock Failed', errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails();
    }
  }, [selectedUserId]);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>🧪 Test User Edit/Lock Actions</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column - Controls */}
        <div>
          <Card title="1️⃣ Select User" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a user to test"
                value={selectedUserId}
                onChange={setSelectedUserId}
                loading={loading}
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.email} - {user.fullName || 'No name'} 
                    {user.locked && <Tag color="red" style={{ marginLeft: 8 }}>LOCKED</Tag>}
                  </Option>
                ))}
              </Select>
              <Button onClick={fetchUsers} loading={loading} block>
                🔄 Refresh Users List
              </Button>
            </Space>
          </Card>

          {selectedUser && (
            <Card title="📋 Current User Info" style={{ marginBottom: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID">
                  <code style={{ fontSize: '11px' }}>{selectedUser.id}</code>
                </Descriptions.Item>
                <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
                <Descriptions.Item label="Full Name">{selectedUser.fullName || '-'}</Descriptions.Item>
                <Descriptions.Item label="First Name">{selectedUser.firstName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{selectedUser.lastName || '-'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedUser.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Locked">
                  <Tag color={selectedUser.locked ? 'red' : 'green'}>
                    {selectedUser.locked ? 'YES' : 'NO'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Roles">
                  {selectedUser.roles?.join(', ') || selectedUser.quyen?.tenQuyen || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Card title="2️⃣ Test Update User" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>First Name:</label>
                <Input
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!selectedUserId}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Last Name:</label>
                <Input
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!selectedUserId}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Phone:</label>
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!selectedUserId}
                />
              </div>
              <Button
                type="primary"
                onClick={testUpdateUser}
                loading={loading}
                disabled={!selectedUserId}
                block
              >
                📝 Test Update User
              </Button>
            </Space>
          </Card>

          <Card title="3️⃣ Test Lock/Unlock" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                danger
                onClick={testLockUser}
                loading={loading}
                disabled={!selectedUserId}
                block
              >
                🔒 Test Lock User
              </Button>
              <Button
                onClick={testUnlockUser}
                loading={loading}
                disabled={!selectedUserId}
                block
                style={{ background: '#52c41a', color: 'white' }}
              >
                🔓 Test Unlock User
              </Button>
              <Button
                onClick={testToggleLock}
                loading={loading}
                disabled={!selectedUserId}
                block
                type="primary"
              >
                🔄 Test Toggle Lock (Recommended)
              </Button>
            </Space>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div>
          <Card 
            title="📊 Test Results" 
            extra={
              <Button size="small" onClick={() => setTestResults([])}>
                Clear
              </Button>
            }
          >
            <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
              {testResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No test results yet. Run a test to see results here.
                </div>
              ) : (
                testResults.map(result => (
                  <div
                    key={result.id}
                    style={{
                      padding: '12px',
                      marginBottom: '12px',
                      borderRadius: '6px',
                      background: result.type === 'success' ? '#f6ffed' : 
                                 result.type === 'error' ? '#fff2f0' : 
                                 '#e6f7ff',
                      border: `1px solid ${
                        result.type === 'success' ? '#b7eb8f' : 
                        result.type === 'error' ? '#ffccc7' : 
                        '#91d5ff'
                      }`
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <strong style={{ 
                        color: result.type === 'success' ? '#52c41a' : 
                               result.type === 'error' ? '#ff4d4f' : 
                               '#1890ff'
                      }}>
                        {result.type === 'success' ? '✅' : 
                         result.type === 'error' ? '❌' : 
                         'ℹ️'} {result.title}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        {result.timestamp}
                      </span>
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '8px',
                      background: 'rgba(0,0,0,0.02)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="ℹ️ Instructions" style={{ marginTop: '16px' }}>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li>Select a user from the dropdown</li>
              <li>View current user information</li>
              <li>Test Update: Change first/last name or phone, then click "Test Update User"</li>
              <li>Test Lock: Click lock/unlock/toggle buttons</li>
              <li>Check test results on the right side</li>
              <li>Open browser console (F12) for detailed logs</li>
            </ol>

            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#fff7e6',
              borderRadius: '6px',
              border: '1px solid #ffd591'
            }}>
              <strong>⚠️ Expected Endpoints:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li><code>PUT /api/v1/users/{'{userId}'}</code> - Update user</li>
                <li><code>PUT /api/v1/users/{'{userId}'}/lock</code> - Lock user</li>
                <li><code>PUT /api/v1/users/{'{userId}'}/unlock</code> - Unlock user</li>
                <li><code>PUT /api/v1/users/{'{userId}'}/toggle-lock</code> - Toggle lock</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestUserActions;