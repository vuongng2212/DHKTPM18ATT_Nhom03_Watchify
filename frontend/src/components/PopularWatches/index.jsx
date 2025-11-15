import { useNavigate } from "react-router-dom";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useCurrentApp } from "../../context/app.context";
import { addAccessHistoryApi } from "../../services/api";

const PopularWatches = ({ watches, title, mx, px }) => {
  const { favorite, toggleFavorite, user } = useCurrentApp();
  const navigate = useNavigate();

  const handleViewDetail = (watch) => {
    if (user) {
      addAccessHistoryApi(watch.id || watch._id);
    }
    navigate(`/product/${watch.id || watch._id}`);
  };

  const isFavorite = (id) => {
    return favorite.some((item) => (item.id ? item.id : item._id) === id);
  };

  return (
    <div className={`container mx-auto py-8 ${px ? "" : "px-6"}`}>
      <h2 className="text-center text-xl font-bold uppercase text-gray-800 mb-6">
        {title}
      </h2>

      <div
        className={`grid gap-6 ${
          mx ? "mx-0" : "mx-20"
        } grid-cols-2 sm:grid-cols-3 md:grid-cols-4 overflow-hidden`}
      >
        {watches.map((watch) => (
          <div
            key={watch.id || watch._id}
            className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => handleViewDetail(watch)}
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <img
                src={watch.image || (watch.images && watch.images[0]?.imageUrl) || "https://via.placeholder.com/200x200?text=No+Image"}
                alt={watch.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />

              <button
                className={`absolute top-2 right-2 text-xl transition-all duration-300 cursor-pointer ${
                  isFavorite(watch.id || watch._id)
                    ? "text-red-500"
                    : "text-gray-500"
                } hover:text-red-500`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(watch);
                }}
              >
                {isFavorite(watch.id || watch._id) ? (
                  <HeartFilled />
                ) : (
                  <HeartOutlined />
                )}
              </button>
            </div>

            <p className="text-gray-700 text-sm mt-2 w-40 truncate transition-all duration-300 group-hover:scale-105">
              {watch.name || watch.name}
            </p>

            <p className="text-black font-bold text-lg transition-all duration-300 group-hover:scale-105">
              {(watch.price || watch.giaBan)?.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularWatches;
