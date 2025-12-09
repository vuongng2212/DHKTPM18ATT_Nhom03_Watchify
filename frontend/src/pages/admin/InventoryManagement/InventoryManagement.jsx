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
  InputNumber,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Select,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import inventoryApi from '../../../services/inventoryApi';

const { Search } = Input;
const { Option } = Select;

const InventoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
  });
  
  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isReduceModalVisible, setIsReduceModalVisible] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [addForm] = Form.useForm();
  const [reduceForm] = Form.useForm();

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, statusFilter, inventories]);

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAllInventories();
      
      // Parse createdAt and updatedAt from array format [year, month, day, hour, min, sec, nano]
      const parsedInventories = (data || []).map(inventory => ({
        ...inventory,
        createdAt: Array.isArray(inventory.createdAt) 
          ? new Date(
              inventory.createdAt[0], // year
              inventory.createdAt[1] - 1, // month (0-indexed)
              inventory.createdAt[2], // day
              inventory.createdAt[3] || 0, // hour
              inventory.createdAt[4] || 0, // minute
              inventory.createdAt[5] || 0, // second
            )
          : new Date(inventory.createdAt),
        updatedAt: Array.isArray(inventory.updatedAt) 
          ? new Date(
              inventory.updatedAt[0], // year
              inventory.updatedAt[1] - 1, // month (0-indexed)
              inventory.updatedAt[2], // day
              inventory.updatedAt[3] || 0, // hour
              inventory.updatedAt[4] || 0, // minute
              inventory.updatedAt[5] || 0, // second
            )
          : new Date(inventory.updatedAt)
      }));
      
      setInventories(parsedInventories);
      calculateStatistics(parsedInventories);
      message.success('Đã tải danh sách tồn kho thành công');
    } catch (error) {
      message.error('Không thể tải danh sách tồn kho: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data) => {
    const totalProducts = data.length;
    const outOfStock = data.filter(item => item.availableQuantity === 0).length;
    const lowStock = data.filter(item => item.availableQuantity > 0 && item.availableQuantity < 10).length;
    
    setStats({
      totalProducts,
      outOfStock,
      lowStock,
      totalValue: 0, // Would need product price data
    });
  };

  const filterInventories = () => {
    let filtered = [...inventories];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (statusFilter === 'out-of-stock') return item.availableQuantity === 0;
        if (statusFilter === 'low-stock') return item.availableQuantity > 0 && item.availableQuantity < 10;
        if (statusFilter === 'in-stock') return item.availableQuantity >= 10;
        return true;
      });
    }

    setFilteredInventories(filtered);
  };

  const handleAddQuantity = (record) => {
    setSelectedInventory(record);
    addForm.resetFields();
    setIsAddModalVisible(true);
  };

  const handleReduceQuantity = (record) => {
    setSelectedInventory(record);
    reduceForm.resetFields();
    setIsReduceModalVisible(true);
  };

  const onAddSubmit = async (values) => {
    try {
      setLoading(true);
      await inventoryApi.addQuantity(selectedInventory.productId, values.quantity);
      message.success(`Đã thêm ${values.quantity} sản phẩm vào kho`);
      setIsAddModalVisible(false);
      addForm.resetFields();
      fetchInventories();
    } catch (error) {
      message.error('Không thể thêm số lượng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onReduceSubmit = async (values) => {
    try {
      setLoading(true);
      await inventoryApi.reduceQuantity(selectedInventory.productId, values.quantity);
      message.success(`Đã giảm ${values.quantity} sản phẩm trong kho`);
      setIsReduceModalVisible(false);
      reduceForm.resetFields();
      fetchInventories();
    } catch (error) {
      message.error('Không thể giảm số lượng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (availableQuantity) => {
    if (availableQuantity === 0) {
      return <Tag icon={<CloseCircleOutlined />} color="error">Hết hàng</Tag>;
    } else if (availableQuantity < 10) {
      return <Tag icon={<WarningOutlined />} color="warning">Sắp hết</Tag>;
    } else {
      return <Tag icon={<CheckCircleOutlined />} color="success">Còn hàng</Tag>;
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 250,
      fixed: 'left',
      render: (text) => <strong>{text || 'N/A'}</strong>,
    },
    {
      title: 'Tổng số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center',
      render: (quantity) => <Badge count={quantity} showZero style={{ backgroundColor: '#1890ff' }} />,
    },
    {
      title: 'Đã đặt trước',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 120,
      align: 'center',
      render: (reserved) => <Badge count={reserved} showZero style={{ backgroundColor: '#faad14' }} />,
    },
    {
      title: 'Còn lại',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 120,
      align: 'center',
      render: (available) => (
        <Badge 
          count={available} 
          showZero 
          style={{ backgroundColor: available === 0 ? '#ff4d4f' : available < 10 ? '#faad14' : '#52c41a' }} 
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => getStatusTag(record.availableQuantity),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      render: (location) => location || <Tag>Chưa xác định</Tag>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date) => date ? date.toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Nhập hàng">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={() => handleAddQuantity(record)}
            >
              Nhập
            </Button>
          </Tooltip>
          <Tooltip title="Xuất hàng">
            <Button
              danger
              icon={<MinusOutlined />}
              size="small"
              onClick={() => handleReduceQuantity(record)}
              disabled={record.availableQuantity === 0}
            >
              Xuất
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 600 }}>
        📦 Quản lý tồn kho
      </h1>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={stats.totalValue}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm sản phẩm, vị trí..."
              allowClear
              enterButton={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả</Option>
              <Option value="in-stock">Còn hàng</Option>
              <Option value="low-stock">Sắp hết</Option>
              <Option value="out-of-stock">Hết hàng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchInventories}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredInventories}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* Add Quantity Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <span>Nhập hàng - {selectedInventory?.productName}</span>
          </Space>
        }
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          addForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onAddSubmit}
        >
          <Form.Item
            label="Số lượng nhập vào"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              min={1}
              addonAfter="sản phẩm"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsAddModalVisible(false);
                addForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                Nhập hàng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reduce Quantity Modal */}
      <Modal
        title={
          <Space>
            <MinusOutlined style={{ color: '#ff4d4f' }} />
            <span>Xuất hàng - {selectedInventory?.productName}</span>
          </Space>
        }
        open={isReduceModalVisible}
        onCancel={() => {
          setIsReduceModalVisible(false);
          reduceForm.resetFields();
        }}
        footer={null}
      >
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f0f0', borderRadius: '4px' }}>
          <p style={{ margin: 0 }}>
            <strong>Tồn kho hiện tại:</strong> {selectedInventory?.quantity || 0} sản phẩm
          </p>
          <p style={{ margin: '4px 0 0 0' }}>
            <strong>Có thể xuất:</strong> {selectedInventory?.availableQuantity || 0} sản phẩm
          </p>
        </div>

        <Form
          form={reduceForm}
          layout="vertical"
          onFinish={onReduceSubmit}
        >
          <Form.Item
            label="Số lượng xuất ra"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
              {
                validator: (_, value) => {
                  if (value && value > (selectedInventory?.availableQuantity || 0)) {
                    return Promise.reject(new Error(`Số lượng không được vượt quá ${selectedInventory?.availableQuantity}`));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số lượng"
              min={1}
              max={selectedInventory?.availableQuantity || 0}
              addonAfter="sản phẩm"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsReduceModalVisible(false);
                reduceForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button danger htmlType="submit" loading={loading} icon={<MinusOutlined />}>
                Xuất hàng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;