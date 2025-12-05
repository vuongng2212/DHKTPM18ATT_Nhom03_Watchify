import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "../../context/app.context";
import { addAccessHistoryApi } from "../../services/api";
import WishlistButton from "../WishlistButton";

const ProductCard = ({ product }) => {
  const { user } = useCurrentApp();
  const navigate = useNavigate();

  const handleViewDetail = () => {
    if (user) {
      addAccessHistoryApi(product.id);
    }
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getImageUrl = () => {
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) {
      return product.images[0]?.imageUrl || product.images[0]?.url || product.images[0];
    }
    return "https://via.placeholder.com/400x300?text=No+Image";
  };

  return (
    <article
      className="group bg-white rounded-2xl border border-[#ffeaea] shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#C40D2E]/70 relative"
      onClick={handleViewDetail}
      aria-label={`Xem chi tiết ${product.name}`}
    >
      <div className="relative w-full h-56 bg-gradient-to-br from-[#fff8f8] to-[#ffeaea] flex items-center justify-center overflow-hidden">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="object-cover w-full h-full scale-100 group-hover:scale-105 transition-transform duration-300 rounded-t-2xl"
          loading="lazy"
          onError={(e) => { 
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'; 
          }}
        />

        {/* Badge "Mới" */}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-[#C40D2E] to-[#fbb6b6] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            Mới
          </span>
        )}

        {/* Badge "Hot" hoặc "Nổi bật" */}
        {product.isFeatured && !product.isNew && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
            Hot
          </span>
        )}

        {/* Wishlist Button */}
        <div
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <WishlistButton
            productId={product.id}
            size="default"
            showText={false}
          />
        </div>
      </div>

      <div className="p-4 text-center flex flex-col gap-1">
        <h3 
          className="text-[#C40D2E] text-base md:text-lg font-bold truncate group-hover:underline decoration-[#C40D2E]/40 transition-all duration-200" 
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Brand name if available */}
        {product.brand && (
          <p className="text-gray-500 text-xs md:text-sm truncate">
            {product.brand.name || product.brand}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-1">
          <p className="text-black font-extrabold text-lg md:text-xl group-hover:text-[#C40D2E] transition-colors duration-200">
            {formatPrice(product.price)}
          </p>
          
          {/* Original price if discounted */}
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-gray-400 text-sm line-through">
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>

        {/* Discount percentage */}
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full mt-1">
            -{product.discountPercentage}%
          </span>
        )}
      </div>
    </article>
  );
};

export default ProductCard;