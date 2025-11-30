import { useEffect, useState } from "react";
import { Divider, Drawer, Table, Tag } from "antd";
import { useCurrentApp } from "../../context/app.context";
import { getOrdersApi } from "../../services/api";
import dayjs from "dayjs";

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
      dataIndex: "orderDate",
      render: (item) => {
        return dayjs(item).format("DD-MM-YYYY");
      },
    },
    {
      title: "Tổng số tiền",
      dataIndex: "totalAmount",
      render: (item) => {
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
          rowKey={"_id"}
          loading={loading}
        />
        <Drawer
          title="Chi tiết đơn hàng"
          onClose={() => {
            setOpenDetail(false);
            setDataDetail(null);
          }}
          open={openDetail}
        >
          {dataDetail?.items?.map((item, index) => {
            return (
              <ul className="space-y-2" key={index}>
                <li>
                  <span className="font-[500] mr-1">Tên sản phẩm:</span>{" "}
                  {item.product?.name || "N/A"}
                </li>
                <li>
                  <span className="font-[500] mr-1">Số lượng:</span>{" "}
                  {item.quantity}
                </li>
                <li>
                  <span className="font-[500] mr-1">Giá:</span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.unitPrice)}{" "}
                </li>
                <li>
                  <span className="font-[500] mr-1">Tổng:</span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.totalPrice)}{" "}
                </li>
                <Divider />
              </ul>
            );
          })}
          <div className="mt-4">
            <p><strong>Địa chỉ giao hàng:</strong> {dataDetail?.shippingAddress}</p>
            <p><strong>Ghi chú:</strong> {dataDetail?.notes || "Không có"}</p>
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default HistoryPage;
