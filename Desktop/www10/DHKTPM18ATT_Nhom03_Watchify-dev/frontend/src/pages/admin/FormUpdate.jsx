import React, { useState, useEffect } from "react";
import { getBrands } from "../../apiservice/apiBrand";
import { getProduct, updateProduct } from "../../apiservice/apiProduct";
import { useNavigate, useParams } from "react-router-dom";

const FormUpdate = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nam");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brandId, setBrandId] = useState("");
  const [images, setImages] = useState([]); // Lưu file ảnh mới
  const [oldImages, setOldImages] = useState([]); // Lưu danh sách ảnh cũ
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data.brands || []);
      } catch (error) {
        setError("Không thể tải danh sách thương hiệu.");
      }
    };

    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        console.log("API Response:", res);

        const product = res.productData; // Lấy đúng key

        if (!product) {
          setError("Không tìm thấy sản phẩm.");
          return;
        }

        setProductName(product.tenDH || "");
        setDescription(product.moTa || "");
        setCategory(product.danhMuc || "Nam");
        setPrice(product.giaBan || "");
        setQuantity(product.soLuong || "");
        setBrandId(product.thuongHieu || "");
        setOldImages(product.hinhAnh || []);
      } catch (error) {
        console.error("Error fetching product:", error.message);
        setError(
          error.response?.data?.message || "Không thể tải dữ liệu sản phẩm."
        );
      }
    };

    fetchBrands();
    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName || !description || !category || !price || !quantity || !brandId) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setSuccess(null);
      return;
    }

    try {
      // Tạo FormData để gửi dữ liệu và ảnh mới
      const formData = new FormData();
      formData.append("tenDH", productName);
      formData.append("giaBan", price);
      formData.append("soLuong", quantity);
      formData.append("thuongHieu", brandId);
      formData.append("danhMuc", category);
      formData.append("moTa", description);

      // Thêm ảnh mới vào FormData (nếu có)
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append("hinhAnh", image); // Tên field phải khớp với backend
        });
      }

      // Gọi API updateProduct
      const response = await updateProduct(id, formData);

      setSuccess("Cập nhật sản phẩm thành công!");
      setError(null);
      navigate("/admin");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm.");
      setSuccess(null);
    }
  };

  return (
    <div className="container mt-4 mb-20 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sửa Sản Phẩm</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-4 items-center">
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Nhập Tên Sản Phẩm"
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="Nhập Giá Bán"
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            placeholder="Nhập Số Lượng"
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập Mô Tả Sản Phẩm"
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />

          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn Thương Hiệu</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.ten}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Couple">Couple</option>
          </select>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full md:w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {oldImages.length > 0 && (
            <div className="mt-4 w-full md:w-1/2">
              <p className="font-semibold mb-1">Ảnh hiện có:</p>
              <div className="flex flex-wrap gap-3">
                {oldImages.map((img) => (
                  <div
                    key={img._id}
                    className="border rounded"
                  >
                    <img
                      src={img.duLieuAnh}
                      alt="Ảnh sản phẩm"
                      className="object-cover w-full h-full"
                      style={{ width: 100, height: 100 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cập nhật
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormUpdate;