import { useEffect, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { useCurrentApp } from "../../context/app.context";

const FavoritePage = () => {
  const { wishlist, loadWishlist, removeFromWishlist, isAuthenticated, messageApi, contextHolder } = useCurrentApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        await loadWishlist();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      messageApi.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      messageApi.error("Không thể xóa sản phẩm");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-6 pt-20">
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="text-6xl text-gray-400 mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-700">
            Vui lòng đăng nhập để xem danh sách yêu thích
          </h1>
          <Link
            to="/login"
            className="mt-6 px-6 py-3 bg-[#A51717] text-white text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6 pt-20">
        <div className="flex justify-center items-center h-[50vh]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="container mx-auto py-8 px-6 pt-20">
        {wishlist && wishlist.length > 0 ? (
          <>
            <h2 className="text-left text-lg font-bold text-[#344054] mb-6">
              {wishlist.length} sản phẩm yêu thích
            </h2>

            <div className="grid grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center text-center transition-all duration-300 hover:scale-105"
                >
                  <Link to={`/product/${item.product?.id}`}>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <img
                        src={item.product?.image || (item.product?.images && item.product.images[0]?.imageUrl) || "https://via.placeholder.com/400x300?text=No+Image"}
                        alt={item.product?.name}
                        className="object-cover w-full h-full rounded-lg"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                      />
                    </div>
                    <p className="text-[#676767] text-sm mt-2 w-40 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-[#606060] font-bold text-lg">
                      {item.product?.price?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </Link>

                  <button
                    className="absolute top-0 right-0 text-gray-500 hover:text-red-500 transition-all duration-300 cursor-pointer bg-white rounded-full p-1 shadow-md"
                    onClick={() => handleRemove(item.product?.id)}
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <CloseOutlined />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="text-6xl text-gray-400 mb-4">❤️</div>
            <h1 className="text-2xl font-bold text-gray-700">
              Danh sách yêu thích của bạn đang trống!
            </h1>
            <p className="text-gray-500 mt-2">
              Hãy tìm kiếm và thêm sản phẩm yêu thích vào danh sách của bạn.
            </p>

            <Link
              to="/"
              className="mt-6 px-6 py-3 bg-[#A51717] text-white text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritePage;
