import { useEffect, useRef, useState } from "react";
import ReactImageGallery from "react-image-gallery";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Button, Col, Input, Rate, Row, Spin } from "antd";
import { useCurrentApp } from "../../context/app.context";
import PopularWatches from "../../components/PopularWatches";
import SkeletonLoader from "../../components/SkeletonLoader";
import WishlistButton from "../../components/WishlistButton";
import { items } from "../../data";
import { addReviewApi, fetchReviewsByProduct } from "../../services/api";
import useWatchesData from "../../apiservice/useWathes";
import { getProduct } from "../../apiservice/apiProduct";
import { formatProductFromBackend } from "../../utils/productMapper";
import "react-image-gallery/styles/css/image-gallery.css";
import "../../styles/product.detail.css";

const typeMapping = {
  "Nam": "Đồng Hồ Nam",
  "Nữ": "Đồng Hồ Nữ",
  "Couple": "Đồng Hồ Cặp",
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data, loading } = useWatchesData();
  const [filteredWatches, setFilteredWatches] = useState([]);
  const [type, setType] = useState("");
  const [images, setImages] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const {
    dataViewDetail,
    setDataViewDetail,
    addToCart,
    messageApi,
    contextHolder,
    isAuthenticated,
  } = useCurrentApp();

  const refGallery = useRef(null);

  useEffect(() => {
    setType(typeMapping[dataViewDetail?.category]);
  }, [dataViewDetail?.category]);

  useEffect(() => {
    setType(typeMapping[dataViewDetail?.danhMuc]);
  }, [dataViewDetail?.danhMuc]);

  useEffect(() => {
    const fetchDataViewDetail = async () => {
      const res = await getProduct(id);
      if (res) {
        // Sử dụng formatProductFromBackend để đảm bảo dữ liệu nhất quán
        const formattedProduct = formatProductFromBackend(res);
        setDataViewDetail(formattedProduct);
      }
    };

    fetchDataViewDetail();
  }, [id]);

  useEffect(() => {
    if (dataViewDetail) {
      const imagesArr =
        dataViewDetail.images?.map((image) => ({
          original: image.imageUrl,
          thumbnail: image.imageUrl,
          originalClass: "original-image",
          thumbnailClass: "thumbnail-image",
        })) ||
        [];

      setImages(imagesArr);
    }
  }, [dataViewDetail]);

  // Lọc sản phẩm tương tự theo category
  useEffect(() => {
    if (dataViewDetail?.category?.name && !loading && data) {
      const allWatches = [...data.male, ...data.female, ...data.couple];
      const similarWatches = allWatches.filter(
        (watch) =>
          watch.category === dataViewDetail.category.name &&
          watch.id !== dataViewDetail.id
      );

      setFilteredWatches(similarWatches);
    }
  }, [dataViewDetail?.category?.name, data, loading, dataViewDetail?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
    else
      messageApi.open({
        type: "error",
        content: "Số lượng không thể nhỏ hơn 1!",
      });
  };

  const handleAddToCart = async () => {
    if (dataViewDetail) {
      try {
        await addToCart(
          {
            ...dataViewDetail,
            id: dataViewDetail.id,
          },
          quantity
        );

        messageApi.open({
          type: "success",
          content: "Thêm vào giỏ hàng thành công!",
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        messageApi.open({
          type: "error",
          content: "Không thể thêm sản phẩm vào giỏ hàng!",
        });
      }
    }
  };

  // Helper function to convert createdAt array to Date object
  const parseCreatedAt = (createdAt) => {
    if (Array.isArray(createdAt)) {
      // Backend returns: [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour, minute, second] = createdAt;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(createdAt);
  };

  const handleAddReview = async () => {
    console.log("=== SUBMIT REVIEW START ===");
    console.log("Authentication status:", isAuthenticated);
    console.log("Product ID:", dataViewDetail?.id);
    console.log("Rating:", newRating);
    console.log("Title:", newTitle);
    console.log("Content:", newContent);
    
    if (!newRating) {
      messageApi.open({ type: "error", content: "Vui lòng chọn số sao!" });
      return;
    }
    if (!newTitle?.trim()) {
      messageApi.open({ type: "error", content: "Vui lòng nhập tiêu đề!" });
      return;
    }
    if (!newContent?.trim()) {
      messageApi.open({ type: "error", content: "Vui lòng nhập nội dung đánh giá!" });
      return;
    }
    
    setSubmitLoading(true);
    try {
      const reviewData = {
        productId: dataViewDetail.id,
        rating: newRating,
        title: newTitle,
        content: newContent
      };
      console.log("📤 Sending review data:", reviewData);
      
      const response = await addReviewApi(reviewData);
      console.log("✅ Review submitted successfully:", response);
      
      messageApi.open({
        type: "success", 
        content: "Đã gửi đánh giá thành công!" 
      });
      
      setNewRating(0);
      setNewTitle("");
      setNewContent("");
      
      // Reload reviews
      console.log("🔄 Reloading reviews...");
      setReviewLoading(true);
      const res = await fetchReviewsByProduct(dataViewDetail.id);
      console.log("✅ Reviews reloaded:", res);
      setReviews(res || []);
    } catch (error) {
      console.error("❌ Submit review error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Gửi đánh giá thất bại.";
      messageApi.open({ type: "error", content: errorMessage });
    } finally {
      setReviewLoading(false);
      setSubmitLoading(false);
      console.log("=== SUBMIT REVIEW END ===");
    }
  };

  useEffect(() => {
    if (dataViewDetail?.id) {
      console.log("=== FETCH REVIEWS START ===");
      console.log("Product ID:", dataViewDetail.id);
      setReviewLoading(true);
      fetchReviewsByProduct(dataViewDetail.id)
        .then((res) => {
          console.log("✅ Fetch reviews response:", res);
          console.log("Response data:", res);
          console.log("Number of reviews:", res?.length || 0);
          setReviews(res || []);
        })
        .catch((err) => {
          console.error("❌ Fetch reviews error:", err);
          console.error("Error response:", err.response);
          console.error("Error message:", err.message);
          setReviews([]);
        })
        .finally(() => {
          setReviewLoading(false);
          console.log("=== FETCH REVIEWS END ===");
        });
    } else {
      console.log("⚠️ No product ID available for fetching reviews");
    }
  }, [dataViewDetail?.id]);

  return (
    <>
      {contextHolder}
      <div className="container mt-4 mb-20 px-12 mx-auto pt-20">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link
              to={`${type === "Đồng Hồ Nam"
                  ? "/men"
                  : type === "Đồng Hồ Nữ"
                    ? "/women"
                    : "/couple"
                }`}
            >
              {type}
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {dataViewDetail.name}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row className="mt-6 mx-20" gutter={[30, 30]}>
          <Col span={8} className="flex justify-center">
            <div className="w-3/4">
              <ReactImageGallery
                ref={refGallery}
                items={images}
                showPlayButton={false}
                showFullscreenButton={false}
                showNav={false}
                slideOnThumbnailOver={true}
              />
            </div>
          </Col>

          <Col span={16}>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#676767] text-justify flex-1">
                {dataViewDetail.name}
              </h1>
              {dataViewDetail.id && (
                <WishlistButton
                  productId={dataViewDetail.id}
                  size="large"
                  showText={true}
                />
              )}
            </div>
            <h2 className="text-4xl text-[#C40D2E] mt-4">
              {dataViewDetail?.price
                ? dataViewDetail.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
                : "Đang tải..."}
            </h2>
            <h3 className="text-sm text-[#676767] text-justify mt-4">
              {dataViewDetail.description}
            </h3>
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-[#666666]">Số lượng</span>
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center justify-center cursor-pointer text-xl w-6 h-6 border border-gray-500 rounded-sm px-2 py-2 transition duration-200 ease-in-out transform hover:scale-105"
                  onClick={handleDecreaseQuantity}
                >
                  -
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  className="flex items-center justify-center cursor-pointer text-xl w-6 h-6 border border-gray-500 rounded-sm px-2 py-2 transition duration-200 ease-in-out transform hover:scale-105"
                  onClick={handleIncreaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Display total price */}
            <div className="mt-4">
              <span className="text-lg font-semibold">Tổng tiền: </span>
              <span className="text-xl text-[#C40D2E] font-bold">
                {dataViewDetail?.price
                  ? (dataViewDetail.price * quantity).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                  : "Đang tải..."}
              </span>
            </div>
            <button
              className="flex items-center justify-center cursor-pointer w-full h-12 rounded-lg bg-[#993333] text-white text-lg font-semibold mt-6 p-2 uppercase 
              transition-all duration-300 ease-in-out hover:bg-red-500 hover:shadow-lg active:scale-97"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </Col>
        </Row>

        <div className="grid grid-cols-4 gap-6 mt-15 px-6 border-b border-gray-300 pb-15">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 border border-gray-100 p-4 rounded-xl shadow-sm transition duration-300 hover:shadow-md"
            >
              <img className="w-7 h-7" src={item.icon} alt="icon" />
              <p className="text-gray-700 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <SkeletonLoader px />
        ) : (
          <>
            <PopularWatches
              watches={filteredWatches}
              title="SẢN PHẨM TƯƠNG TỰ"
              mx
              px
            />
          </>
        )}

        <div className="mt-10 px-12">
          <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>
          {isAuthenticated ? (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Đánh giá của bạn:</label>
                <Rate value={newRating} onChange={setNewRating} />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Tiêu đề:</label>
                <Input
                  placeholder="Nhập tiêu đề đánh giá..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={255}
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Nội dung:</label>
                <Input.TextArea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Viết nhận xét chi tiết về sản phẩm..."
                />
              </div>
              
              <Button
                type="primary"
                onClick={handleAddReview}
                loading={submitLoading}
                className="mt-2"
              >
                Gửi đánh giá
              </Button>
            </div>
          ) : (
            <p className="mb-4 select-none">
              Vui lòng{" "}
              <Link to="/login" className="text-[#A51717]">
                đăng nhập
              </Link>{" "}
              để đánh giá
            </p>
          )}
          {reviewLoading ? (
            <Spin />
          ) : reviews.length > 0 ? (
            <>
              {console.log("📋 Rendering reviews:", reviews)}
              {reviews.map((review) => {
                console.log("Rendering review:", review);
                return (
                  <div key={review.id} className="mb-4 border-b pb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-gray-800 mr-2">
                          {review.userFullName || "Khách hàng"}
                        </span>
                      </div>
                      <Rate value={review.rating} disabled />
                      <h4 className="font-semibold mt-2 text-gray-900">{review.title}</h4>
                    </div>
                    <p className="mt-2 text-gray-700">{review.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {parseCreatedAt(review.createdAt).toLocaleString("vi-VN")}
                      </span>
                      {review.helpfulCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {review.helpfulCount} người thấy hữu ích
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="select-none text-gray-500">Sản phẩm chưa có đánh giá nào</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
