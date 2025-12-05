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
  Row,
  Col,
  Statistic,
  Descriptions,
  Timeline,
  Divider,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { getAllOrdersApi, updateOrderStatusApi } from '../../../services/api';
import { parseJavaDate, formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // ============================================
  // MAIN CHANGE: Fetch orders with server-side filtering
  // ============================================
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Build params object
      const params = {
        page: currentPage - 1, // Backend uses 0-based index
        size: pageSize,
        sortBy: 'orderDate',
        sortDirection: 'desc',
      };
      
      // Add optional filters
      if (searchText && searchText.trim()) {
        params.keyword = searchText.trim();
      }
      
      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (selectedPaymentMethod && selectedPaymentMethod !== 'all') {
        params.paymentMethod = selectedPaymentMethod;
      }
      
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.fromDate = dateRange[0].format('YYYY-MM-DD');
        params.toDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      console.log('🔍 Fetching orders with params:', params);
      
      // Call API with filters
      const response = await getAllOrdersApi(params);
      
      if (response && response.orders) {
        setOrders(response.orders);
        setTotal(response.totalElements || 0);
        
        // Calculate statistics (for display only, based on current page)
        calculateStats(response.orders);
      } else {
        setOrders([]);
        setTotal(0);
        setStats({
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalRevenue: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from current page data
  const calculateStats = (ordersList) => {
    const pendingCount = ordersList.filter(o => o.status === 'PENDING').length;
    const processingCount = ordersList.filter(o => 
      o.status === 'PROCESSING' || o.status === 'CONFIRMED'
    ).length;
    const shippedCount = ordersList.filter(o => o.status === 'SHIPPED').length;
    const deliveredCount = ordersList.filter(o => o.status === 'DELIVERED').length;
    const cancelledCount = ordersList.filter(o => o.status === 'CANCELLED').length;
    const revenue = ordersList
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    
    setStats({
      total: ordersList.length,
      pending: pendingCount,
      processing: processingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
      totalRevenue: revenue,
    });
  };

  // ============================================
  // useEffect: Trigger fetch when filters change
  // ============================================
  
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage, 
    pageSize, 
    searchText, 
    selectedStatus, 
    selectedPaymentMethod, 
    dateRange
  ]);

  // ============================================
  // Event Handlers
  // ============================================
  
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (value) => {
    setSelectedPaymentMethod(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedStatus('all');
    setSelectedPaymentMethod('all');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handleViewDetail = (record) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  const handleUpdateStatus = (record) => {
    setSelectedOrder(record);
    form.setFieldsValue({
      status: record.status,
    });
    setUpdateStatusModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const values = await form.validateFields();
      await updateOrderStatusApi(selectedOrder.id, values.status);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      setUpdateStatusModalVisible(false);
      fetchOrders(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.errorFields) {
        return; // Validation error
      }
      message.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = {
      'PENDING': 'warning',
      'CONFIRMED': 'processing',
      'PROCESSING': 'processing',
      'SHIPPED': 'blue',
      'DELIVERED': 'success',
      'CANCELLED': 'error',
    };
    return statusConfig[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusText = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPED': 'Đang giao',
      'DELIVERED': 'Đã giao',
      'CANCELLED': 'Đã hủy',
    };
    return statusText[status] || status;
  };

  const getPaymentMethodColor = (method) => {
    const methodConfig = {
      'COD': 'orange',
      'VNPAY': 'blue',
      'MOMO': 'pink',
    };
    return methodConfig[method] || 'default';
  };

  const getPaymentMethodText = (method) => {
    const methodText = {
      'COD': 'COD',
      'VNPAY': 'VNPay',
      'MOMO': 'MoMo',
    };
    return methodText[method] || method;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // ============================================
  // Table Columns
  // ============================================
  
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          #{id?.toString().slice(0, 8)}...
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => {
        const user = record.user;
        const guestName = record.guestName;
        const guestEmail = record.guestEmail;
        
        if (user) {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {user.email}
              </div>
            </div>
          );
        } else if (guestName) {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>{guestName}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {guestEmail || 'Khách vãng lai'}
              </div>
            </div>
          );
        } else {
          return <span style={{ color: '#999' }}>N/A</span>;
        }
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 150,
      render: (date) => formatDate(parseJavaDate(date)),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      align: 'center',
      render: (method) => (
        <Tag color={getPaymentMethodColor(method)}>
          {getPaymentMethodText(method)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
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
            onClick={() => handleUpdateStatus(record)}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  // ============================================
  // Render
  // ============================================
  
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý đơn hàng
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Quản lý và theo dõi tất cả đơn hàng
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đã giao"
              value={stats.delivered}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Doanh thu (trang này)"
              value={stats.totalRevenue}
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Tìm theo mã đơn, tên KH, email..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="PENDING">Chờ xử lý</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPED">Đang giao</Option>
              <Option value="DELIVERED">Đã giao</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Thanh toán"
              value={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <Option value="all">Tất cả</Option>
              <Option value="COD">COD</Option>
              <Option value="VNPAY">VNPay</Option>
              <Option value="MOMO">MoMo</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>
          <Col xs={24} sm={12} lg={2}>
            <Button
              block
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đơn hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{selectedOrder.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.user 
                  ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}`
                  : selectedOrder.guestName || 'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email || selectedOrder.guestEmail || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {formatDateTime(parseJavaDate(selectedOrder.orderDate))}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                <Tag color={getPaymentMethodColor(selectedOrder.paymentMethod)}>
                  {getPaymentMethodText(selectedOrder.paymentMethod)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <span style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.shippingAddress || 'N/A'}
              </Descriptions.Item>
              {selectedOrder.notes && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Sản phẩm</Divider>
            
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <Table
                dataSource={selectedOrder.items}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: ['product', 'name'],
                    key: 'productName',
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center',
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'price',
                    key: 'price',
                    align: 'right',
                    render: (price) => formatCurrency(price),
                  },
                  {
                    title: 'Thành tiền',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    align: 'right',
                    render: (total) => (
                      <span style={{ fontWeight: 600 }}>
                        {formatCurrency(total)}
                      </span>
                    ),
                  },
                ]}
              />
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>
                Không có sản phẩm
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={updateStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setUpdateStatusModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="PENDING">Chờ xử lý</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPED">Đang giao</Option>
              <Option value="DELIVERED">Đã giao</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersManagement;