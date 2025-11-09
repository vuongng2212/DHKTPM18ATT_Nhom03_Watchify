import PopularWatches from "../../components/PopularWatches";
import icon from "../../assets/icon-filter.png";
import banner from "../../assets/banner_Men.png";

import useWatchesData from "../../apiservice/useWathes";

const SkeletonLoader = () => (
  <div className="grid gap-6 mx-20 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
    {[...Array(12)].map((_, index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <div className="w-48 h-48 bg-gray-200 animate-pulse" />
        <div className="w-40 h-4 bg-gray-200 mt-2 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 mt-2 animate-pulse" />
      </div>
    ))}
  </div>
);

const MenPage = () => {
  const { data, loading, page, setPage, totalPages } = useWatchesData(1, 4);
  const maleWatches = data.male;
  console.log("Data từ useWatchesData:", data);
  console.log("maleWatches:", maleWatches);
  console.log("totalPages:", totalPages);
  if (loading) {
    return (
      <div className="container mt-4 mb-20 mx-auto">
        <p className="flex justify-center [color:#6B6B6B] text-3xl font-bold">
          Đồng hồ nam đẹp chính hãng, cao cấp, mẫu mới 2025, góp 0%
        </p>
        <img
          src={banner}
          alt="Banner"
          className="mx-auto my-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-transform duration-300"
        />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-20 mx-auto">
      <p className="flex justify-center [color:#6B6B6B] text-3xl font-bold">
        Đồng hồ nam đẹp chính hãng, cao cấp, mẫu mới 2025, góp 0%
      </p>
      <img
        src={banner}
        alt="Banner"
        className="mx-auto my-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-transform duration-300"
      />
      <p className="flex justify-center [color:#9E9E9E] text-2xl">
        Những mẫu đồng hồ nam đẹp luôn là món phụ kiện thời trang hoàn hảo cho
        tất cả các dịp, giúp nam giới tự tin hơn – khẳng định phong cách...
      </p>
      <div className="border-t border-gray-300 my-8"></div>
      <div className="relative">
        <div className="absolute top-0 right-0 flex items-center bg-white shadow-md rounded-lg px-4 py-2 border-2 border-gray-300">
          <img src={icon} alt="Bộ lọc" className="w-6 h-6 mr-2" />
          <span className="text-gray-700 font-medium">Bộ lọc</span>
        </div>
        <PopularWatches watches={maleWatches} title="" />
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 mx-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Trang trước
          </button>
          <span className="text-gray-700">
            Trang {page} / {totalPages?.male}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages?.male}
            className="px-4 py-2 mx-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenPage;
