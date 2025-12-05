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
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  
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
  }, [currentPage, pageSize, searchText, selectedCategory, selectedBrand, selectedStatus]);

  const fetchBrandsAndCategories = async () => {
    try {
      const brandsResponse = await getBrandsApi({ page: 0, size: 100 });
      console.log('Brands API response:', brandsResponse);
      
      if (Array.isArray(brandsResponse)) {
        setBrands(brandsResponse);
      } else if (brandsResponse?.brands && Array.isArray(brandsResponse.brands)) {
        setBrands(brandsResponse.brands);
      } else if (brandsResponse?.content && Array.isArray(brandsResponse.content)) {
        setBrands(brandsResponse.content);
      }

      const categoriesResponse = await getCategoriesApi({ page: 0, size: 100 });
      console.log('Categories API response:', categoriesResponse);
      
      if (Array.isArray(categoriesResponse)) {
        setCategories(categoriesResponse);
      } else if (categoriesResponse?.categories && Array.isArray(categoriesResponse.categories)) {
        setCategories(categoriesResponse.categories);
      } else if (categoriesResponse?.content && Array.isArray(categoriesResponse.content)) {
        setCategories(categoriesResponse.content);
      }
    } catch (error) {
      console.error('Error fetching brands and categories:', error);
      message.error('Không thể tải danh sách thương hiệu và danh mục');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
      };

      if (searchText) {
        params.keyword = searchText;
      }
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      if (selectedBrand) {
        params.brandId = selectedBrand;
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const response = await getProductsApi(params);

      if (response && response.products) {
        setProducts(response.products);
        setTotal(response.totalElements || 0);
        
        // Calculate statistics from total counts if available
        setStats({
          total: response.totalElements || 0,
          active: response.activeCount || 0,
          inactive: response.inactiveCount || 0,
          outOfStock: response.outOfStockCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
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
    } catch {
      message.error('Không thể xóa sản phẩm');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === 'view') {
        setIsModalVisible(false);
        return;
      }

      const productData = {
        name: values.name,
        shortDescription: values.shortDescription,
        description: values.description,
        price: values.price,
        originalPrice: values.comparePrice || values.price,
        discountPercentage: values.comparePrice ? Math.round(((values.comparePrice - values.price) / values.comparePrice) * 100) : 0,
        brandId: values.brandId,
        categoryId: values.categoryId,
        isFeatured: values.isFeatured || false,
        isNew: values.isNew || false,
        displayOrder: values.displayOrder || 0,
      };

      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      if (values.images && values.images.length > 0) {
        values.images.forEach(file => {
          if (file.originFileObj) {
            formData.append('hinhAnh', file.originFileObj);
          }
        });
      }

      if (modalMode === 'add') {
        await createProductApi(formData);
        message.success('Thêm sản phẩm thành công');
      } else if (modalMode === 'edit') {
        await updateProductApi(selectedProduct.id, formData);
        message.success('Cập nhật sản phẩm thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      
      let errorMessage = 'Có lỗi xảy ra khi lưu sản phẩm';
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.keys(errors).map(key => `${key}: ${errors[key]}`).join(', ');
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
      render: (images, record) => {
        const mainImage = images && images.length > 0 ? images[0].url : null;
        return mainImage ? (
          <Image
            src={mainImage}
            alt={record.name}
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
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category?.name || 'N/A',
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      render: (brand) => brand?.name || 'N/A',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right',
      render: (price, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#f5222d' }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(price)}
          </div>
          {record.comparePrice && record.comparePrice > price && (
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
          ACTIVE: { color: 'success', text: 'Hoạt động' },
          INACTIVE: { color: 'default', text: 'Ngừng bán' },
          OUT_OF_STOCK: { color: 'error', text: 'Hết hàng' },
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
      render: (isFeatured) => (
        <Tag color={isFeatured ? 'gold' : 'default'}>
          {isFeatured ? 'Có' : 'Không'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
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
              onSearch={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText('');
                  setCurrentPage(1);
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Danh mục"
              allowClear
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Thương hiệu"
              allowClear
              value={selectedBrand}
              onChange={(value) => {
                setSelectedBrand(value);
                setCurrentPage(1);
              }}
            >
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id}>{brand.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentPage(1);
              }}
            >
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Ngừng bán</Option>
              <Option value="OUT_OF_STOCK">Hết hàng</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={4} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              block
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={products}
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

      {/* Product Modal */}
      <Modal
        title={
          modalMode === 'add'
            ? 'Thêm sản phẩm mới'
            : modalMode === 'edit'
            ? 'Chỉnh sửa sản phẩm'
            : 'Chi tiết sản phẩm'
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText={modalMode === 'view' ? 'Đóng' : 'Lưu'}
        cancelText="Hủy"
        cancelButtonProps={{ style: { display: modalMode === 'view' ? 'none' : 'inline-block' } }}
      >
        {modalMode === 'view' && selectedProduct ? (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <Image.PreviewGroup>
                    {selectedProduct.images.map((img, index) => (
                      <Image
                        key={index}
                        src={img.url}
                        alt={selectedProduct.name}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', marginRight: 8, borderRadius: 8 }}
                      />
                    ))}
                  </Image.PreviewGroup>
                )}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Tên sản phẩm:</strong> {selectedProduct.name}</p>
                <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                <p><strong>Danh mục:</strong> {selectedProduct.category?.name || 'N/A'}</p>
                <p><strong>Thương hiệu:</strong> {selectedProduct.brand?.name || 'N/A'}</p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Giá:</strong>{' '}
                  <span style={{ color: '#f5222d', fontWeight: 500 }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(selectedProduct.price)}
                  </span>
                </p>
                <p><strong>Trạng thái:</strong> <Tag color={selectedProduct.status === 'ACTIVE' ? 'success' : 'default'}>{selectedProduct.status}</Tag></p>
                <p><strong>Nổi bật:</strong> {selectedProduct.isFeatured ? 'Có' : 'Không'}</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <p><strong>Mô tả ngắn:</strong></p>
                <p>{selectedProduct.shortDescription}</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <p><strong>Mô tả chi tiết:</strong></p>
                <p>{selectedProduct.description}</p>
              </Col>
            </Row>
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
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
                  name="sku"
                  label="SKU"
                  rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}
                >
                  <Input placeholder="Nhập mã SKU" disabled={modalMode === 'edit'} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="categoryId"
                  label="Danh mục"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select placeholder="Chọn danh mục">
                    {categories.map(cat => (
                      <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="brandId"
                  label="Thương hiệu"
                  rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                >
                  <Select placeholder="Chọn thương hiệu">
                    {brands.map(brand => (
                      <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Giá bán (VNĐ)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá bán"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="comparePrice" label="Giá so sánh (VNĐ)">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá so sánh"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                  <Select>
                    <Option value="ACTIVE">Hoạt động</Option>
                    <Option value="INACTIVE">Ngừng bán</Option>
                    <Option value="OUT_OF_STOCK">Hết hàng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="isFeatured" label="Sản phẩm nổi bật" valuePropName="checked">
                  <Select>
                    <Option value={true}>Có</Option>
                    <Option value={false}>Không</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="shortDescription" label="Mô tả ngắn">
              <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả chi tiết">
              <Input.TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
            </Form.Item>

            <Form.Item
              name="images"
              label="Hình ảnh sản phẩm"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e?.fileList;
              }}
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                multiple
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              </Upload>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ProductsManagement;