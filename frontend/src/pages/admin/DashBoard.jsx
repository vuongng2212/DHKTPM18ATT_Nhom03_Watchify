import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../apiservice/apiProduct";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandVisibility,
} from "../../apiservice/apiBrand";
import {
  getAllOrdersApi,
  updateOrderStatusApi,
  createOrderApi,
  getUsersApi,
  updateProfileApi as updateUserApi,
  getRolesApi,
} from "../../services/api";
import { Drawer, Spin, Modal, Form, Input, Select } from "antd";
import { useCurrentApp } from "../../context/app.context";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useCurrentApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]); // State để lưu trữ thông tin thương hiệu (id: name)
  const [brandFormData, setBrandFormData] = useState({ ten: "" });
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addOrderLoading, setAddOrderLoading] = useState(false);
  const [addOrderForm, setAddOrderForm] = useState({
    tenNguoiDung: "",
    email: "",
    sdt: "",
    diaChi: "",
    tongTien: "",
    trangThaiDonHang: "Chờ xác nhận",
    trangThaiThanhToan: "Chưa thanh toán",
    phuongThucThanhToan: "",
    ghiChu: "",
    chiTietDonHang: [{ sanPhamId: "", soLuong: 1, giaBan: "" }],
  });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    _id: "",
    hoTen: "",
    gioiTinh: "",
    sdt: "",
    quyen: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [roles, setRoles] = useState([]);

  const { messageApi } = useCurrentApp();

  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await fetchBrandsData();
      await fetchProducts();
    };
    fetchData();
  }, []);

  const fetchBrandsData = async () => {
    try {
      const response = await getBrands();
      console.log("Brands API Response:", response);
      if (response && Array.isArray(response.brands)) {
        setBrands(response.brands);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error("Fetch Brands Error:", err);
      setBrands([]);
    }
  };
  const getBrandName = (brandId) => {
    const brand = brands.find((b) => b._id === brandId);
    return brand ? brand.ten : "Không xác định";
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts(1, 30);
      console.log("Products API Response:", response);
      if (response && response.productDatas) {
        setProducts(response.productDatas);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch Products Error:", err);
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/edit/${product._id}`);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter((p) => p._id !== productId));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleBrandInputChange = (e) => {
    setBrandFormData({ ten: e.target.value });
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    if (!brandFormData.ten.trim()) {
      return;
    }
    try {
      if (editingBrandId) {
        const response = await updateBrand(editingBrandId, brandFormData);
        setBrands(
          brands.map((brand) =>
            brand._id === editingBrandId ? response.brand : brand
          )
        );
      } else {
        const response = await createBrand(brandFormData);
        setBrands([...brands, response.brand]);
      }
      setBrandFormData({ ten: "" });
      setEditingBrandId(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditBrand = (brand) => {
    setBrandFormData({ ten: brand.ten });
    setEditingBrandId(brand._id);
  };

  const handleDeleteBrand = async (brandId) => {
    if (window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) {
      try {
        await deleteBrand(brandId);
        setBrands(brands.filter((brand) => brand._id !== brandId));
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleCancelEditBrand = () => {
    setBrandFormData({ ten: "" });
    setEditingBrandId(null);
  };

  const filteredBrands = Array.isArray(brands)
    ? brands.filter((brand) =>
        brand.ten.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleToggleVisibility = async (brandId) => {
    try {
      const response = await toggleBrandVisibility(brandId);
      setBrands(
        brands.map((brand) => (brand._id === brandId ? response.brand : brand))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async (page = ordersPage) => {
    setOrdersLoading(true);
    try {
      const res = await getAllOrdersApi(page, itemsPerPage);
      if (res.data && res.status) {
        setOrders(res.data.orders);
        setOrdersTotalPages(res.data.totalPages);
        setTotalOrders(res.data.total);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.log(err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [ordersPage, itemsPerPage]);

  // Dữ liệu biểu đồ
  const barData = {
    labels: ["1 Aug", "2 Aug", "3 Aug", "4 Aug", "5 Aug", "6 Aug"],
    datasets: [
      {
        label: "Doanh thu (triệu đồng)",
        data: [15, 10, 25, 20, 30, 18],
        backgroundColor: "#A61C28",
        borderColor: "#A61C28",
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ["Desktop", "Tablet", "Mobile"],
    datasets: [
      {
        data: [63, 15, 22],
        backgroundColor: ["#A61C28", "#D4AF37", "#E5E7EB"],
        borderWidth: 1,
      },
    ],
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredProducts = products.filter((product) =>
    product.tenDH.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Định nghĩa các tab
  const tabs = [
    { label: "Tổng quan", value: "overview", icon: "📊" },
    { label: "Sản phẩm", value: "products", icon: "🕒" },
    { label: "Thương Hiệu", value: "brands", icon: "📦" },
    { label: "Đơn hàng", value: "orders", icon: "📦" },
    { label: "Người dùng", value: "customers", icon: "👥" },
    { label: "Thống kê", value: "analytics", icon: "📈" },
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const handleOrdersPrev = () => {
    if (ordersPage > 1) {
      setOrdersPage(ordersPage - 1);
    }
  };

  const handleOrdersNext = () => {
    if (ordersPage < ordersTotalPages) {
      setOrdersPage(ordersPage + 1);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id === orderId) {
            // Nếu chuyển sang 'Đã giao hàng' thì cập nhật trạng thái thanh toán luôn
            if (newStatus === "Đã giao hàng") {
              return {
                ...order,
                trangThaiDonHang: newStatus,
                trangThaiThanhToan: "Đã thanh toán",
              };
            }
            return { ...order, trangThaiDonHang: newStatus };
          }
          return order;
        })
      );
    } catch {
      messageApi.open({
        type: "error",
        content: "Cập nhật trạng thái thất bại!",
      });
    }
  };

  // Lọc đơn hàng theo searchTerm trên trang hiện tại
  const filteredOrders = searchTerm.trim()
    ? orders.filter((order) => {
        const keyword = searchTerm.toLowerCase();
        return (
          (order.tenNguoiDung &&
            order.tenNguoiDung.toLowerCase().includes(keyword)) ||
          (order.trangThaiDonHang &&
            order.trangThaiDonHang.toLowerCase().includes(keyword)) ||
          (order.trangThaiThanhToan &&
            order.trangThaiThanhToan.toLowerCase().includes(keyword)) ||
          (order.sdt && order.sdt.toLowerCase().includes(keyword)) ||
          (order.email && order.email.toLowerCase().includes(keyword))
        );
      })
    : orders;

  const handleAddOrderChange = (e, idx, field) => {
    if (typeof idx === "number") {
      // Thay đổi chi tiết sản phẩm
      const newDetails = [...addOrderForm.chiTietDonHang];
      newDetails[idx][field] = e.target.value;
      setAddOrderForm({ ...addOrderForm, chiTietDonHang: newDetails });
    } else {
      setAddOrderForm({ ...addOrderForm, [e.target.name]: e.target.value });
    }
  };

  const handleAddOrderProductAdd = () => {
    setAddOrderForm({
      ...addOrderForm,
      chiTietDonHang: [
        ...addOrderForm.chiTietDonHang,
        { sanPhamId: "", soLuong: 1, giaBan: "" },
      ],
    });
  };

  const handleAddOrderProductRemove = (idx) => {
    const newDetails = addOrderForm.chiTietDonHang.filter((_, i) => i !== idx);
    setAddOrderForm({ ...addOrderForm, chiTietDonHang: newDetails });
  };

  const handleAddOrderSubmit = async (e) => {
    e.preventDefault();
    setAddOrderLoading(true);
    try {
      const data = {
        ...addOrderForm,
        tongTien: Number(addOrderForm.tongTien),
        chiTietDonHang: addOrderForm.chiTietDonHang.map((item) => {
          const product = products.find((p) => p._id === item.sanPhamId);
          return {
            ...item,
            tenSanPham: product ? product.tenDH : "",
          };
        }),
      };
      await createOrderApi(data);
      setAddModalOpen(false);
      setAddOrderForm({
        tenNguoiDung: "",
        email: "",
        sdt: "",
        diaChi: "",
        tongTien: "",
        trangThaiDonHang: "Chờ xác nhận",
        trangThaiThanhToan: "Chưa thanh toán",
        phuongThucThanhToan: "",
        ghiChu: "",
        chiTietDonHang: [{ sanPhamId: "", soLuong: 1, giaBan: "" }],
      });
      setOrdersPage(1);
      await fetchOrders(1);
      messageApi.open({
        type: "success",
        content: "Tạo đơn hàng thành công!",
      });
    } catch {
      messageApi.open({
        type: "error",
        content: "Tạo đơn hàng thất bại!",
      });
    } finally {
      setAddOrderLoading(false);
    }
  };

  const fetchUsers = async (page = usersPage, search = userSearch) => {
    setUsersLoading(true);
    try {
      const res = await getUsersApi(page, 5, search);
      if (res.status && res.data) {
        setUsers(res.data.users);
        setUsersTotalPages(res.data.pagination.totalPages);
        setTotalUsers(res.data.pagination.totalUsers);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [activeTab, usersPage, userSearch]);

  // Lấy danh sách quyền
  const fetchRoles = async () => {
    try {
      const res = await getRolesApi();
      console.log("res:", res);

      if (res.status && res.data) setRoles(res.data);
      else setRoles([]);
    } catch {
      setRoles([]);
    }
  };

  console.log(roles);

  // Hàm mở modal sửa user
  const handleEditUser = (user) => {
    setEditUserForm({
      _id: user._id,
      tenNguoiDung: user.tenNguoiDung || "",
      gioiTinh: user.gioiTinh || "",
      sdt: user.sdt || "",
      quyen: user.quyen?.tenQuyen || "",
    });

    fetchRoles();
    setEditUserModalOpen(true);
  };

  const handleEditUserSubmit = async () => {
    setEditUserLoading(true);
    try {
      const { _id, ...updateData } = editUserForm;
      const res = await updateUserApi({ id: _id, ...updateData });
      if (res.status) {
        setEditUserModalOpen(false);
        await fetchUsers(usersPage, userSearch);
        messageApi.open({
          type: "success",
          content: "Cập nhật người dùng thành công!",
        });
      } else {
        messageApi.open({
          type: "error",
          content: res.message || "Cập nhật thất bại!",
        });
      }
    } catch {
      messageApi.open({ type: "error", content: "Cập nhật thất bại!" });
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleLockUser = async (userId, isActive) => {
    try {
      const res = await updateUserApi({ id: userId, isActive });
      if (res.status) {
        messageApi.open({
          type: "success",
          content: isActive
            ? "Mở khóa tài khoản thành công!"
            : "Khóa tài khoản thành công!",
        });
        await fetchUsers(usersPage, userSearch);
      } else {
        messageApi.open({
          type: "error",
          content:
            res.message ||
            (isActive
              ? "Mở khóa tài khoản thất bại!"
              : "Khóa tài khoản thất bại!"),
        });
      }
    } catch {
      messageApi.open({
        type: "error",
        content: isActive
          ? "Có lỗi khi mở khóa tài khoản!"
          : "Có lỗi xảy ra khi khóa tài khoản!",
      });
    }
  };

  const paginate = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  // TÍNH TỔNG DOANH THU THỰC TẾ
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.tongTien) || 0),
    0
  );

  return (
    <div className="min-h-screen flex font-roboto bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                "https://res.cloudinary.com/dijy8yams/image/upload/v1746868393/avatars/cobkxnhalcep3nwvnvyc.png"
              }
              alt="Admin Avatar"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-700 select-none mb-0.5">
                {user?.tenNguoiDung || "Admin"}
              </p>
              <p className="text-xs text-gray-500 select-none">
                {user?.quyen?.tenQuyen || "Admin"}
              </p>
            </div>
          </div>
        </div>
        <nav className="mt-4">
          <ul>
            {tabs.map((tab) => (
              <motion.li
                key={tab.value}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-200 ${
                  activeTab === tab.value
                    ? "bg-red-700 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearchTerm("");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </motion.li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-red-700 text-white p-4 flex justify-between items-center shadow-md">
          <h1 className="text-xl font-semibold select-none">
            Admin Dashboard - Watchify
          </h1>
          <div className="flex items-center gap-3 cursor-pointer">
            <motion.button
              className="relative text-white cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              🔔
              <span className="absolute -top-1 -right-1 bg-yellow-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center cursor-pointer">
                3
              </span>
            </motion.button>
            <motion.button
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate("/");
              }}
            >
              Quay về Trang Chủ
            </motion.button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 select-none">
                  Tổng quan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[
                    {
                      icon: "💰",
                      title: "Tổng doanh thu",
                      value: totalRevenue.toLocaleString("vi-VN") + " đ",
                      change: "↓ 12% so với tháng trước",
                      changeColor: "text-red-500",
                    },
                    {
                      icon: "👥",
                      title: "Tổng người dùng",
                      value: totalUsers,
                      change: "↑ 16% so với tháng trước",
                      changeColor: "text-green-500",
                    },
                    {
                      icon: "📦",
                      title: "Tổng đơn hàng",
                      value: totalOrders,
                      change: "↑ 8% so với tháng trước",
                      changeColor: "text-green-500",
                    },
                  ].map((card, index) => (
                    <motion.div
                      key={card.title}
                      className="bg-white p-6 rounded-lg shadow-md"
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                    >
                      <h3 className="text-red-700 font-medium flex items-center gap-2">
                        <span className="text-lg">{card.icon}</span>{" "}
                        {card.title}
                      </h3>
                      <p className="text-2xl font-bold mt-2">{card.value}</p>
                      <p className={`text-sm mt-1 ${card.changeColor}`}>
                        {card.change}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    variants={chartVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Doanh thu 7 ngày qua
                    </h3>
                    <div className="h-64">
                      <Bar
                        data={barData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: { title: { display: true, text: "Ngày" } },
                            y: {
                              title: {
                                display: true,
                                text: "Doanh thu (triệu đồng)",
                              },
                              beginAtZero: true,
                            },
                          },
                          animation: {
                            duration: 1000,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    variants={chartVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Lưu lượng truy cập theo thiết bị
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-1/2">
                        <Doughnut
                          data={doughnutData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "bottom" },
                            },
                            animation: {
                              duration: 1000,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-red-700"></span>
                        <span>Desktop - 63%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-yellow-600"></span>
                        <span>Tablet - 15%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-gray-300"></span>
                        <span>Mobile - 22%</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 select-none">
                  Quản lý sản phẩm
                </h2>
                <div className="flex justify-between items-center mb-4">
                  <motion.input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="border rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-700"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    whileFocus={{ scale: 1.02, transition: { duration: 0.2 } }}
                  />
                  <motion.button
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/admin/add")}
                  >
                    Thêm sản phẩm
                  </motion.button>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-red-700 text-white">
                      <tr>
                        <th className="p-3 text-left">Mã</th>
                        <th className="p-3 text-left">Tên sản phẩm</th>
                        <th className="p-3 text-left">Hình Ảnh</th>
                        <th className="p-3 text-left">Giá</th>
                        <th className="p-3 text-left">Số Lượng</th>
                        <th className="p-3 text-left">Danh Mục</th>
                        <th className="p-3 text-left">Thương Hiệu</th>
                        <th className="p-3 text-left">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredProducts).map((product, index) => (
                        <motion.tr
                          key={product._id}
                          className="border-b hover:bg-gray-50"
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <td className="p-3">{product.maDH}</td>
                          <td className="p-3">{product.tenDH}</td>

                          <td className="p-3">
                            {product.hinhAnh && product.hinhAnh.length > 0 && (
                              <img
                                src={product.hinhAnh[0].duLieuAnh}
                                alt={product.tenDH}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                          </td>
                          <td className="p-3">
                            {product.giaBan !== undefined &&
                            product.giaBan !== null
                              ? product.giaBan.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-3">{product.soLuong}</td>
                          <td className="p-3">{product.danhMuc}</td>
                          <td className="p-3">
                            {getBrandName(product.thuongHieu)}
                          </td>
                          <td className="p-3">
                            <motion.button
                              className="bg-yellow-500 text-white mr-2 cursor-pointer px-3 py-1 rounded hover:bg-yellow-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(product)}
                            >
                              Sửa
                            </motion.button>
                            <motion.button
                              className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded hover:bg-red-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(product._id)}
                            >
                              Xóa
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center p-4">
                    <span>
                      Trang {currentPage} / {totalPages(filteredProducts)}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Trước
                      </motion.button>
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === totalPages(filteredProducts)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sau
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "brands" && (
              <motion.div
                key="brands"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 select-none">
                  Quản lý Thương Hiệu
                </h2>
                <form onSubmit={handleBrandSubmit} className="mb-6">
                  <div className="flex flex-col md:flex-row gap-6 ">
                    <motion.input
                      type="text"
                      value={brandFormData.ten}
                      onChange={handleBrandInputChange}
                      placeholder="Nhập tên thương hiệu"
                      className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                      whileFocus={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    />
                    <div className="flex gap-2">
                      <motion.button
                        type="submit"
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {editingBrandId ? "Cập nhật" : "Thêm"}
                      </motion.button>
                      {editingBrandId && (
                        <motion.button
                          type="button"
                          onClick={handleCancelEditBrand}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Hủy
                        </motion.button>
                      )}
                    </div>
                    <motion.input
                      type="text"
                      placeholder="Tìm kiếm Thương Hiệu..."
                      className="border rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-700"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      whileFocus={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    />
                  </div>
                </form>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-red-700 text-white">
                      <tr>
                        <th className="p-3 text-left">Mã</th>
                        <th className="p-3 text-left">Tên Thương Hiệu</th>
                        <th className="p-3 text-left">Trạng Thái</th>
                        <th className="p-3 text-left">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredBrands).map((brand, index) => (
                        <motion.tr
                          key={brand._id}
                          className="border-b hover:bg-gray-50"
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <td className="p-3">{brand.ma}</td>
                          <td className="p-3">{brand.ten}</td>
                          <td className="p-3">
                            {brand.isVisible ? "Hiển thị" : "Ẩn"}
                          </td>
                          <td className="p-3">
                            <motion.button
                              className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 mr-2"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditBrand(brand)}
                            >
                              Sửa
                            </motion.button>
                            <motion.button
                              className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteBrand(brand._id)}
                            >
                              Xóa
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleToggleVisibility(
                                  brand._id,
                                  brand.isVisible
                                )
                              }
                              className={`${
                                brand.isVisible ? "bg-gray-500" : "bg-green-500"
                              } text-white px-3 py-1 rounded ml-2 cursor-pointer hover:${
                                brand.isVisible ? "bg-gray-600" : "bg-green-600"
                              }`}
                            >
                              {brand.isVisible ? "Ẩn" : "Hiển thị"}
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center p-4">
                    <span>
                      Trang {currentPage} / {totalPages(filteredBrands)}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Trước
                      </motion.button>
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={currentPage === totalPages(filteredBrands)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sau
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center select-none">
                  Quản lý đơn hàng
                </h2>
                <div className="flex justify-between items-center mb-4">
                  <motion.input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    className="border rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-700"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setOrdersPage(1);
                    }}
                    whileFocus={{ scale: 1.02, transition: { duration: 0.2 } }}
                  />
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium cursor-pointer"
                    onClick={() => setAddModalOpen(true)}
                  >
                    Thêm đơn hàng
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                  {ordersLoading ? (
                    <table className="min-w-full text-center border-separate border-spacing-y-1">
                      <tbody>
                        <tr>
                          <td colSpan={7} className="py-16">
                            <div className="flex justify-center items-center">
                              <Spin />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full text-center border-separate border-spacing-y-1">
                      <thead className="bg-red-700 text-white rounded-xl">
                        <tr>
                          <th className="p-3 rounded-tl-xl border-r">STT</th>
                          <th className="p-3 border-r">Khách hàng</th>
                          <th className="p-3 border-r">Thời gian</th>
                          <th className="p-3 border-r">Tổng số tiền</th>
                          <th className="p-3 border-r">Trạng thái đơn hàng</th>
                          <th className="p-3 border-r">
                            Trạng thái thanh toán
                          </th>
                          <th className="p-3 rounded-tr-xl">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-8 text-gray-400 text-center bg-white rounded-b-xl"
                            >
                              Không có đơn hàng nào.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order, index) => (
                            <motion.tr
                              key={order._id}
                              className="bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm rounded-xl"
                              whileHover={{
                                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                                backgroundColor: "#f9fafb",
                              }}
                            >
                              <td className="p-3 font-medium align-middle">
                                {(ordersPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td className="p-3 align-middle">
                                {order.tenNguoiDung || "-"}
                              </td>
                              <td className="p-3 align-middle">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString("vi-VN")
                                  : "-"}
                              </td>
                              <td className="p-3 align-middle text-right font-semibold text-black">
                                {order.tongTien
                                  ? Number(order.tongTien).toLocaleString(
                                      "vi-VN"
                                    ) + " đ"
                                  : "-"}
                              </td>
                              <td className="p-3 align-middle">
                                <select
                                  className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm select-none border focus:outline-none focus:ring-2
                                  ${
                                    order.trangThaiDonHang === "Đã giao"
                                      ? "bg-green-100 text-green-700 border-green-300"
                                      : order.trangThaiDonHang ===
                                        "Chờ xác nhận"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-400"
                                      : order.trangThaiDonHang === "Đang xử lý"
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                      : order.trangThaiDonHang === "Đã xác nhận"
                                      ? "bg-blue-50 text-blue-500 border-blue-300"
                                      : order.trangThaiDonHang === "Đã hủy"
                                      ? "bg-red-50 text-red-500 border-red-300"
                                      : order.trangThaiDonHang ===
                                        "Đang giao hàng"
                                      ? "bg-teal-50 text-teal-500 border-teal-300"
                                      : order.trangThaiDonHang ===
                                        "Đã giao hàng"
                                      ? "bg-indigo-50 text-indigo-600 border-indigo-300"
                                      : "bg-gray-100 text-gray-700 border-gray-300"
                                  }
                                `}
                                  value={order.trangThaiDonHang}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(
                                      order._id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="Chờ xác nhận">
                                    Chờ xác nhận
                                  </option>
                                  <option value="Đã xác nhận">
                                    Đã xác nhận
                                  </option>
                                  <option value="Đang giao hàng">
                                    Đang giao hàng
                                  </option>
                                  <option value="Đã giao hàng">
                                    Đã giao hàng
                                  </option>
                                  <option value="Đã hủy">Đã hủy</option>
                                </select>
                              </td>
                              <td className="p-3 align-middle">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm select-none
                                  ${
                                    order.trangThaiThanhToan === "Đã thanh toán"
                                      ? "bg-green-50 text-green-600 border border-green-400"
                                      : "bg-gray-100 text-gray-700 border border-gray-300"
                                  }`}
                                >
                                  {order.trangThaiThanhToan ||
                                    "Chưa thanh toán"}
                                </span>
                              </td>
                              <td className="p-3 align-middle">
                                <button
                                  className="text-blue-500 hover:underline font-medium cursor-pointer"
                                  onClick={() => {
                                    setOrderDetail(order);
                                    setDrawerOpen(true);
                                  }}
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                  {/* Drawer chi tiết đơn hàng */}
                  <Drawer
                    title="Chi tiết đơn hàng"
                    placement="right"
                    width={480}
                    onClose={() => {
                      setDrawerOpen(false);
                      setOrderDetail(null);
                    }}
                    open={drawerOpen}
                  >
                    {orderDetail && (
                      <>
                        <div className="mb-2">
                          <span className="font-medium">Khách hàng:</span>{" "}
                          {orderDetail.tenNguoiDung}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Email:</span>{" "}
                          {orderDetail.email}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Số điện thoại:</span>{" "}
                          {orderDetail.sdt}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {orderDetail.diaChi}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Tổng tiền:</span>{" "}
                          {orderDetail.tongTien?.toLocaleString("vi-VN") + " đ"}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">
                            Trạng thái đơn hàng:
                          </span>{" "}
                          {orderDetail.trangThaiDonHang}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">
                            Trạng thái thanh toán:
                          </span>{" "}
                          {orderDetail.trangThaiThanhToan}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Ngày tạo:</span>{" "}
                          {orderDetail.createdAt
                            ? new Date(orderDetail.createdAt).toLocaleString(
                                "vi-VN"
                              )
                            : "-"}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Ghi chú:</span>{" "}
                          {orderDetail.ghiChu || "-"}
                        </div>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">
                            Sản phẩm trong đơn:
                          </h4>
                          <ul className="divide-y divide-gray-200">
                            {orderDetail.chiTietDonHang?.map((item, idx) => (
                              <li key={idx} className="py-2 text-left">
                                <div>
                                  <span className="font-medium">
                                    Tên sản phẩm:
                                  </span>{" "}
                                  {item.tenSanPham}
                                </div>
                                <div>
                                  <span className="font-medium">Số lượng:</span>{" "}
                                  {item.soLuong}
                                </div>
                                <div>
                                  <span className="font-medium">Giá:</span>{" "}
                                  {item.giaBan?.toLocaleString("vi-VN") + " đ"}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </Drawer>
                  <div className="flex justify-between items-center p-4">
                    <span>
                      Trang {ordersPage} / {ordersTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={ordersPage === 1}
                        onClick={handleOrdersPrev}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Trước
                      </motion.button>
                      <motion.button
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
                        disabled={ordersPage === ordersTotalPages}
                        onClick={handleOrdersNext}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sau
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "customers" && (
              <motion.div
                key="customers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 select-none">
                  Quản lý người dùng
                </h2>
                <div className="flex justify-between items-center mb-4">
                  <motion.input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    className="border rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-700"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUsersPage(1);
                    }}
                    whileFocus={{ scale: 1.02, transition: { duration: 0.2 } }}
                  />
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                  {usersLoading ? (
                    <table className="min-w-full text-center border-separate border-spacing-y-1">
                      <tbody>
                        <tr>
                          <td colSpan={5} className="py-16">
                            <div className="flex justify-center items-center">
                              <Spin />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-red-700 text-white">
                        <tr>
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Tên</th>
                          <th className="p-3 text-left">Email</th>
                          <th className="p-3 text-left">Giới tính</th>
                          <th className="p-3 text-left">Số điện thoại</th>
                          <th className="p-3 text-left">Trạng thái</th>
                          <th className="p-3 text-left">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr
                            key={user._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              {(usersPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="p-3">{user.tenNguoiDung || "-"}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">{user.gioiTinh || "-"}</td>
                            <td className="p-3">{user.sdt}</td>
                            <td className="p-3">
                              {user.isActive ? "Hoạt động" : "Khóa"}
                            </td>
                            <td className="p-3">
                              <button
                                className="bg-yellow-500 text-white mr-2 cursor-pointer px-3 py-1 rounded hover:bg-yellow-600 font-medium"
                                onClick={() => handleEditUser(user)}
                              >
                                Sửa
                              </button>
                              <button
                                className={`px-3 py-1 rounded font-medium cursor-pointer text-white ${
                                  user.isActive
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                onClick={() =>
                                  handleLockUser(user._id, !user.isActive)
                                }
                              >
                                {user.isActive ? "Khóa" : "Mở khóa"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="flex justify-between items-center p-4">
                    <span>
                      Trang {usersPage} / {usersTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                        disabled={usersPage === 1}
                        onClick={() => setUsersPage(usersPage - 1)}
                      >
                        Trước
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                        disabled={usersPage === usersTotalPages}
                        onClick={() => setUsersPage(usersPage + 1)}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 select-none">
                  Thống kê
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    variants={chartVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Doanh thu theo tháng
                    </h3>
                    <div className="h-64">
                      <Bar
                        data={{
                          labels: [
                            "Tháng 1",
                            "Tháng 2",
                            "Tháng 3",
                            "Tháng 4",
                            "Tháng 5",
                          ],
                          datasets: [
                            {
                              label: "Doanh thu (triệu đồng)",
                              data: [500, 600, 700, 650, 800],
                              backgroundColor: "#A61C28",
                              borderColor: "#A61C28",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            x: { title: { display: true, text: "Tháng" } },
                            y: {
                              title: {
                                display: true,
                                text: "Doanh thu (triệu đồng)",
                              },
                              beginAtZero: true,
                            },
                          },
                          animation: {
                            duration: 1000,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white p-6 rounded-lg shadow-md"
                    variants={chartVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Sản phẩm bán chạy
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-1/2">
                        <Doughnut
                          data={{
                            labels: [
                              "Đồng hồ Nam 1",
                              "Đồng hồ Rolex 33",
                              "Đồng hồ Cặp 1",
                            ],
                            datasets: [
                              {
                                data: [40, 35, 25],
                                backgroundColor: [
                                  "#A61C28",
                                  "#D4AF37",
                                  "#E5E7EB",
                                ],
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: "bottom" },
                            },
                            animation: {
                              duration: 1000,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Modal thêm đơn hàng */}
          <Modal
            title={
              <div className="text-center w-full text-xl">
                Thêm đơn hàng mới
              </div>
            }
            open={addModalOpen}
            onCancel={() => setAddModalOpen(false)}
            footer={null}
            centered
            width={600}
          >
            <form onSubmit={handleAddOrderSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="tenNguoiDung"
                  value={addOrderForm.tenNguoiDung}
                  onChange={handleAddOrderChange}
                  required
                  className="border rounded p-2"
                  placeholder="Tên người dùng"
                />
                <Input
                  name="email"
                  value={addOrderForm.email}
                  onChange={handleAddOrderChange}
                  required
                  className="border rounded p-2"
                  placeholder="Email"
                />
                <Input
                  name="sdt"
                  value={addOrderForm.sdt}
                  onChange={handleAddOrderChange}
                  required
                  className="border rounded p-2"
                  placeholder="Số điện thoại"
                />
                <Input
                  name="diaChi"
                  value={addOrderForm.diaChi}
                  onChange={handleAddOrderChange}
                  required
                  className="border rounded p-2"
                  placeholder="Địa chỉ"
                />
                <Input
                  name="tongTien"
                  value={addOrderForm.tongTien}
                  onChange={handleAddOrderChange}
                  required
                  className="border rounded p-2"
                  placeholder="Tổng tiền"
                  type="number"
                  min="0"
                />
                <Select
                  name="trangThaiDonHang"
                  value={addOrderForm.trangThaiDonHang}
                  onChange={(value) =>
                    handleAddOrderChange({
                      target: { name: "trangThaiDonHang", value },
                    })
                  }
                  className="border rounded p-2"
                >
                  <Select.Option value="Chờ xác nhận">
                    Chờ xác nhận
                  </Select.Option>
                  <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
                  <Select.Option value="Đang giao hàng">
                    Đang giao hàng
                  </Select.Option>
                  <Select.Option value="Đã giao hàng">
                    Đã giao hàng
                  </Select.Option>
                  <Select.Option value="Đã hủy">Đã hủy</Select.Option>
                </Select>
                <Select
                  name="trangThaiThanhToan"
                  value={addOrderForm.trangThaiThanhToan}
                  onChange={(value) =>
                    handleAddOrderChange({
                      target: { name: "trangThaiThanhToan", value },
                    })
                  }
                  className="border rounded p-2"
                >
                  <Select.Option value="Chưa thanh toán">
                    Chưa thanh toán
                  </Select.Option>
                  <Select.Option value="Đã thanh toán">
                    Đã thanh toán
                  </Select.Option>
                </Select>
                <Select
                  name="phuongThucThanhToan"
                  value={addOrderForm.phuongThucThanhToan}
                  onChange={(value) =>
                    handleAddOrderChange({
                      target: { name: "phuongThucThanhToan", value },
                    })
                  }
                  className="border rounded p-2"
                  required
                >
                  <Select.Option value="">
                    Chọn phương thức thanh toán
                  </Select.Option>
                  <Select.Option value="COD">Tiền mặt</Select.Option>
                  <Select.Option value="MOMO">MOMO</Select.Option>
                </Select>
              </div>
              <Input.TextArea
                name="ghiChu"
                value={addOrderForm.ghiChu}
                onChange={handleAddOrderChange}
                className="border rounded p-2 w-full mt-3"
                style={{
                  marginTop: "15px",
                }}
                placeholder="Ghi chú"
              />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Sản phẩm trong đơn</h4>
                {addOrderForm.chiTietDonHang.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-nowrap gap-2 mb-3 items-center"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <Select
                        value={item.sanPhamId}
                        onChange={(value) =>
                          handleAddOrderChange(
                            { target: { value } },
                            idx,
                            "sanPhamId"
                          )
                        }
                        className="border rounded p-2 w-full"
                        required
                      >
                        <Select.Option value="">Chọn sản phẩm</Select.Option>
                        {products.map((p) => (
                          <Select.Option key={p._id} value={p._id}>
                            {p.tenDH}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-20">
                      <Input
                        value={item.soLuong}
                        onChange={(e) =>
                          handleAddOrderChange(e, idx, "soLuong")
                        }
                        className="border rounded p-2 w-full"
                        type="number"
                        min="1"
                        placeholder="Số lượng"
                        required
                      />
                    </div>
                    <div className="min-w-[100px]">
                      <Input
                        value={item.giaBan}
                        onChange={(e) => handleAddOrderChange(e, idx, "giaBan")}
                        className="border rounded p-2 w-full"
                        type="number"
                        min="0"
                        placeholder="Giá bán"
                        required
                      />
                    </div>
                    {addOrderForm.chiTietDonHang.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 font-bold cursor-pointer"
                        onClick={() => handleAddOrderProductRemove(idx)}
                      >
                        <MinusOutlined />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="text-red-600 font-bold mt-2 cursor-pointer"
                  onClick={handleAddOrderProductAdd}
                >
                  <PlusOutlined /> Thêm sản phẩm
                </button>
              </div>
              <button
                type="submit"
                className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-semibold cursor-pointer"
                disabled={addOrderLoading}
              >
                {addOrderLoading ? "Đang thêm..." : "Thêm đơn hàng"}
              </button>
            </form>
          </Modal>
          {/* Modal sửa user */}
          <Modal
            title="Sửa thông tin người dùng"
            open={editUserModalOpen}
            onCancel={() => setEditUserModalOpen(false)}
            onOk={handleEditUserSubmit}
            confirmLoading={editUserLoading}
            okText="Lưu"
            cancelText="Hủy"
            centered
          >
            <Form layout="vertical">
              <Form.Item label="Tên người dùng">
                <Input
                  value={editUserForm.tenNguoiDung}
                  onChange={(e) =>
                    setEditUserForm((f) => ({
                      ...f,
                      tenNguoiDung: e.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Giới tính">
                <Select
                  value={editUserForm.gioiTinh}
                  onChange={(val) =>
                    setEditUserForm((f) => ({ ...f, gioiTinh: val }))
                  }
                >
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Số điện thoại">
                <Input
                  value={editUserForm.sdt}
                  onChange={(e) =>
                    setEditUserForm((f) => ({ ...f, sdt: e.target.value }))
                  }
                />
              </Form.Item>
              <Form.Item label="Quyền">
                <Select
                  value={editUserForm.quyen}
                  onChange={(val) =>
                    setEditUserForm((f) => ({ ...f, quyen: val }))
                  }
                  placeholder="Chọn quyền"
                >
                  {roles.map((role) => {
                    return (
                      <Select.Option key={role._id} value={role._id}>
                        {role.tenQuyen}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
