import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Avatar,
  Switch,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  SearchOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { getUsersApi, updateProfileApi as updateUserApi, toggleUserLockApi } from '../../../services/api';

const { Search } = Input;
const { Option } = Select;

const UsersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    customers: 0,
    active: 0,
    locked: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching users with params:', { currentPage, pageSize, searchText });
      const response = await getUsersApi(currentPage, pageSize, searchText);
      console.log('Users API response:', response);
      
      if (response && response.users) {
        console.log('Users data:', response.users);
        setUsers(response.users);
        setTotal(response.totalElements || response.users.length);
        
        // Calculate statistics
        const allUsers = response.users;
        const adminCount = allUsers.filter(u => u.roles?.includes('ROLE_ADMIN')).length;
        const customerCount = allUsers.filter(u => !u.roles?.includes('ROLE_ADMIN')).length;
        const activeCount = allUsers.filter(u => !u.locked).length;
        const lockedCount = allUsers.filter(u => u.locked).length;
        
        setStats({
          total: response.totalElements || allUsers.length,
          admins: adminCount,
          customers: customerCount,
          active: activeCount,
          locked: lockedCount,
        });
      } else {
        console.warn('No users data in response:', response);
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response);
      message.error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText]);

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.phone?.includes(searchText)
      );
    }

    // Filter by role
    if (selectedRole && selectedRole !== 'all') {
      if (selectedRole === 'ROLE_ADMIN') {
        filtered = filtered.filter((user) => user.roles?.includes('ROLE_ADMIN'));
      } else if (selectedRole === 'ROLE_USER') {
        filtered = filtered.filter((user) => !user.roles?.includes('ROLE_ADMIN'));
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchText, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleViewDetail = (record) => {
    setSelectedUser(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedUser(record);
    form.setFieldsValue({
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      roles: record.roles,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('=== Update User Profile ===');
      console.log('User ID:', selectedUser.id);
      console.log('Form values:', values);
      console.log('Selected user:', selectedUser);
      
      // Prepare update data - only send fields that can be updated
      const updateData = {
        firstName: values.firstName || selectedUser.firstName,
        lastName: values.lastName || selectedUser.lastName,
        phone: values.phone || selectedUser.phone || null
      };
      
      console.log('Update data:', updateData);
      
      await updateUserApi(selectedUser.id, updateData);
      
      message.success('Cập nhật thông tin thành công');
      setEditModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('=== Error Updating User ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Không thể cập nhật thông tin';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).join(', ');
        }
      }
      
      message.error(errorMessage);
    }
  };

  const handleLockToggle = async (record) => {
    try {
      await toggleUserLockApi(record.id);
      message.success(record.locked ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling lock:', error);
      message.error(error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar, record) => (
        <Avatar
          size={48}
          src={avatar}
          icon={!avatar && <UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        >
          {!avatar && record.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.roles?.includes('ROLE_ADMIN') ? (
              <Tag color="red" style={{ marginTop: 4 }}>Admin</Tag>
            ) : (
              <Tag color="blue" style={{ marginTop: 4 }}>Khách hàng</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (email) => (
        <span>
          <MailOutlined style={{ marginRight: 8, color: '#999' }} />
          {email}
        </span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => (
        phone ? (
          <span>
            <PhoneOutlined style={{ marginRight: 8, color: '#999' }} />
            {phone}
          </span>
        ) : (
          <span style={{ color: '#999' }}>Chưa cập nhật</span>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'locked',
      key: 'locked',
      width: 120,
      align: 'center',
      render: (locked) =>
        locked ? (
          <Tag color="red" icon={<LockOutlined />}>
            Đã khóa
          </Tag>
        ) : (
          <Tag color="green" icon={<UnlockOutlined />}>
            Hoạt động
          </Tag>
        ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => date && new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title={`Bạn có chắc muốn ${record.locked ? 'mở khóa' : 'khóa'} tài khoản này?`}
            onConfirm={() => handleLockToggle(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              type="link"
              size="small"
              danger={!record.locked}
              icon={record.locked ? <UnlockOutlined /> : <LockOutlined />}
            >
              {record.locked ? 'Mở khóa' : 'Khóa'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý người dùng
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Quản lý tài khoản người dùng và phân quyền
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng người dùng"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Quản trị viên"
              value={stats.admins}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Khách hàng"
              value={stats.customers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tài khoản bị khóa"
              value={stats.locked}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={10}>
            <Search
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Vai trò"
              value={selectedRole}
              onChange={setSelectedRole}
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="ROLE_ADMIN">Quản trị viên</Option>
              <Option value="ROLE_USER">Khách hàng</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title={
          <div>
            <UserOutlined style={{ marginRight: 8 }} />
            Thông tin người dùng
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              src={selectedUser.avatar}
              icon={!selectedUser.avatar && <UserOutlined />}
              style={{ marginBottom: 24, backgroundColor: '#1890ff' }}
            >
              {!selectedUser.avatar && selectedUser.fullName?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Họ và tên:</strong>
                <div style={{ marginTop: 4 }}>{selectedUser.fullName}</div>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Email:</strong>
                <div style={{ marginTop: 4 }}>{selectedUser.email}</div>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Số điện thoại:</strong>
                <div style={{ marginTop: 4 }}>{selectedUser.phone || 'Chưa cập nhật'}</div>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Vai trò:</strong>
                <div style={{ marginTop: 4 }}>
                  {selectedUser.roles?.includes('ROLE_ADMIN') ? (
                    <Tag color="red">Quản trị viên</Tag>
                  ) : (
                    <Tag color="blue">Khách hàng</Tag>
                  )}
                </div>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Trạng thái:</strong>
                <div style={{ marginTop: 4 }}>
                  {selectedUser.locked ? (
                    <Tag color="red" icon={<LockOutlined />}>Đã khóa</Tag>
                  ) : (
                    <Tag color="green" icon={<UnlockOutlined />}>Hoạt động</Tag>
                  )}
                </div>
              </Col>
              <Col span={12} style={{ textAlign: 'left' }}>
                <strong>Ngày đăng ký:</strong>
                <div style={{ marginTop: 4 }}>
                  {selectedUser.createdAt && new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" disabled />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="roles"
            label="Vai trò"
          >
            <Select mode="multiple" placeholder="Chọn vai trò">
              <Option value="ROLE_USER">Khách hàng</Option>
              <Option value="ROLE_ADMIN">Quản trị viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersManagement;