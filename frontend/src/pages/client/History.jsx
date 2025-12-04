import { useEffect, useState } from "react";
import { Divider, Drawer, Table, Tag } from "antd";
import { useCurrentApp } from "../../context/app.context";
import { getOrdersApi } from "../../services/api";
import { parseJavaDate, formatDateTime } from "../../utils/dateUtils";

const HistoryPage = () => {
  const [dataHistory, setDataHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetail, setOpenDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState(null);
  const { notificationApi } = useCurrentApp();

  const mapOrderStatus = (status) => {
    switch (status) {
      case "PENDING": return "Chờ xác nhận";
      case "CONFIRMED": return "Đã xác nhận";
      case "PROCESSING": return "Đang xử lý";
      case "SHIPPED": return "Đang giao hàng";
      case "DELIVERED": return "Đã giao hàng";
      case "CANCELLED": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  const mapPaymentStatus = (status, paymentMethod) => {
    if (paymentMethod === "CASH_ON_DELIVERY") {
      return "Thanh toán khi nhận hàng";
    }
    // Mock: Based on order status, assume paid if CONFIRMED or later
    return status === "PENDING" ? "Chưa thanh toán" : "Đã thanh toán";
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => <>{index + 1}</>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (item, record) => {
        const dateToUse = item || record.orderDate;
        if (!dateToUse) return "N/A";
        
        const parsedDate = parseJavaDate(dateToUse);
        if (!parsedDate) return "N/A";
        
        return formatDateTime(dateToUse);
      },
    },
    {
      title: "Tổng số tiền",
      dataIndex: "totalAmount",
      render: (item) => {
        if (!item) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item);
      },
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      render: (item) => (
        <Tag
          color={
            mapOrderStatus(item) === "Chờ xác nhận"
              ? "gold"
              : mapOrderStatus(item) === "Đã hủy"
                ? "red"
                : mapOrderStatus(item) === "Đang giao hàng"
                  ? "cyan"
                  : mapOrderStatus(item) === "Đã giao hàng"
                    ? "blue"
                    : "processing"
          }
          style={
            mapOrderStatus(item) === "Đã hủy"
              ? {
                background: "#fff1f0",
                color: "#ff4d4f",
                borderColor: "#ffa39e",
              }
              : mapOrderStatus(item) === "Đang giao hàng"
                ? {
                  background: "#e6fffb",
                  color: "#13c2c2",
                  borderColor: "#87e8de",
                }
                : mapOrderStatus(item) === "Đã giao hàng"
                  ? {
                    background: "#f0f5ff",
                    color: "#2f54eb",
                    borderColor: "#adc6ff",
                  }
                  : {}
          }
        >
          {mapOrderStatus(item)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "status",
      render: (text, record) => (
        <Tag color={`${mapPaymentStatus(text, record.paymentMethod) === "Chưa thanh toán" ? "default" : "success"}`}>
          {mapPaymentStatus(text, record.paymentMethod)}
        </Tag>
      ),
    },
    {
      title: "Chi tiết",
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setDataDetail(record);
              setOpenDetail(true);
            }}
          >
            Xem chi tiết
          </a>
        </>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getOrdersApi(0, 10); // page 0-based
        if (res && res.orders) {
          setDataHistory(res.orders);
        } else {
          notificationApi.error({
            message: "Đã có lỗi xảy ra",
            description: "Không thể tải lịch sử đơn hàng",
          });
        }
      } catch (error) {
        notificationApi.error({
          message: "Đã có lỗi xảy ra",
          description: error.message || "Lỗi không xác định",
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [notificationApi]);

  return (
    <>
      <div style={{ margin: 50 }} className="pt-20">
        <h2 className="font-semibold uppercase text-center text-xl select-none">
          Lịch sử đơn hàng
        </h2>
        <Divider />
        <Table
          columns={columns}
          dataSource={dataHistory}
          bordered
          rowKey={(record) => record.id || record._id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
        <Drawer
          title="Chi tiết đơn hàng"
          onClose={() => {
            setOpenDetail(false);
            setDataDetail(null);
          }}
          open={openDetail}
          width={500}
        >
          {dataDetail && (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="mb-2"><strong>Mã đơn hàng:</strong> {dataDetail.orderNumber || dataDetail.id?.substring(0, 8) || "N/A"}</p>
                <p className="mb-2"><strong>Ngày đặt:</strong> {(() => {
                  const dateToUse = dataDetail.createdAt || dataDetail.orderDate;
                  if (!dateToUse) return "N/A";
                  
                  const parsedDate = parseJavaDate(dateToUse);
                  if (!parsedDate) return "N/A";
                  
                  return formatDateTime(dateToUse);
                })()}</p>
                <p className="mb-2"><strong>Trạng thái:</strong> <Tag color={mapOrderStatus(dataDetail.status) === "Đã giao hàng" ? "success" : "processing"}>{mapOrderStatus(dataDetail.status)}</Tag></p>
              </div>
              
              <h3 className="font-semibold mb-3">Sản phẩm:</h3>
              {dataDetail?.items?.map((item, index) => {
                return (
                  <div className="mb-4 pb-4 border-b" key={index}>
                    <p className="mb-2">
                      <span className="font-[500]">Tên sản phẩm:</span>{" "}
                      {item.productName || item.product?.name || "N/A"}
                    </p>
                    <p className="mb-2">
                      <span className="font-[500]">Số lượng:</span>{" "}
                      {item.quantity || 0}
                    </p>
                    <p className="mb-2">
                      <span className="font-[500]">Đơn giá:</span>{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.unitPrice || 0)}
                    </p>
                    <p className="mb-2">
                      <span className="font-[500]">Thành tiền:</span>{" "}
                      <span className="text-green-600 font-semibold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.totalPrice || 0)}
                      </span>
                    </p>
                  </div>
                );
              })}
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-lg font-semibold mb-3">
                  Tổng cộng: {" "}
                  <span className="text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(dataDetail.totalAmount || 0)}
                  </span>
                </p>
                <p className="mb-2"><strong>Địa chỉ giao hàng:</strong> {dataDetail?.shippingAddress || "Chưa có"}</p>
                <p className="mb-2"><strong>Phương thức thanh toán:</strong> {dataDetail?.paymentMethod === "CASH_ON_DELIVERY" || dataDetail?.paymentMethod === "COD" ? "COD" : dataDetail?.paymentMethod || "N/A"}</p>
                <p><strong>Ghi chú:</strong> {dataDetail?.notes || "Không có"}</p>
              </div>
            </>
          )}
        </Drawer>
      </div>
    </>
  );
};

export default HistoryPage;
