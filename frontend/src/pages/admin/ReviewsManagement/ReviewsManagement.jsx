import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Rate,
  message,
  Card,
  Typography,
  Spin,
  Select,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllReviewsApi,
  approveReviewApi,
  rejectReviewApi,
} from "../../../services/api";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getAllReviewsApi();
      console.log("📊 Reviews fetched:", response);
      
      // Parse createdAt from array format [year, month, day, hour, min, sec, nano]
      const parsedReviews = (response || []).map(review => ({
        ...review,
        createdAt: Array.isArray(review.createdAt) 
          ? new Date(
              review.createdAt[0], // year
              review.createdAt[1] - 1, // month (0-indexed)
              review.createdAt[2], // day
              review.createdAt[3] || 0, // hour
              review.createdAt[4] || 0, // minute
              review.createdAt[5] || 0, // second
            )
          : new Date(review.createdAt)
      }));
      
      console.log("✅ Parsed reviews:", parsedReviews);
      setReviews(parsedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      message.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    Modal.confirm({
      title: "Xác nhận duyệt đánh giá",
      content: "Bạn có chắc chắn muốn duyệt đánh giá này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        try {
          await approveReviewApi(reviewId);
          message.success("Đã duyệt đánh giá thành công");
          fetchReviews();
          setDetailModalVisible(false);
        } catch (error) {
          console.error("Error approving review:", error);
          message.error(
            error.response?.data?.message || "Không thể duyệt đánh giá"
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = async (reviewId) => {
    Modal.confirm({
      title: "Xác nhận từ chối đánh giá",
      content: "Bạn có chắc chắn muốn từ chối đánh giá này?",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        try {
          await rejectReviewApi(reviewId);
          message.success("Đã ẩn đánh giá");
          fetchReviews();
          setDetailModalVisible(false);
        } catch (error) {
          console.error("Error rejecting review:", error);
          message.error(
            error.response?.data?.message || "Không thể ẩn đánh giá"
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDelete = async (reviewId) => {
    Modal.confirm({
      title: "Xác nhận xóa đánh giá",
      content: "Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        setActionLoading(true);
        try {
          await rejectReviewApi(reviewId);
          message.success("Đã xóa đánh giá");
          fetchReviews();
          setDetailModalVisible(false);
        } catch (error) {
          console.error("Error deleting review:", error);
          message.error(
            error.response?.data?.message || "Không thể xóa đánh giá"
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const showDetailModal = (review) => {
    setSelectedReview(review);
    setDetailModalVisible(true);
  };

  const filteredReviews = reviews.filter((review) => {
    if (statusFilter === "ALL") return true;
    return review.status === statusFilter;
  });

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (productId) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {productId}
        </Text>
      ),
    },
    {
      title: "Người đánh giá",
      dataIndex: "userFullName",
      key: "userFullName",
      render: (name) => <Text strong>{name || "Không rõ"}</Text>,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      render: (rating) => <Rate disabled value={rating} />,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (title) => <Text>{title}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const statusConfig = {
          PENDING: { color: "warning", text: "Chờ duyệt" },
          APPROVED: { color: "success", text: "Đã duyệt" },
          REJECTED: { color: "error", text: "Đã từ chối" },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      fixed: "right",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
          >
            Xem
          </Button>
          {record.status === "PENDING" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleApprove(record.id)}
              loading={actionLoading}
            >
              Duyệt
            </Button>
          )}
          {record.status === "APPROVED" && (
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              onClick={() => handleReject(record.id)}
              loading={actionLoading}
            >
              Ẩn
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            loading={actionLoading}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Title level={3}>Quản lý đánh giá sản phẩm</Title>
              <Text type="secondary">
                Tổng {filteredReviews.length} đánh giá
              </Text>
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
            >
              <Option value="ALL">Tất cả</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="REJECTED">Đã ẩn</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredReviews}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đánh giá`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedReview?.status === "APPROVED" ? (
            <Button
              key="hide"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(selectedReview?.id)}
              loading={actionLoading}
            >
              Ẩn đánh giá
            </Button>
          ) : selectedReview?.status === "PENDING" ? (
            <Button
              key="approve"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(selectedReview?.id)}
              loading={actionLoading}
            >
              Duyệt
            </Button>
          ) : null,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(selectedReview?.id)}
            loading={actionLoading}
          >
            Xóa
          </Button>,
        ]}
        width={700}
      >
        {selectedReview ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Sản phẩm ID: </Text>
              <Text copyable>{selectedReview.productId}</Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Người đánh giá: </Text>
              <Text>{selectedReview.userFullName || "Không rõ"}</Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Đánh giá: </Text>
              <Rate disabled value={selectedReview.rating} />
              <Text style={{ marginLeft: 8 }}>
                ({selectedReview.rating}/5)
              </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Tiêu đề: </Text>
              <Paragraph style={{ marginTop: 8 }}>
                {selectedReview.title}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Nội dung: </Text>
              <Paragraph style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                {selectedReview.content}
              </Paragraph>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Trạng thái: </Text>
              <Tag
                color={
                  selectedReview.status === "PENDING"
                    ? "warning"
                    : selectedReview.status === "APPROVED"
                    ? "success"
                    : "error"
                }
              >
                {selectedReview.status === "PENDING"
                  ? "Chờ duyệt"
                  : selectedReview.status === "APPROVED"
                  ? "Đã duyệt"
                  : "Đã từ chối"}
              </Tag>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Ngày tạo: </Text>
              <Text>
                {new Date(selectedReview.createdAt).toLocaleString("vi-VN")}
              </Text>
            </div>

            {selectedReview.updatedAt && (
              <div>
                <Text strong>Cập nhật lần cuối: </Text>
                <Text>
                  {new Date(selectedReview.updatedAt).toLocaleString("vi-VN")}
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default ReviewsManagement;