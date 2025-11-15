import { useState, useEffect } from "react";
import createInstanceAxios from "../services/axios.customize";
import { formatProductsFromBackend } from "../utils/productMapper";

const axiosCatalog = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

const useWatchesData = (initialPage = 1, initialLimit = 10) => {
  const [data, setData] = useState({ male: [], female: [], couple: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState({
    male: 0,
    female: 0,
    couple: 0,
  });
  useEffect(() => {

    const formatData = (products) => {
      // Sử dụng helper function để định dạng sản phẩm
      const formattedProducts = formatProductsFromBackend(products);
      // Thêm image chính cho mỗi sản phẩm
      return formattedProducts.map(product => ({
        ...product,
        image: product.images?.[0]?.imageUrl || "https://via.placeholder.com/200x200?text=No+Image",
      }));
    };

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories dynamically instead of hardcoding
        const categoriesRes = await axiosCatalog.get('/api/v1/categories/active');
        const allCategories = categoriesRes || [];
        const mainCategories = allCategories.filter(cat => !cat.parentId);
        
        const categoryMap = {
          male: mainCategories.find(cat => cat.slug === 'dong-ho-nam')?.id,
          female: mainCategories.find(cat => cat.slug === 'dong-ho-nu')?.id,
          couple: mainCategories.find(cat => cat.slug === 'dong-ho-unisex')?.id,
        };

        const [maleRes, femaleRes, coupleRes] = await Promise.all([
          categoryMap.male ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.male, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
          categoryMap.female ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.female, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
          categoryMap.couple ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.couple, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
        ]);

        setData({
          male: formatData(maleRes?.products || []),
          female: formatData(femaleRes?.products || []),
          couple: formatData(coupleRes?.products || []),
        });

        setTotalPages({
          male: maleRes?.totalPages || 0,
          female: femaleRes?.totalPages || 0,
          couple: coupleRes?.totalPages || 0,
        });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [page, limit]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
  };
};

export default useWatchesData;
