import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { getProductsApi, getAllOrdersApi } from '../../../services/api';
import { parseJavaDate, formatDateTime } from '../../../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState({});
  const [revenueData, setRevenueData] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await getProductsApi({ page: 0, size: 100 });
      const totalProducts = productsRes?.totalElements || 0;

      // Fetch orders
      const ordersRes = await getAllOrdersApi(0, 100);
      const orders = ordersRes?.orders || [];
      const totalOrders = ordersRes?.totalElements || orders.length || 0;

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);

      // Get unique customers
      const uniqueCustomers = new Set(orders.map(order => order.user?.id)).size;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers,
      });

      // Recent orders (top 5)
      setRecentOrders(orders.slice(0, 5));

      // Order status statistics
      const statusCounts = orders.reduce((acc, order) => {
        const status = order.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setOrderStatusData({
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: [
              '#1890ff',
              '#52c41a',
              '#faad14',
              '#f5222d',
              '#722ed1',
            ],
            borderWidth: 0,
          },
        ],
      });

      // Revenue by month (mock data - you can enhance this)
      setRevenueData({
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: [
              5000000, 7000000, 6500000, 8000000, 9500000, 11000000,
              10500000, 12000000, 13500000, 14000000, 15500000, 17000000,
            ],
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'fullName'],
      key: 'customer',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          PENDING: { color: 'gold', text: 'Chờ xử lý' },
          CONFIRMED: { color: 'blue', text: 'Đã xác nhận' },
          PROCESSING: { color: 'cyan', text: 'Đang xử lý' },
          SHIPPING: { color: 'purple', text: 'Đang giao' },
          DELIVERED: { color: 'green', text: 'Đã giao' },
          CANCELLED: { color: 'red', text: 'Đã hủy' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date, record) => {
        const dateToUse = date || record.orderDate;
        if (!dateToUse) return 'N/A';
        
        const parsedDate = parseJavaDate(dateToUse);
        if (!parsedDate) return 'N/A';
        
        return formatDateTime(dateToUse);
      },
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(value);
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Tổng quan hệ thống
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Thống kê tổng quan về hoạt động kinh doanh
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <RiseOutlined /> 12%
                  </span>
                }
              />
            </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <RiseOutlined /> 8%
                  </span>
                }
              />
            </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Doanh thu"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#faad14' }}
                formatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                  }).format(value)
                }
                suffix={
                  <span style={{ fontSize: 14, color: '#52c41a' }}>
                    <RiseOutlined /> 15%
                  </span>
                }
              />
            </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fff' }}>
              <Statistic
                title="Khách hàng"
                value={stats.totalCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
                suffix={
                  <span style={{ fontSize: 14, color: '#f5222d' }}>
                    <FallOutlined /> 2%
                  </span>
                }
              />
            </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
              title="Doanh thu theo tháng"
              bordered={false}
              style={{ background: '#fff' }}
            >
              <div style={{ height: 300 }}>
                <Bar data={revenueData} options={barChartOptions} />
              </div>
            </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
              title="Trạng thái đơn hàng"
              bordered={false}
              style={{ background: '#fff' }}
            >
              <div style={{ height: 300 }}>
                <Doughnut data={orderStatusData} options={chartOptions} />
              </div>
            </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card
          title="Đơn hàng gần đây"
          bordered={false}
          style={{ background: '#fff' }}
        >
          <Table
            columns={orderColumns}
            dataSource={recentOrders}
            rowKey="id"
            pagination={false}
            scroll={{ x: 768 }}
          />
        </Card>
    </div>
  );
};

export default Overview;