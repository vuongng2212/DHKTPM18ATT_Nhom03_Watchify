import { useState, useEffect } from "react";
import axios from "axios";

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
    const formatData = (products) =>
      products.map((watch) => ({
        id: watch._id,
        images: watch.hinhAnh.map((img) => img.duLieuAnh || "default-image-url"),
        image: watch.hinhAnh[0]?.duLieuAnh || "default-image-url",
        name: watch.tenDH || "Không có tên",
        price: watch.giaBan || 0,
        category: watch.danhMuc || "Không rõ",
        moTa: watch.moTa || "",
        soLuong: watch.soLuong || 0,
        thuongHieu: watch.thuongHieu || "Không rõ",
        maDH: watch.maDH || "Không rõ",
      }));

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [maleRes, femaleRes, coupleRes] = await Promise.all([
          axios.get(
            `http://localhost:5004/api/product?page=${page}&limit=${limit}&danhMuc=Nam`
          ),
          axios.get(
            `http://localhost:5004/api/product?page=${page}&limit=${limit}&danhMuc=Nữ`
          ),
          axios.get(
            `http://localhost:5004/api/product?page=${page}&limit=${limit}&danhMuc=Couple`
          ),
        ]);

        setData({
          male: formatData(maleRes.data.productDatas || []),
          female: formatData(femaleRes.data.productDatas || []),
          couple: formatData(coupleRes.data.productDatas || []),
        });

        setTotalPages({
          male: maleRes.data.totalPages || 0,
          female: femaleRes.data.totalPages || 0,
          couple: coupleRes.data.totalPages || 0,
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
