import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  Upload,
  message,
  Popconfirm,
  Image,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { getProductsApi, createProductApi, updateProductApi, deleteProductApi, getBrandsApi, getCategoriesApi } from '../../../services/api';

const { Search } = Input;
const { Option } = Select;

const ProductsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  
  // Brands and Categories
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchBrandsAndCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchText, selectedCategory, selectedStatus]);

  const fetchBrandsAndCategories = async () => {
    try {
      // Fetch brands - backend returns array directly, not { brands: [] }
      const brandsResponse = await getBrandsApi({ page: 0, size: 100 });
      console.log('Brands API response:', brandsResponse);
      
      if (brandsResponse && Array.isArray(brandsResponse)) {
        setBrands(brandsResponse);
        console.log('Loaded brands:', brandsResponse);
      } else {
        console.warn('Brands response is not an array:', brandsResponse);
      }

      // Fetch categories - backend returns array directly, not { categories: [] }
      const categoriesResponse = await getCategoriesApi({ page: 0, size: 100 });
      console.log('Categories API response:', categoriesResponse);
      
      if (categoriesResponse && Array.isArray(categoriesResponse)) {
        setCategories(categoriesResponse);
        console.log('Loaded categories:', categoriesResponse);
      } else {
        console.warn('Categories response is not an array:', categoriesResponse);
      }
    } catch (error) {
      console.error('Error fetching brands/categories:', error);
      console.error('Error details:', error.response?.data);
      message.error('Không thể tải danh sách thương hiệu và danh mục: ' + (error.message || 'Unknown error'));
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductsApi({
        page: currentPage - 1,
        size: pageSize,
      });

      if (response && response.products) {
        setProducts(response.products);
        setTotal(response.totalElements || 0);
        
        // Calculate statistics
        const activeCount = response.products.filter(p => p.status === 'ACTIVE').length;
        const inactiveCount = response.products.filter(p => p.status === 'INACTIVE').length;
        const outOfStockCount = response.products.filter(p => p.status === 'OUT_OF_STOCK').length;
        
        setStats({
          total: response.totalElements || 0,
          active: activeCount,
          inactive: inactiveCount,
          outOfStock: outOfStockCount,
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.category?.id === selectedCategory
      );
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter((product) => product.status === selectedStatus);
    }

    setFilteredProducts(filtered);
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setSelectedProduct(record);
    form.setFieldsValue({
      name: record.name,
      sku: record.sku,
      price: record.price,
      comparePrice: record.comparePrice,
      description: record.description,
      shortDescription: record.shortDescription,
      categoryId: record.category?.id,
      brandId: record.brand?.id,
      status: record.status,
      isFeatured: record.isFeatured,
    });
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setModalMode('view');
    setSelectedProduct(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProductApi(id);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('=== Product Form Validation ===');
      console.log('Modal Mode:', modalMode);
      console.log('Form Values:', values);
      console.log('Images:', values.images);
      
      // Prepare data for API (matching backend CreateProductRequest)
      const productData = {
        name: values.name,
        shortDescription: values.shortDescription || '',
        description: values.description || '',
        price: values.price,
        originalPrice: values.originalPrice || values.price,
        discountPercentage: values.discountPercentage || 0,
        brandId: values.brandId, // Must be UUID
        categoryId: values.categoryId || null, // Optional UUID
        isFeatured: values.isFeatured || false,
        isNew: values.isNew || false,
        displayOrder: values.displayOrder || 0
      };
      
      console.log('Prepared Product Data:', productData);
      
      // Validate required fields
      if (!productData.name) {
        message.error('Vui lòng nhập tên sản phẩm');
        return;
      }
      if (!productData.price || productData.price <= 0) {
        message.error('Vui lòng nhập giá bán hợp lệ');
        return;
      }
      if (!productData.brandId) {
        message.error('Vui lòng chọn thương hiệu');
        return;
      }
      
      if (modalMode === 'add') {
        console.log('Creating new product...');
        const result = await createProductApi(productData, values.images);
        console.log('Create product result:', result);
        message.success('Thêm sản phẩm thành công');
      } else if (modalMode === 'edit') {
        console.log('Updating product:', selectedProduct.id);
        const result = await updateProductApi(selectedProduct.id, productData, values.images);
        console.log('Update product result:', result);
        message.success('Cập nhật sản phẩm thành công');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      console.error('=== Error Saving Product ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Không thể lưu sản phẩm';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Validation errors
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).join(', ');
        }
      }
      
      message.error(errorMessage);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images) => {
        const mainImage = images?.find(img => img.isMain) || images?.[0];
        return mainImage ? (
          <Image
            src={mainImage.imageUrl}
            alt="Product"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={{
              mask: <EyeOutlined />,
            }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            <ShoppingOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        );
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
    },
    {
      title: 'Thương hiệu',
      dataIndex: ['brand', 'name'],
      key: 'brand',
      width: 120,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right',
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#52c41a' }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(price)}
          </div>
          {record.comparePrice > price && (
            <div
              style={{
                fontSize: 12,
                color: '#999',
                textDecoration: 'line-through',
              }}
            >
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(record.comparePrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status) => {
        const statusConfig = {
          ACTIVE: { color: 'green', text: 'Hoạt động' },
          INACTIVE: { color: 'default', text: 'Ngừng bán' },
          OUT_OF_STOCK: { color: 'red', text: 'Hết hàng' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Nổi bật',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 100,
      align: 'center',
      render: (isFeatured) =>
        isFeatured ? (
          <Tag color="gold">Nổi bật</Tag>
        ) : (
          <Tag color="default">Thường</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Quản lý sản phẩm
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Quản lý danh sách sản phẩm đồng hồ
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Ngừng bán"
              value={stats.inactive}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Tìm theo tên hoặc SKU..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Danh mục"
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              <Option value="all">Tất cả danh mục</Option>
              <Option value="men">Đồng hồ nam</Option>
              <Option value="women">Đồng hồ nữ</Option>
              <Option value="couple">Đồng hồ đôi</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Ngừng bán</Option>
              <Option value="OUT_OF_STOCK">Hết hàng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm sản phẩm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      {/* Add/Edit/View Modal */}
      <Modal
        title={
          modalMode === 'add'
            ? 'Thêm sản phẩm mới'
            : modalMode === 'edit'
            ? 'Chỉnh sửa sản phẩm'
            : 'Chi tiết sản phẩm'
        }
        open={isModalVisible}
        onOk={modalMode !== 'view' ? handleModalOk : handleModalCancel}
        onCancel={handleModalCancel}
        width={800}
        okText={modalMode === 'add' ? 'Thêm' : modalMode === 'edit' ? 'Cập nhật' : 'Đóng'}
        cancelText={modalMode === 'view' ? null : 'Hủy'}
        okButtonProps={{
          loading: loading,
          style: modalMode === 'view' ? { display: 'none' } : {},
        }}
        cancelButtonProps={{
          style: modalMode === 'view' ? { display: 'none' } : {},
        }}
      >
        {modalMode === 'view' && selectedProduct ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ marginBottom: 16 }}>
                  <Image.PreviewGroup>
                    {selectedProduct.images?.map((img, index) => (
                      <Image
                        key={index}
                        src={img.imageUrl}
                        alt={img.altText}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', marginRight: 8, borderRadius: 8 }}
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </Col>
              <Col span={12}>
                <strong>Tên sản phẩm:</strong>
                <div>{selectedProduct.name}</div>
              </Col>
              <Col span={12}>
                <strong>SKU:</strong>
                <div>{selectedProduct.sku}</div>
              </Col>
              <Col span={12}>
                <strong>Giá bán:</strong>
                <div style={{ color: '#52c41a', fontWeight: 500 }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(selectedProduct.price)}
                </div>
              </Col>
              <Col span={12}>
                <strong>Danh mục:</strong>
                <div>{selectedProduct.category?.name}</div>
              </Col>
              <Col span={12}>
                <strong>Thương hiệu:</strong>
                <div>{selectedProduct.brand?.name}</div>
              </Col>
              <Col span={12}>
                <strong>Trạng thái:</strong>
                <div>
                  <Tag
                    color={
                      selectedProduct.status === 'ACTIVE'
                        ? 'green'
                        : selectedProduct.status === 'INACTIVE'
                        ? 'default'
                        : 'red'
                    }
                  >
                    {selectedProduct.status}
                  </Tag>
                </div>
              </Col>
              <Col span={24}>
                <strong>Mô tả ngắn:</strong>
                <div>{selectedProduct.shortDescription}</div>
              </Col>
              <Col span={24}>
                <strong>Mô tả chi tiết:</strong>
                <div>{selectedProduct.description}</div>
              </Col>
            </Row>
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="brandId"
                  label="Thương hiệu"
                  rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                >
                  <Select placeholder="Chọn thương hiệu" loading={brands.length === 0}>
                    {brands.map(brand => (
                      <Option key={brand.id} value={brand.id}>
                        {brand.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label="Danh mục"
                >
                  <Select placeholder="Chọn danh mục (không bắt buộc)" allowClear loading={categories.length === 0}>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập giá bán"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="originalPrice" 
                  label="Giá gốc"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập giá gốc (không bắt buộc)"
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="discountPercentage" 
                  label="Giảm giá (%)"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Nhập % giảm giá"
                    min={0}
                    max={100}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="shortDescription" label="Mô tả ngắn">
                  <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả chi tiết">
                  <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="images" label="Hình ảnh sản phẩm">
                  <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={() => false}
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isFeatured" label="Sản phẩm nổi bật">
                  <Select placeholder="Chọn" defaultValue={false}>
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isNew" label="Sản phẩm mới">
                  <Select placeholder="Chọn" defaultValue={false}>
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ProductsManagement;