import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const Header = () => {
  const {
    wishlistCount,
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutStatus, setLogoutStatus] = useState({ type: "", message: "" });
  const [visibleBrands, setVisibleBrands] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchVisibleBrands = async () => {
      try {
        const response = await getBrands({ isVisible: true });
        setVisibleBrands(response.brands || []);
      } catch (err) {
        console.error(err);
        messageApi.error({ content: "Lỗi khi lấy danh sách thương hiệu!", duration: 2 });
      }
    };
    fetchVisibleBrands();
  }, [messageApi]);

  useEffect(() => {
    if (logoutStatus.type && logoutStatus.message) {
      messageApi.open({ type: logoutStatus.type, content: logoutStatus.message });
      setLogoutStatus({ type: "", message: "" });
    }
  }, [logoutStatus, messageApi]);

  const handleLogout = async () => {
    try {
      setIsAppLoading(true);
      const refreshToken = getCookie("refreshToken");
      const response = await logoutApi(refreshToken);
      setUser(null);
      setIsAuthenticated(false);
      setIsAppLoading(false);
      setCarts([]);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("carts");
      deleteCookie("refreshToken");
      if (response) messageApi.success({ content: "Đăng xuất thành công!", duration: 2 });
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsAppLoading(false);
      setCarts([]);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("carts");
      deleteCookie("refreshToken");
      messageApi.error({ content: "Đã đăng xuất khỏi hệ thống!", duration: 2 });
      navigate("/");
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchText.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchText.trim())}`);
        setSearchText("");
      }
    }
  };

  const items = [
    { key: "profile", label: "Thông tin cá nhân", onClick: () => navigate("/profile") },
    { key: "/history", label: "Lịch sử mua hàng", onClick: () => navigate("/history") },
    { key: "logout", label: "Đăng xuất", onClick: handleLogout },
  ];
  if (user?.roles?.includes("ROLE_ADMIN")) items.unshift({ label: <NavLink to="/admin">Trang quản trị</NavLink>, key: "admin" });

  // Shadow on scroll effect
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 ${scrolled ? 'shadow-xl bg-gradient-to-r from-[#fff8f8] via-[#ffeaea] to-[#fff8f8] border-b-[#fbb6b6]' : 'bg-white border-b-2 border-b-[#EDEDED]'}`} style={{ backdropFilter: 'blur(8px)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <div onClick={() => { setMobileOpen(false); navigate('/'); }} className="cursor-pointer flex items-center gap-2">
              <img src={logo} alt="Watchify" className="h-14 md:h-16 drop-shadow-lg rounded-xl transition-all duration-300" />
              <span className="hidden md:inline text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#C40D2E] to-[#fbb6b6] bg-clip-text text-transparent select-none ml-2">Watchify</span>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6 flex-1 justify-center">
            <nav className="flex space-x-8 text-base font-semibold">
              <NavLink to="/" className={({ isActive }) => isActive ? "text-[#C40D2E] border-b-2 border-[#C40D2E] pb-1 scale-110" : "hover:text-[#C40D2E] hover:scale-105 transition-all duration-200"}>TRANG CHỦ</NavLink>

              <div className="relative group">
                <NavLink to="/men" className={({ isActive }) => isActive ? "text-[#C40D2E] border-b-2 border-[#C40D2E] pb-1 scale-110" : "hover:text-[#C40D2E] hover:scale-105 transition-all duration-200"}>NAM</NavLink>
                <div className="absolute left-0 top-9 hidden group-hover:block bg-white/95 backdrop-blur-md border border-[#fbb6b6] rounded-xl shadow-lg w-48 z-20 animate-fadeIn">
                  <ul className="py-2 text-sm text-gray-700">
                    <li className="px-4 py-2 font-bold text-[#C40D2E]">Thương Hiệu</li>
                    {visibleBrands.length === 0 ? (
                      <li className="px-4 py-2">Không có thương hiệu</li>
                    ) : (
                      visibleBrands.map((brand) => (
                        <li key={brand.id}>
                          <NavLink to={`/men/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} className="block px-4 py-2 rounded hover:bg-[#ffeaea] hover:text-[#C40D2E] transition-all duration-150">{brand.name || "Unknown"}</NavLink>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="relative group">
                <NavLink to="/women" className={({ isActive }) => isActive ? "text-[#C40D2E] border-b-2 border-[#C40D2E] pb-1 scale-110" : "hover:text-[#C40D2E] hover:scale-105 transition-all duration-200"}>NỮ</NavLink>
                <div className="absolute left-0 top-9 hidden group-hover:block bg-white/95 backdrop-blur-md border border-[#fbb6b6] rounded-xl shadow-lg w-48 z-20 animate-fadeIn">
                  <ul className="py-2 text-sm text-gray-700">
                    <li className="px-4 py-2 font-bold text-[#C40D2E]">Thương Hiệu</li>
                    {visibleBrands.length === 0 ? (
                      <li className="px-4 py-2">Không có thương hiệu</li>
                    ) : (
                      visibleBrands.map((brand) => (
                        <li key={brand.id}>
                          <NavLink to={`/women/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} className="block px-4 py-2 rounded hover:bg-[#ffeaea] hover:text-[#C40D2E] transition-all duration-150">{brand.name || "Unknown"}</NavLink>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="relative group">
                <NavLink to="/couple" className={({ isActive }) => isActive ? "text-[#C40D2E] border-b-2 border-[#C40D2E] pb-1 scale-110" : "hover:text-[#C40D2E] hover:scale-105 transition-all duration-200"}>CẶP ĐÔI</NavLink>
                <div className="absolute left-0 top-9 hidden group-hover:block bg-white/95 backdrop-blur-md border border-[#fbb6b6] rounded-xl shadow-lg w-48 z-20 animate-fadeIn">
                  <ul className="py-2 text-sm text-gray-700">
                    <li className="px-4 py-2 font-bold text-[#C40D2E]">Thương Hiệu</li>
                    {visibleBrands.length === 0 ? (
                      <li className="px-4 py-2">Không có thương hiệu</li>
                    ) : (
                      visibleBrands.map((brand) => (
                        <li key={brand.id}>
                          <NavLink to={`/couple/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} className="block px-4 py-2 rounded hover:bg-[#ffeaea] hover:text-[#C40D2E] transition-all duration-150">{brand.name || "Unknown"}</NavLink>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <NavLink to="/contact" className={({ isActive }) => isActive ? "text-[#C40D2E] border-b-2 border-[#C40D2E] pb-1 scale-110" : "hover:text-[#C40D2E] hover:scale-105 transition-all duration-200"}>LIÊN HỆ</NavLink>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block relative w-72">
              <input 
                type="text" 
                placeholder="Tìm sản phẩm hoặc thương hiệu" 
                className="w-full border-none rounded-xl px-10 py-2 text-black text-sm focus:outline-none bg-[#E7E7E8]"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleSearch}
              />
              <span className="absolute left-2 top-2 cursor-pointer" onClick={handleSearch}>
                <img width="20px" src={searchIcon} alt="Search Icon" />
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/cart')} className="flex items-center hover:text-red-500 cursor-pointer transition-all duration-300">
                <Badge count={carts.length ?? 0} size={'small'} showZero><img width="26px" src={cartIcon} alt="Cart Icon" /></Badge>
              </button>
              <button onClick={() => navigate('/favorite')} className="flex items-center hover:text-red-500 cursor-pointer transition-all duration-300">
                <Badge count={wishlistCount ?? 0} size={'small'} showZero><img width="26px" src={heartIcon} alt="Heart Icon" /></Badge>
              </button>
              {isAuthenticated && user ? (
                <Dropdown menu={{ items }} placement="bottom">
                  <div className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-all duration-300">
                    <img src={user.avatar || userIcon} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-medium hidden md:block">{user.fullName || `${user.firstName} ${user.lastName}`}</span>
                  </div>
                </Dropdown>
              ) : (
                <button onClick={() => navigate('/login')} className="hover:text-red-500 cursor-pointer transition-all duration-300"><img width="26px" src={userIcon} alt="User Icon" /></button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2 text-gray-800">
              <NavLink to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'text-red-500 font-semibold' : ''}>Trang chủ</NavLink>
              <div>
                <div className="font-medium">Nam</div>
                <div className="pl-2">
                  {visibleBrands.length === 0 ? (<div>Không có thương hiệu</div>) : visibleBrands.map(brand => (
                    <NavLink key={brand.id} to={`/men/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)} className="block py-1">{brand.name}</NavLink>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium">Nữ</div>
                <div className="pl-2">
                  {visibleBrands.length === 0 ? (<div>Không có thương hiệu</div>) : visibleBrands.map(brand => (
                    <NavLink key={brand.id + "-w"} to={`/women/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)} className="block py-1">{brand.name}</NavLink>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium">Cặp đôi</div>
                <div className="pl-2">
                  {visibleBrands.length === 0 ? (<div>Không có thương hiệu</div>) : visibleBrands.map(brand => (
                    <NavLink key={brand.id + "-c"} to={`/couple/${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)} className="block py-1">{brand.name}</NavLink>
                  ))}
                </div>
              </div>
              <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Liên hệ</NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
