import React, { useState, useEffect } from 'react';
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
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  
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

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchText, selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsersApi(currentPage, pageSize, searchText, selectedRole);
      
      if (response && response.users) {
        setUsers(response.users);
        setTotal(response.totalElements || 0);
        
        // Calculate statistics (if backend doesn't provide them)
        const allUsers = response.users;
        const adminCount = allUsers.filter(u => u.roles?.includes('ROLE_ADMIN')).length;
        const customerCount = allUsers.filter(u => !u.roles?.includes('ROLE_ADMIN')).length;
        const activeCount = allUsers.filter(u => !u.locked).length;
        const lockedCount = allUsers.filter(u => u.locked).length;
        
        setStats({
          total: response.totalElements || 0,
          admins: adminCount,
          customers: customerCount,
          active: activeCount,
          locked: lockedCount,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedUser(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedUser(record);
    
    form.setFieldsValue({
      firstName: record.firstName || '',
      lastName: record.lastName || '',
      email: record.email,
      phone: record.phone || '',
    });
    
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const updateData = {
        firstName: values.firstName?.trim() || null,
        lastName: values.lastName?.trim() || null,
        phone: values.phone?.trim() || null
      };
      
      await updateUserApi(selectedUser.id, updateData);
      
      message.success('Cập nhật thông tin thành công');
      setEditModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      
      let errorMessage = 'Không thể cập nhật thông tin';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      }
      
      message.error(errorMessage);
    }
  };

  const handleLockToggle = async (record) => {
    try {
      await toggleUserLockApi(record.id);
      
      const successMessage = record.locked ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công';
      message.success(successMessage);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling lock:', error);
      message.error('Không thể thay đổi trạng thái tài khoản');
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
              onSearch={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText('');
                  setCurrentPage(1);
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Vai trò"
              allowClear
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value);
                setCurrentPage(1);
              }}
            >
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
          dataSource={users}
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

      {/* Detail Modal */}
      <Modal
        title="Chi tiết người dùng"
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
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24} style={{ textAlign: 'center', marginBottom: 16 }}>
                <Avatar
                  size={100}
                  src={selectedUser.avatar}
                  icon={!selectedUser.avatar && <UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  {!selectedUser.avatar && selectedUser.fullName?.charAt(0).toUpperCase()}
                </Avatar>
              </Col>
              <Col span={12}>
                <p><strong>Họ và tên:</strong> {selectedUser.fullName}</p>
              </Col>
              <Col span={12}>
                <p><strong>Email:</strong> {selectedUser.email}</p>
              </Col>
              <Col span={12}>
                <p><strong>Số điện thoại:</strong> {selectedUser.phone || 'Chưa cập nhật'}</p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Vai trò:</strong>{' '}
                  {selectedUser.roles?.includes('ROLE_ADMIN') ? (
                    <Tag color="red">Admin</Tag>
                  ) : (
                    <Tag color="blue">Khách hàng</Tag>
                  )}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  {selectedUser.locked ? (
                    <Tag color="red" icon={<LockOutlined />}>Đã khóa</Tag>
                  ) : (
                    <Tag color="green" icon={<UnlockOutlined />}>Hoạt động</Tag>
                  )}
                </p>
              </Col>
              <Col span={12}>
                <p><strong>Ngày đăng ký:</strong> {selectedUser.createdAt && new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
          >
            <Input placeholder="Email" disabled />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersManagement;