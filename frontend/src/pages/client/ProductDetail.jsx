import { useEffect, useRef, useState } from "react";
import ReactImageGallery from "react-image-gallery";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Button, Col, Input, Rate, Row, Spin } from "antd";
import { useCurrentApp } from "../../context/app.context";
import PopularWatches from "../../components/PopularWatches";
import SkeletonLoader from "../../components/SkeletonLoader";
import { items } from "../../data";
import { addReviewApi, fetchReviewsByProduct } from "../../services/api";
import useWatchesData from "../../apiservice/useWathes";
import { getProduct } from "../../apiservice/apiProduct";
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
  const [newStar, setNewStar] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const {
    dataViewDetail,
    setDataViewDetail,
    addToCart,
    messageApi,
    contextHolder,
    user,
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
        setDataViewDetail(res);
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

  const handleAddToCart = () => {
    if (!user) {
      messageApi.open({
        type: "error",
        content: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!",
      });
      return;
    }

    if (dataViewDetail) {
      addToCart(
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
    }
  };

  const handleAddReview = async () => {
    if (!newStar) {
      messageApi.open({ type: "error", content: "Vui lòng chọn số sao!" });
      return;
    }
    setSubmitLoading(true);
    try {
      await addReviewApi({
        product: dataViewDetail.id,
        star: newStar,
        comment: newComment,
      });
      messageApi.open({ type: "success", content: "Đã gửi đánh giá." });
      setNewStar(0);
      setNewComment("");
      setReviewLoading(true);
      const res = await fetchReviewsByProduct(dataViewDetail.id);
      if (res.success) setReviews(res.data);
    } catch (error) {
      console.error(error);
      messageApi.open({ type: "error", content: "Gửi đánh giá thất bại." });
    } finally {
      setReviewLoading(false);
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (dataViewDetail?.id) {
      setReviewLoading(true);
      fetchReviewsByProduct(dataViewDetail.id)
        .then((res) => res.success && setReviews(res.data))
        .catch((err) => console.error(err))
        .finally(() => setReviewLoading(false));
    }
  }, [dataViewDetail?.id]);

  return (
    <>
      {contextHolder}
      <div className="container mt-4 mb-20 px-12 mx-auto">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Trang chủ</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link
              to={`${
                type === "Đồng Hồ Nam"
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
            <h1 className="text-2xl font-bold text-[#676767] text-justify">
              {dataViewDetail.name}
            </h1>
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
            <div className="mb-6">
              <Rate value={newStar} onChange={setNewStar} />
              <Input.TextArea
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết nhận xét..."
                className="mt-2"
              />
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
            reviews.map((review) => (
              <div key={review._id} className="mb-4 border-b pb-4">
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.user.avatar || ""}
                      alt={review.user.tenNguoiDung}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="mr-2 text-gray-600 select-none">
                      {review.user.tenNguoiDung}
                    </span>
                  </div>
                  <Rate value={review.star} disabled />
                </div>
                <p className="mt-2">{review.comment}</p>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="select-none">Sản phẩm chưa có đánh giá nào</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
