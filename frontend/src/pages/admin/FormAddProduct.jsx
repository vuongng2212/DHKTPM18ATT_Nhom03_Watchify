import React, { useState, useEffect } from "react";
import { getBrands } from "../../apiservice/apiBrand";
import { createProduct } from "../../apiservice/apiProduct"; // Đảm bảo đường dẫn chính xác
import { useNavigate } from "react-router-dom";

const FormAddProduct = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Nam");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brandId, setBrandId] = useState("");
  const [images, setImages] = useState([]); // Lưu nhiều file ảnh
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
 const navigate = useNavigate();
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data.brands || []);
      } catch (error) {
        setError("Không thể tải danh sách thương hiệu.");
      }
    };

    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !productName ||
      !description ||
      !category ||
      !price ||
      !quantity ||
      !brandId ||
      images.length === 0
    ) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setSuccess(null);
      return;
    }

    const formData = new FormData();
    formData.append("tenDH", productName);
    formData.append("giaBan", price);
    formData.append("soLuong", quantity);
    formData.append("thuongHieu", brandId);
    formData.append("danhMuc", category);
    formData.append("moTa", description);

    for (let i = 0; i < images.length; i++) {
      formData.append("hinhAnh", images[i]);
    }

    try {
      await createProduct(formData);
      setSuccess("Thêm sản phẩm thành công!");
      
      setError(null);

      // Reset form
      setProductName("");
      setDescription("");
      setCategory("Nam");
      setPrice("");
      setQuantity("");
      setBrandId("");
      setImages([]);
      alert("Thêm Mới Thành Công!")
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Lỗi khi thêm sản phẩm. Vui lòng thử lại.");
      setSuccess(null);
    }
  };

  return (
    <div className="container mt-4 mb-20 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thêm Mới Product</h1>

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

{/* Hiển thị tên file đã chọn */}
{images.length > 0 && (
  <div className="mt-2 w-full md:w-1/2 border p-2 rounded bg-gray-50">
    <p className="font-semibold mb-1">Ảnh đã chọn:</p>
    <ul className="list-disc list-inside text-sm text-gray-700">
      {images.map((file, index) => (
        <li key={index}>{file.name}</li>
      ))}
    </ul>
  </div>
)}



          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thêm
            </button>

             <button
              onClick={() => navigate("/admin")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormAddProduct;
