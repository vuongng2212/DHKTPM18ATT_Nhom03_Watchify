import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Rate,
  message,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  StarOutlined,
} from '@ant-design/icons';
import {
  getAllReviewsApi,
  approveReviewApi,
  rejectReviewApi,
} from '../../../services/api';

const { Search } = Input;
const { Option } = Select;

const ReviewsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchText, selectedStatus, selectedRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
      };

      if (searchText) {
        params.keyword = searchText;
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      if (selectedRating) {
        params.rating = selectedRating;
      }

      const response = await getAllReviewsApi(params);

      if (response && response.reviews) {
        setReviews(response.reviews);
        setTotal(response.totalElements || 0);

        // Calculate statistics
        setStats({
          total: response.totalElements || 0,
          approved: response.reviews.filter(r => r.status === 'APPROVED').length,
          pending: response.reviews.filter(r => r.status === 'PENDING').length,
          rejected: response.reviews.filter(r => r.status === 'REJECTED').length,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedReview(record);
    setDetailModalVisible(true);
  };

  const handleApprove = async (reviewId) => {
    try {
      await approveReviewApi(reviewId);
      message.success('Đã duyệt đánh giá thành công');
      setDetailModalVisible(false);
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      message.error('Không thể duyệt đánh giá');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await rejectReviewApi(reviewId);
      message.success('Đã từ chối đánh giá');
      setDetailModalVisible(false);
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      message.error('Không thể từ chối đánh giá');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'userFullName',
      key: 'userFullName',
      width: 150,
      render: (text) => <strong>{text || 'N/A'}</strong>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (rating) => <Rate disabled value={rating} style={{ fontSize: 16 }} />,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => {
        const statusConfig = {
          APPROVED: { color: 'success', text: 'Đã duyệt' },
          PENDING: { color: 'warning', text: 'Chờ duyệt' },
          REJECTED: { color: 'error', text: 'Đã từ chối' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date && new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                size="small"
                style={{ color: '#52c41a' }}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                size="small"
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý đánh giá
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Quản lý và kiểm duyệt đánh giá sản phẩm
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đánh giá"
              value={stats.total}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đã từ chối"
              value={stats.rejected}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={10}>
            <Search
              placeholder="Tìm theo tên người dùng, sản phẩm, nội dung..."
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
          <Col xs={12} sm={6} lg={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            >
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="REJECTED">Đã từ chối</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Số sao"
              allowClear
              value={selectedRating}
              onChange={(value) => {
                setSelectedRating(value);
                setCurrentPage(1);
              }}
            >
              <Option value={5}>5 sao</Option>
              <Option value={4}>4 sao</Option>
              <Option value={3}>3 sao</Option>
              <Option value={2}>2 sao</Option>
              <Option value={1}>1 sao</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Reviews Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đánh giá`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          selectedReview && selectedReview.status === 'PENDING' ? [
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(selectedReview.id)}
            >
              Từ chối
            </Button>,
            <Button
              key="approve"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(selectedReview.id)}
            >
              Duyệt
            </Button>,
          ] : [
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]
        }
        width={700}
      >
        {selectedReview && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <p><strong>Người dùng:</strong> {selectedReview.userFullName || 'N/A'}</p>
              </Col>
              <Col span={12}>
                <p><strong>Sản phẩm:</strong> {selectedReview.productName || 'N/A'}</p>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <p>
                  <strong>Đánh giá:</strong>{' '}
                  <Rate disabled value={selectedReview.rating} style={{ fontSize: 16 }} />
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  <Tag color={
                    selectedReview.status === 'APPROVED' ? 'success' :
                    selectedReview.status === 'PENDING' ? 'warning' : 'error'
                  }>
                    {selectedReview.status === 'APPROVED' ? 'Đã duyệt' :
                     selectedReview.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                  </Tag>
                </p>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <p><strong>Tiêu đề:</strong></p>
                <p>{selectedReview.title}</p>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <p><strong>Nội dung:</strong></p>
                <p>{selectedReview.content}</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Ngày tạo:</strong> {selectedReview.createdAt && new Date(selectedReview.createdAt).toLocaleString('vi-VN')}</p>
              </Col>
              <Col span={12}>
                <p><strong>Hữu ích:</strong> {selectedReview.helpfulCount || 0} lượt</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewsManagement;