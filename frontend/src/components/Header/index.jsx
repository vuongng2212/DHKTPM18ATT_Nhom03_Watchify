import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Badge, Dropdown } from "antd";
import { useCurrentApp } from "../../context/app.context";
import { logoutApi } from "../../services/api";
import { getBrands } from "../../apiservice/apiBrand"; // Import API
import logo from "../../assets/logoWatchify.png";
import searchIcon from "../../assets/search.png";
import cartIcon from "../../assets/cart.png";
import heartIcon from "../../assets/heart.png";
import userIcon from "../../assets/user.png";

// Cookie helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const Header = () => {
  const {
    favorite,
    user,
    carts,
    setCarts,
    isAuthenticated,
    setIsAppLoading,
    setUser,
    setIsAuthenticated,
    messageApi,
  } = useCurrentApp();
  const navigate = useNavigate();
  const [logoutStatus, setLogoutStatus] = useState({ type: "", message: "" });
  const [visibleBrands, setVisibleBrands] = useState([]); // State cho thương hiệu

  // Lấy danh sách thương hiệu có isVisible: true
  useEffect(() => {
    const fetchVisibleBrands = async () => {
      try {
        const response = await getBrands({ isVisible: true });
        setVisibleBrands(response.brands || []);
      } catch (err) {
        console.log(err);
        messageApi.error({
          content: "Lỗi khi lấy danh sách thương hiệu!",
          duration: 2,
        });
      }
    };
    fetchVisibleBrands();
  }, [messageApi]);

  useEffect(() => {
    if (logoutStatus.type && logoutStatus.message) {
      messageApi.open({
        type: logoutStatus.type,
        content: logoutStatus.message,
      });
      setLogoutStatus({ type: "", message: "" });
    }
  }, [logoutStatus, messageApi]);

    const handleLogout = async () => {
    try {
      setIsAppLoading(true);
      const refreshToken = getCookie("refreshToken");
      const response = await logoutApi(refreshToken);
      // Always clear state and tokens on logout attempt
      setUser(null);
      setIsAuthenticated(false);
      setIsAppLoading(false);
      setCarts([]);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("carts");
      deleteCookie("refreshToken");
      if (response) {
        messageApi.success({
          content: "Đăng xuất thành công!",
          duration: 2,
        });
      }
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      // Still clear state and tokens even if API fails
      setUser(null);
      setIsAuthenticated(false);
      setIsAppLoading(false);
      setCarts([]);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("carts");
      deleteCookie("refreshToken");
      messageApi.error({
        content: "Đã đăng xuất khỏi hệ thống!",
        duration: 2,
      });
      navigate("/");
    }
  };

  const items = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "/history",
      label: "Lịch sử mua hàng",
      onClick: () => navigate("/history"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];
  if (user?.roles?.includes("ROLE_ADMIN")) {
    items.unshift({
      label: <Link to="/admin">Trang quản trị</Link>,
      key: "admin",
    });
  }

  return (
    <header className="w-full border-b-2 border-b-[#EDEDED] bg-white">
      <div className="container mx-auto flex flex-col items-center pt-4 pb-1 px-6">
        <div className="w-full flex items-center justify-between py-6">
          <div
            onClick={() => navigate("/")}
            className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
          >
            <img src={logo} alt="T-Five Watch" className="h-50" />
          </div>

          <div className="flex items-center space-x-6 ml-auto">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Tìm sản phẩm hoặc thương hiệu"
                className="w-full border-none rounded-xl px-10 py-2 text-black text-sm focus:outline-none focus:border-black-400 bg-[#E7E7E8]"
              />
              <span className="absolute left-2 top-2 cursor-pointer">
                <img width="20px" src={searchIcon} alt="Search Icon" />
              </span>
            </div>

            <div className="flex space-x-7 text-gray-600 text-lg mr-[100px]">
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center hover:text-red-500 cursor-pointer transition-all duration-300 hover:scale-110 hover:opacity-80"
              >
                <Badge count={carts.length ?? 0} size={"small"} showZero>
                  <img width="26px" src={cartIcon} alt="Cart Icon" />
                </Badge>
              </button>
              <button
                onClick={() => navigate("/favorite")}
                className="flex items-center hover:text-red-500 cursor-pointer transition-all duration-300 hover:scale-110 hover:opacity-80"
              >
                <Badge count={favorite.length ?? 0} size={"small"} showZero>
                  <img width="26px" src={heartIcon} alt="Heart Icon" />
                </Badge>
              </button>
              {isAuthenticated && user ? (
                <Dropdown menu={{ items }} placement="bottom">
                  <div className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-all duration-300 hover:opacity-80">
                    <img
                      src={user.avatar || userIcon}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">
                      {user.fullName || `${user.firstName} ${user.lastName}`}
                    </span>
                  </div>
                </Dropdown>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="hover:text-red-500 cursor-pointer transition-all duration-300 hover:scale-110 hover:opacity-80"
                >
                  <img width="26px" src={userIcon} alt="User Icon" />
                </button>
              )}
            </div>
          </div>
        </div>

        <nav className="flex space-x-40 text-black text-lg font-medium mt-5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-red-500 border-b-2 border-red-500 pb-1 transition-colors duration-300"
                : "hover:text-red-500 transition-colors duration-300"
            }
          >
            TRANG CHỦ
          </NavLink>

          {/* Dropdown cho Nam */}
          <div className="relative group">
            <NavLink
              to="/men"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 border-b-2 border-red-500 pb-1 transition-colors duration-300"
                  : "hover:text-red-500 transition-colors duration-300"
              }
            >
              NAM
            </NavLink>
            <div className="absolute left-0 top-8 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 z-10">
              <ul className="py-2 text-sm text-gray-700">
                <li className="px-4 py-2 font-bold text-gray-900">
                  Thương Hiệu
                </li>
                {visibleBrands.length === 0 ? (
                  <li className="px-4 py-2">Không có thương hiệu</li>
                ) : (
                  visibleBrands.map((brand) => (
                    <li key={brand.id}>
                      <NavLink
                        to={`/men/${brand.name?.toLowerCase().replace(" ", "-")}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {brand.name || "Unknown"}
                      </NavLink>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Dropdown cho Nữ */}
          <div className="relative group">
            <NavLink
              to="/women"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 border-b-2 border-red-500 pb-1 transition-colors duration-300"
                  : "hover:text-red-500 transition-colors duration-300"
              }
            >
              NỮ
            </NavLink>
            <div className="absolute left-0 top-8 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 z-10">
              <ul className="py-2 text-sm text-gray-700">
                <li className="px-4 py-2 font-bold text-gray-900">
                  Thương Hiệu
                </li>
                {visibleBrands.length === 0 ? (
                  <li className="px-4 py-2">Không có thương hiệu</li>
                ) : (
                  visibleBrands.map((brand) => (
                    <li key={brand.id}>
                      <NavLink
                        to={`/women/${brand.name
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {brand.name || "Unknown"}
                      </NavLink>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Dropdown cho Cặp Đôi */}
          <div className="relative group">
            <NavLink
              to="/couple"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 border-b-2 border-red-500 pb-1 transition-colors duration-300"
                  : "hover:text-red-500 transition-colors duration-300"
              }
            >
              CẶP ĐÔI
            </NavLink>
            <div className="absolute left-0 top-8 hidden group-hover:block bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 z-10">
              <ul className="py-2 text-sm text-gray-700">
                <li className="px-4 py-2 font-bold text-gray-900">
                  Thương Hiệu
                </li>
                {visibleBrands.length === 0 ? (
                  <li className="px-4 py-2">Không có thương hiệu</li>
                ) : (
                  visibleBrands.map((brand) => (
                    <li key={brand.id}>
                      <NavLink
                        to={`/couple/${brand.name
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        {brand.name || "Unknown"}
                      </NavLink>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-red-500 border-b-2 border-red-500 pb-1 transition-colors duration-300"
                : "hover:text-red-500 transition-colors duration-300"
            }
          >
            LIÊN HỆ
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
