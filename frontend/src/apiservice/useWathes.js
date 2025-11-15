import { useState, useEffect } from "react";
import createInstanceAxios from "../services/axios.customize";

const axiosCatalog = createInstanceAxios('http://localhost:8888');

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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const res = await axiosCatalog.get('/api/v1/categories/active');
        console.log("Categories response:", res);
        setCategories(res || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      console.log("Categories empty, skipping product fetch");
      return;
    }

    const formatData = (products) =>
      products.map((product) => ({
        id: product.id,
        images: product.images?.map((img) => img.imageUrl) || [],
        image: product.images?.[0]?.imageUrl || "default-image-url",
        name: product.name || "Không có tên",
        price: product.price || 0,
        category: product.category?.name || "Không rõ",
        moTa: product.description || "",
        soLuong: 10, // mock
        thuongHieu: product.brand?.name || "Không rõ",
        maDH: product.sku || "Không rõ",
      }));

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const categoryMap = {
          male: categories.find(cat => cat.name === "Đồng hồ Nam")?.id,
          female: categories.find(cat => cat.name === "Đồng hồ Nữ")?.id,
          couple: categories.find(cat => cat.name === "Đồng hồ Unisex")?.id,
        };
        console.log("Category map:", categoryMap);

        const [maleRes, femaleRes, coupleRes] = await Promise.all([
          categoryMap.male ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.male, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
          categoryMap.female ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.female, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
          categoryMap.couple ? axiosCatalog.get('/api/v1/products', { params: { categoryId: categoryMap.couple, page: page - 1, size: limit } }) : Promise.resolve({ data: { products: [], totalPages: 0 } }),
        ]);

        console.log("Male res:", maleRes);
        console.log("Female res:", femaleRes);
        console.log("Couple res:", coupleRes);

        setData({
          male: formatData(maleRes.products || []),
          female: formatData(femaleRes.products || []),
          couple: formatData(coupleRes.products || []),
        });

        setTotalPages({
          male: maleRes.totalPages || 0,
          female: femaleRes.totalPages || 0,
          couple: coupleRes.totalPages || 0,
        });
        console.log("Final data:", { male: formatData(maleRes.products || []), female: formatData(femaleRes.products || []), couple: formatData(coupleRes.products || []) });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [page, limit, categories]);

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
