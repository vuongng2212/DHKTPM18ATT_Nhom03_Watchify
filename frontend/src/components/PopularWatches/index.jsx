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
    <section className={`w-full py-8 ${px ? "" : "px-4 sm:px-6 lg:px-8"}`} aria-labelledby={`popular-${title}`}>
      <h2 id={`popular-${title}`} className="text-center text-2xl sm:text-3xl font-extrabold uppercase text-gray-800 mb-6">
        {title}
      </h2>
      <div className={`grid gap-6 ${mx ? "mx-0" : "mx-0"} grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
        {watches.map((watch) => (
          <article
            key={watch.id || watch._id}
            className="group bg-white rounded-2xl border border-[#ffeaea] shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#C40D2E]/70 relative"
            onClick={() => handleViewDetail(watch)}
            aria-label={`Xem chi tiết ${watch.name}`}
          >
            <div className="relative w-full h-56 bg-gradient-to-br from-[#fff8f8] to-[#ffeaea] flex items-center justify-center overflow-hidden">
              <img
                src={watch.image || (watch.images && watch.images[0]?.imageUrl) || "https://via.placeholder.com/400x300?text=No+Image"}
                alt={watch.name}
                className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />

              {/* Badge "Mới" hoặc "Hot" */}
              {watch.isNew && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-[#C40D2E] to-[#fbb6b6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">Mới</span>
              )}
              {watch.isFeatured && !watch.isNew && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">Hot</span>
              )}

              <button
                aria-label={isFavorite(watch.id || watch._id) ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                className={`absolute top-3 right-3 text-2xl p-1 rounded-full transition-colors duration-200 focus:outline-none shadow ${isFavorite(watch.id || watch._id) ? 'text-red-500 bg-white/90' : 'text-gray-600 bg-white/80'} group-hover:scale-110`}
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

            <div className="p-4 text-center flex flex-col gap-1">
              <h3 className="text-[#C40D2E] text-base md:text-lg font-bold truncate group-hover:underline decoration-[#C40D2E]/40 transition-all duration-200" title={watch.name}>{watch.name}</h3>

              <p className="text-black font-extrabold text-lg md:text-xl mt-1 group-hover:text-[#C40D2E] transition-colors duration-200">
                {(watch.price || watch.giaBan)?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PopularWatches;
