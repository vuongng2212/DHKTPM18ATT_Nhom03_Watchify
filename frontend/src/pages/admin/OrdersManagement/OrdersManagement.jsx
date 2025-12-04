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
} from '@ant-design/icons';
import { getAllOrdersApi, updateOrderStatusApi } from '../../../services/api';
import { parseJavaDate, formatDate, formatTime, formatDateTime } from '../../../utils/dateUtils';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  
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

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, searchText, selectedStatus, selectedPaymentStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrdersApi(currentPage - 1, pageSize);
      
      if (response && response.orders) {
        setOrders(response.orders);
        setTotal(response.totalElements || response.orders.length);
        
        // Calculate statistics
        const allOrders = response.orders;
        const pendingCount = allOrders.filter(o => o.status === 'PENDING').length;
        const processingCount = allOrders.filter(o => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
        const shippingCount = allOrders.filter(o => o.status === 'SHIPPED').length;
        const deliveredCount = allOrders.filter(o => o.status === 'DELIVERED').length;
        const cancelledCount = allOrders.filter(o => o.status === 'CANCELLED').length;
        const revenue = allOrders
          .filter(o => o.status !== 'CANCELLED')
          .reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
        
        setStats({
          total: response.totalElements || allOrders.length,
          pending: pendingCount,
          processing: processingCount,
          shipped: shippingCount,
          delivered: deliveredCount,
          cancelled: cancelledCount,
          totalRevenue: revenue,
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
          order.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by payment status
    if (selectedPaymentStatus && selectedPaymentStatus !== 'all') {
      filtered = filtered.filter((order) => order.paymentStatus === selectedPaymentStatus);
    }

    setFilteredOrders(filtered);
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

  const handleUpdateStatusSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('=== Update Order Status ===');
      console.log('Order ID:', selectedOrder.id);
      console.log('Form values:', values);
      console.log('New status:', values.status);
      
      await updateOrderStatusApi(selectedOrder.id, values.status);
      
      message.success('Cập nhật trạng thái thành công');
      setUpdateStatusModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      console.error('=== Error Updating Order Status ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Không thể cập nhật trạng thái';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      }
      
      message.error(errorMessage);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'gold', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
      CONFIRMED: { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
      PROCESSING: { color: 'cyan', text: 'Đang xử lý', icon: <FileTextOutlined /> },
      SHIPPED: { color: 'purple', text: 'Đang giao hàng', icon: <ShoppingCartOutlined /> },
      DELIVERED: { color: 'green', text: 'Đã giao hàng', icon: <CheckCircleOutlined /> },
      CANCELLED: { color: 'red', text: 'Đã hủy', icon: <ClockCircleOutlined /> },
    };
    return configs[status] || { color: 'default', text: status, icon: null };
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      COD: 'Thanh toán khi nhận hàng',
      MOMO: 'Ví MoMo',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      CREDIT_CARD: 'Thẻ tín dụng',
    };
    return methods[method] || method;
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>{text}</span>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'fullName'],
      key: 'customer',
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (totalAmount) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(totalAmount || 0)}
        </span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 140,
      render: (method) => (
        <Tag color="blue">{getPaymentMethodText(method)}</Tag>
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date, record) => {
        const dateToUse = date || record.orderDate;
        if (!dateToUse) return <div style={{ fontSize: 12, color: '#999' }}>N/A</div>;
        
        const parsedDate = parseJavaDate(dateToUse);
        if (!parsedDate) return <div style={{ fontSize: 12, color: '#999' }}>N/A</div>;
        
        return (
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {formatDate(dateToUse)}
            </div>
            <div style={{ fontSize: 11, color: '#999' }}>
              {formatTime(dateToUse)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status !== 'DELIVERED' && record.status !== 'CANCELLED' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleUpdateStatus(record)}
            >
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý đơn hàng
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Theo dõi và quản lý tất cả đơn hàng
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Đang xử lý"
              value={stats.processing}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Đang giao"
              value={stats.shipped}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Đã giao"
              value={stats.delivered}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 18 }}
              formatter={(value) =>
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  notation: 'compact',
                }).format(value)
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Tìm theo mã đơn, tên hoặc email khách hàng..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái đơn"
              value={selectedStatus}
              onChange={setSelectedStatus}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPED">Đang giao hàng</Option>
              <Option value="DELIVERED">Đã giao hàng</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Phương thức"
              value={selectedPaymentStatus}
              onChange={setSelectedPaymentStatus}
            >
              <Option value="all">Tất cả phương thức</Option>
              <Option value="COD">COD</Option>
              <Option value="MOMO">MoMo</Option>
              <Option value="BANK_TRANSFER">Chuyển khoản</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
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
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <div>
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            Chi tiết đơn hàng
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <span style={{ fontWeight: 500, color: '#1890ff' }}>
                  {selectedOrder.orderNumber}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.user?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.user?.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(selectedOrder.createdAt || selectedOrder.orderDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.shippingAddress ? (
                  <>
                    {selectedOrder.shippingAddress.recipientName}<br />
                    {selectedOrder.shippingAddress.addressLine}<br />
                    {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                  </>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn hàng">
                <Tag color={getStatusConfig(selectedOrder.status).color}>
                  {getStatusConfig(selectedOrder.status).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {getPaymentMethodText(selectedOrder.paymentMethod)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Chi tiết sản phẩm</Divider>
            
            <Table
              size="small"
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'productName',
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
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right',
                  render: (unitPrice) =>
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(unitPrice || 0),
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'totalPrice',
                  key: 'totalPrice',
                  align: 'right',
                  render: (totalPrice) =>
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totalPrice || 0),
                },
              ]}
            />

            <Divider />
            
            <Row justify="end">
              <Col span={8}>
                <div style={{ marginBottom: 8 }}>
                  <Row justify="space-between">
                    <span>Tạm tính:</span>
                    <span style={{ fontWeight: 500 }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(
                        selectedOrder.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0
                      )}
                    </span>
                  </Row>
                </div>

                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Row justify="space-between">
                    <span style={{ fontSize: 16, fontWeight: 600 }}>Tổng cộng:</span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(selectedOrder.totalAmount || selectedOrder.total || 0)}
                    </span>
                  </Row>
                </div>
              </Col>
            </Row>

            {selectedOrder.notes && (
              <>
                <Divider>Ghi chú</Divider>
                <p style={{ fontStyle: 'italic', color: '#666' }}>
                  {selectedOrder.notes}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={updateStatusModalVisible}
        onOk={handleUpdateStatusSubmit}
        onCancel={() => setUpdateStatusModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái mới"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPED">Đang giao hàng</Option>
              <Option value="DELIVERED">Đã giao hàng</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersManagement;