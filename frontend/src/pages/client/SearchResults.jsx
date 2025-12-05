import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Empty, Slider, Checkbox, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getProductsApi } from '../../services/api';
import ProductCard from '../../components/ProductCard';

const { Option } = Select;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(true);

  // Available options (these should ideally come from API)
  const brands = [
    { id: 'rolex', name: 'Rolex' },
    { id: 'omega', name: 'Omega' },
    { id: 'tissot', name: 'Tissot' },
    { id: 'seiko', name: 'Seiko' },
    { id: 'casio', name: 'Casio' },
  ];

  const categories = [
    { id: 'male', name: 'Nam' },
    { id: 'female', name: 'Nữ' },
    { id: 'couple', name: 'Cặp đôi' },
  ];

  useEffect(() => {
    if (query) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentPage, selectedBrands, selectedCategories, priceRange, sortBy, sortDirection]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
        keyword: query,
        sortBy,
        sortDirection,
      };

      if (selectedBrands.length > 0) {
        params.brandId = selectedBrands[0]; // Backend might support only one brandId
      }

      if (selectedCategories.length > 0) {
        params.categoryId = selectedCategories[0];
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
    setSelectedCategories([]);
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

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          <SearchOutlined className="mr-2" />
          Kết quả tìm kiếm: "{query}"
        </h1>
        <p className="text-gray-600">
          Tìm thấy {total} sản phẩm
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
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

            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Checkbox
                    key={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
                      }
                    }}
                  >
                    {category.name}
                  </Checkbox>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <Checkbox
                    key={brand.id}
                    checked={selectedBrands.includes(brand.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands([...selectedBrands, brand.id]);
                      } else {
                        setSelectedBrands(selectedBrands.filter((id) => id !== brand.id));
                      }
                    }}
                  >
                    {brand.name}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              icon={<FilterOutlined />}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="flex justify-center items-center mt-8 gap-4">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-gray-700">
                    Trang {currentPage} / {Math.ceil(total / pageSize)}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(total / pageSize)}
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

export default SearchResults;