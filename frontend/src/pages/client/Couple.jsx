import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Empty, Slider, Checkbox, Select, Button, Drawer } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { getProductsApi, getBrandsApi } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import createInstanceAxios from '../../services/axios.customize';
import icon from "../../assets/icon-filter.png";
import banner from "../../assets/banner_Couple.png";

const axiosCatalog = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

const { Option } = Select;

const SkeletonLoader = () => (
  <div className="grid gap-6 mx-20 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
    {[...Array(12)].map((_, index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg" />
        <div className="w-40 h-4 bg-gray-200 mt-2 animate-pulse rounded" />
        <div className="w-20 h-4 bg-gray-200 mt-2 animate-pulse rounded" />
      </div>
    ))}
  </div>
);

const CouplePage = () => {
  const { brandSlug } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available brands from API
  const [brands, setBrands] = useState([]);
  const [coupleCategoryId, setCoupleCategoryId] = useState(null);

  useEffect(() => {
    fetchCoupleCategory();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (coupleCategoryId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedBrands, priceRange, sortBy, sortDirection, brandSlug, coupleCategoryId]);

  const fetchCoupleCategory = async () => {
    try {
      const response = await axiosCatalog.get('/api/v1/categories/active');
      const allCategories = response || [];
      const mainCategories = allCategories.filter(cat => !cat.parentId);
      const coupleCategory = mainCategories.find(cat => cat.slug === 'dong-ho-unisex');
      
      if (coupleCategory) {
        setCoupleCategoryId(coupleCategory.id);
      } else {
        console.error('Couple category not found');
      }
    } catch (error) {
      console.error('Error fetching couple category:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await getBrandsApi({ page: 0, size: 100 });
      if (Array.isArray(response)) {
        setBrands(response);
      } else if (response?.brands && Array.isArray(response.brands)) {
        setBrands(response.brands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
        sortBy,
        sortDirection,
      };

      // Filter by Couple category using categoryId
      if (coupleCategoryId) {
        params.categoryId = coupleCategoryId;
      }

      if (brandSlug) {
        const brand = brands.find(b => 
          (b.slug && b.slug === brandSlug) || 
          b.name?.toLowerCase().replace(/\s+/g, '-') === brandSlug
        );
        if (brand) {
          params.brandId = brand.id;
        }
      } else if (selectedBrands.length > 0) {
        params.brandId = selectedBrands[0];
      }

      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }

      if (priceRange[1] < 100000000) {
        params.maxPrice = priceRange[1];
      }

      const response = await getProductsApi(params);

      if (response && response.products) {
        setProducts(response.products);
        setTotal(response.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setPriceRange([0, 100000000]);
    setSelectedBrands([]);
    setSortBy('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const FilterContent = () => (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          <FilterOutlined className="mr-2" />
          Bộ lọc
        </h2>
        <Button size="small" onClick={handleResetFilters}>
          Xóa bộ lọc
        </Button>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sắp xếp
        </label>
        <Select
          value={`${sortBy}-${sortDirection}`}
          onChange={(value) => {
            const [by, direction] = value.split('-');
            setSortBy(by);
            setSortDirection(direction);
            setCurrentPage(1);
          }}
          className="w-full"
        >
          <Option value="createdAt-desc">Mới nhất</Option>
          <Option value="createdAt-asc">Cũ nhất</Option>
          <Option value="price-asc">Giá thấp đến cao</Option>
          <Option value="price-desc">Giá cao đến thấp</Option>
          <Option value="name-asc">Tên A-Z</Option>
          <Option value="name-desc">Tên Z-A</Option>
        </Select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng giá
        </label>
        <Slider
          range
          min={0}
          max={100000000}
          step={1000000}
          value={priceRange}
          onChange={setPriceRange}
          tooltip={{
            formatter: (value) => formatPrice(value),
          }}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Brands */}
      {!brandSlug && brands.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thương hiệu
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brands.map((brand) => (
              <Checkbox
                key={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBrands([brand.id]);
                  } else {
                    setSelectedBrands(selectedBrands.filter((id) => id !== brand.id));
                  }
                  setCurrentPage(1);
                }}
              >
                {brand.name}
              </Checkbox>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="container mt-4 mb-20 mx-auto px-4">
        <p className="flex justify-center text-gray-600 text-3xl font-bold mt-24">
          Đồng hồ cặp đôi chính hãng, cao cấp, mẫu mới 2025, góp 0%
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
    <div className="container mt-4 mb-20 mx-auto px-4">
      <p className="flex justify-center text-gray-600 text-3xl font-bold mt-24">
        Đồng hồ cặp đôi chính hãng, cao cấp, mẫu mới 2025, góp 0%
      </p>
      <img
        src={banner}
        alt="Banner"
        className="mx-auto my-4 rounded-2xl hover:shadow-lg hover:scale-105 transition-transform duration-300"
      />
      <p className="flex justify-center text-gray-400 text-xl mb-8 px-4">
        Những mẫu đồng hồ cặp đôi đẹp luôn là món phụ kiện thời trang hoàn hảo cho
        tất cả các dịp, giúp các cặp đôi tự tin hơn – khẳng định phong cách...
      </p>

      <div className="border-t border-gray-300 my-8"></div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className={`hidden lg:block ${showFilters ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="sticky top-24">
            <FilterContent />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="Bộ lọc"
          placement="left"
          onClose={() => setMobileFilterOpen(false)}
          open={mobileFilterOpen}
          width={300}
        >
          <FilterContent />
        </Drawer>

        {/* Products Section */}
        <div className="flex-1">
          {/* Filter Toggle Buttons */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              {/* Desktop Toggle */}
              <Button
                className="hidden lg:flex"
                onClick={() => setShowFilters(!showFilters)}
                icon={<FilterOutlined />}
              >
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </Button>

              {/* Mobile Toggle */}
              <Button
                className="lg:hidden flex items-center"
                onClick={() => setMobileFilterOpen(true)}
                icon={<img src={icon} alt="Filter" className="w-4 h-4" />}
              >
                Bộ lọc
              </Button>
            </div>

            <span className="text-gray-600">
              Tìm thấy {total} sản phẩm
            </span>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Empty
              description="Không tìm thấy sản phẩm nào"
              className="my-20"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <Button
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2"
                  >
                    Trang trước
                  </Button>
                  <span className="text-gray-700 font-medium">
                    Trang {currentPage} / {Math.ceil(total / pageSize)}
                  </span>
                  <Button
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === Math.ceil(total / pageSize)}
                    className="px-4 py-2"
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouplePage;