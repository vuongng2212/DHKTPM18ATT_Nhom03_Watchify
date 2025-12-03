import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Table,
  Tag,
  Progress,
  Empty,
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { getAllOrdersApi } from '../../../services/api';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('month');

  // Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });

  // Chart data
  const [revenueChartData, setRevenueChartData] = useState({});
  const [orderStatusData, setOrderStatusData] = useState({});
  const [topProductsData, setTopProductsData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState({});

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRes = await getAllOrdersApi(0, 1000);

      const ordersData = ordersRes?.orders || [];

      // Calculate statistics
      calculateStatistics(ordersData);
      
      // Generate chart data
      generateRevenueChart(ordersData);
      generateOrderStatusChart(ordersData);
      generateTopProducts(ordersData);
      generatePaymentMethodChart(ordersData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const calculateStatistics = (ordersData) => {
    const totalRevenue = ordersData
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const totalOrders = ordersData.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = new Set(ordersData.map(o => o.user?.id)).size;

    // Calculate growth (mock data - would need previous period data)
    const revenueGrowth = 15.3;
    const orderGrowth = 8.7;

    setStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      revenueGrowth,
      orderGrowth,
    });
  };

  const generateRevenueChart = (ordersData) => {
    // Generate last 12 months data
    const months = [];
    const revenueByMonth = [];
    const ordersByMonth = [];

    for (let i = 11; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      months.push(date.format('MM/YYYY'));
      
      const monthRevenue = ordersData
        .filter(o => {
          const orderDate = dayjs(o.createdAt);
          return orderDate.month() === date.month() && 
                 orderDate.year() === date.year() &&
                 o.status !== 'CANCELLED';
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);
      
      const monthOrders = ordersData.filter(o => {
        const orderDate = dayjs(o.createdAt);
        return orderDate.month() === date.month() && 
               orderDate.year() === date.year();
      }).length;

      revenueByMonth.push(monthRevenue);
      ordersByMonth.push(monthOrders);
    }

    setRevenueChartData({
      labels: months,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: revenueByMonth,
          backgroundColor: 'rgba(24, 144, 255, 0.6)',
          borderColor: 'rgba(24, 144, 255, 1)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          label: 'Số đơn hàng',
          data: ordersByMonth,
          backgroundColor: 'rgba(82, 196, 26, 0.6)',
          borderColor: 'rgba(82, 196, 26, 1)',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1',
        },
      ],
    });
  };

  const generateOrderStatusChart = (ordersData) => {
    const statusCounts = ordersData.reduce((acc, order) => {
      const status = order.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusLabels = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };

    setOrderStatusData({
      labels: Object.keys(statusCounts).map(k => statusLabels[k] || k),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            '#faad14',
            '#1890ff',
            '#13c2c2',
            '#722ed1',
            '#52c41a',
            '#f5222d',
          ],
          borderWidth: 0,
        },
      ],
    });
  };

  const generateTopProducts = (ordersData) => {
    const productSales = {};

    ordersData.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.productId || item.product?.id;
        const productName = item.productName || item.product?.name || 'Unknown';
        
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }
        
        productSales[productId].quantity += item.quantity || 0;
        productSales[productId].revenue += (item.subtotal || item.price * item.quantity || 0);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    setTopProductsData(topProducts);
  };

  const generatePaymentMethodChart = (ordersData) => {
    const paymentCounts = ordersData.reduce((acc, order) => {
      const method = order.paymentMethod || 'UNKNOWN';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const methodLabels = {
      COD: 'COD',
      MOMO: 'MoMo',
      BANK_TRANSFER: 'Chuyển khoản',
      CREDIT_CARD: 'Thẻ tín dụng',
    };

    setPaymentMethodData({
      labels: Object.keys(paymentCounts).map(k => methodLabels[k] || k),
      datasets: [
        {
          data: Object.values(paymentCounts),
          backgroundColor: [
            '#1890ff',
            '#eb2f96',
            '#52c41a',
            '#faad14',
          ],
          borderWidth: 0,
        },
      ],
    });
  };

  const topProductsColumns = [
    {
      title: 'Xếp hạng',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (_, __, index) => (
        <div>
          {index < 3 ? (
            <TrophyOutlined
              style={{
                fontSize: 24,
                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
              }}
            />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 500 }}>#{index + 1}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center',
      render: (quantity) => <Tag color="blue">{quantity} SP</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 180,
      align: 'right',
      render: (revenue) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(revenue)}
        </span>
      ),
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

  const revenueChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('vi-VN', {
              notation: 'compact',
            }).format(value);
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Số đơn hàng',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
              Thống kê & Phân tích
            </h1>
            <p style={{ color: '#666', marginTop: 8 }}>
              Phân tích chi tiết doanh thu và hiệu suất kinh doanh
            </p>
          </Col>
          <Col>
            <Select
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 200 }}
            >
              <Option value="week">7 ngày qua</Option>
              <Option value="month">30 ngày qua</Option>
              <Option value="quarter">3 tháng qua</Option>
              <Option value="year">12 tháng qua</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              formatter={(value) =>
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  notation: 'compact',
                }).format(value)
              }
              suffix={
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span style={{ marginLeft: 4, color: '#52c41a' }}>
                    +{stats.revenueGrowth}%
                  </span>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 24 }}
              suffix={
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span style={{ marginLeft: 4, color: '#52c41a' }}>
                    +{stats.orderGrowth}%
                  </span>
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Giá trị đơn trung bình"
              value={stats.averageOrderValue}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
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
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Doanh thu & Đơn hàng theo thời gian"
            bordered={false}
            loading={loading}
          >
            <div style={{ height: 400 }}>
              {revenueChartData.labels ? (
                <Bar data={revenueChartData} options={revenueChartOptions} />
              ) : (
                <Empty description="Chưa có dữ liệu" />
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Trạng thái đơn hàng"
            bordered={false}
            loading={loading}
            style={{ marginBottom: 16 }}
          >
            <div style={{ height: 300 }}>
              {orderStatusData.labels ? (
                <Doughnut data={orderStatusData} options={chartOptions} />
              ) : (
                <Empty description="Chưa có dữ liệu" />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Products & Payment Methods */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyOutlined style={{ color: '#FFD700', fontSize: 20 }} />
                <span>Top 10 sản phẩm bán chạy</span>
              </div>
            }
            bordered={false}
            loading={loading}
          >
            <Table
              columns={topProductsColumns}
              dataSource={topProductsData}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Phương thức thanh toán"
            bordered={false}
            loading={loading}
          >
            <div style={{ height: 300 }}>
              {paymentMethodData.labels ? (
                <Pie data={paymentMethodData} options={chartOptions} />
              ) : (
                <Empty description="Chưa có dữ liệu" />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;