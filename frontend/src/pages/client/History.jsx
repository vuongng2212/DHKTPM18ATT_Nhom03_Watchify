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
      render: (item) => {
        return dayjs(item).format("DD-MM-YYYY");
      },
    },
    {
      title: "Tổng số tiền",
      dataIndex: "tongTien",
      render: (item) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(item);
      },
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "trangThaiDonHang",
      render: (item) => (
        <Tag
          color={
            item === "Chờ xác nhận"
              ? "gold"
              : item === "Đã hủy"
              ? "red"
              : item === "Đang giao hàng"
              ? "cyan"
              : item === "Đã giao hàng"
              ? "blue"
              : "processing"
          }
          style={
            item === "Đã hủy"
              ? {
                  background: "#fff1f0",
                  color: "#ff4d4f",
                  borderColor: "#ffa39e",
                }
              : item === "Đang giao hàng"
              ? {
                  background: "#e6fffb",
                  color: "#13c2c2",
                  borderColor: "#87e8de",
                }
              : item === "Đã giao hàng"
              ? {
                  background: "#f0f5ff",
                  color: "#2f54eb",
                  borderColor: "#adc6ff",
                }
              : {}
          }
        >
          {item}
        </Tag>
      ),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "trangThaiThanhToan",
      render: (item) => (
        <Tag color={`${item === "Chưa thanh toán" ? "default" : "success"}`}>
          {item}
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
      const res = await getOrdersApi();
      if (res.data) {
        setDataHistory(res.data.orders);
      } else {
        notificationApi.error({
          message: "Đã có lỗi xảy ra",
          description: res.message,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      <div style={{ margin: 50 }}>
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
          {dataDetail?.chiTietDonHang?.map((item, index) => {
            return (
              <ul className="space-y-2" key={index}>
                <li>
                  <span className="font-[500] mr-1">Tên sản phẩm:</span>{" "}
                  {item.tenSanPham}
                </li>
                <li>
                  <span className="font-[500] mr-1">Số lượng:</span>{" "}
                  {item.soLuong}
                </li>
                <li>
                  <span className="font-[500] mr-1">Giá:</span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.giaBan)}{" "}
                </li>
                <Divider />
              </ul>
            );
          })}
        </Drawer>
      </div>
    </>
  );
};

export default HistoryPage;
