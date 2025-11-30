import Banner from "../../components/Banner";
import FeaturedCategory from "../../components/FeaturedCategory";
import PopularWatches from "../../components/PopularWatches";
import ProductCategories from "../../components/ProductCategory";
import SkeletonLoader from "../../components/SkeletonLoader";
import useWatchesData from "../../apiservice/useWathes";

const HomePage = () => {
  const { data, loading } = useWatchesData();

  return (
    <div className="container mt-4 mb-20 mx-auto pt-20">
      <Banner />
      <ProductCategories />
      <FeaturedCategory />

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <PopularWatches watches={data.male} title="ĐỒNG HỒ NAM MỚI NHẤT" />
        </>
      )}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <PopularWatches watches={data.female} title="ĐỒNG HỒ NỮ MỚI NHẤT" />
        </>
      )}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <PopularWatches
            watches={data.couple}
            title="ĐỒNG HỒ CẶP ĐÔI MỚI NHẤT"
          />
        </>
      )}
    </div>
  );
};

export default HomePage;
