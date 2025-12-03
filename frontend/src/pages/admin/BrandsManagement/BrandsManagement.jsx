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
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Image,
  Upload,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  TagsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import {
  getBrandsApi,
  createBrandApi,
  updateBrandApi,
  deleteBrandApi,
} from '../../../services/api';

const { Search } = Input;

const BrandsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    filterBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands, searchText]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await getBrandsApi();
      
      if (response && Array.isArray(response)) {
        setBrands(response);
        
        // Calculate statistics
        const activeCount = response.filter(b => b.active !== false).length;
        const inactiveCount = response.filter(b => b.active === false).length;
        
        setStats({
          total: response.length,
          active: activeCount,
          inactive: inactiveCount,
        });
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      message.error('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = [...brands];

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (brand) =>
          brand.ten?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredBrands(filtered);
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedBrand(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setSelectedBrand(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      logoUrl: record.logoUrl,
      websiteUrl: record.websiteUrl,
      active: record.active,
    });
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setModalMode('view');
    setSelectedBrand(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBrandApi(id);
      message.success('Xóa thương hiệu thành công');
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      message.error(error.response?.data?.message || 'Không thể xóa thương hiệu');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const brandData = {
        name: values.name || values.ten,
        description: values.description || values.moTa || '',
        logoUrl: values.logoUrl || '',
        websiteUrl: values.websiteUrl || '',
        active: values.active !== false,
      };
      
      if (modalMode === 'add') {
        await createBrandApi(brandData);
        message.success('Thêm thương hiệu thành công');
      } else if (modalMode === 'edit') {
        await updateBrandApi(selectedBrand.id, brandData);
        message.success('Cập nhật thương hiệu thành công');
      }
      
      setIsModalVisible(false);
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error('Không thể lưu thương hiệu');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleToggleVisibility = async (record) => {
    try {
      await updateBrandApi(record.id, {
        name: record.name,
        description: record.description,
        logoUrl: record.logoUrl,
        websiteUrl: record.websiteUrl,
        active: !record.active,
      });
      message.success('Cập nhật hiển thị thành công');
      fetchBrands();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      message.error('Không thể cập nhật hiển thị');
    }
  };

  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'ten',
      key: 'ten',
      width: 250,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TagsOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            {record.slug && (
              <div style={{ fontSize: 12, color: '#999' }}>/{record.slug}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999' }}>Chưa có mô tả</span>,
    },
    {
      title: 'Số sản phẩm',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record.soLuongSanPham || 0} SP</Tag>
      ),
    },
    {
      title: 'Hiển thị',
      dataIndex: 'hienThi',
      key: 'hienThi',
      width: 120,
      align: 'center',
      render: (hienThi, record) => (
        <Switch
          checked={hienThi !== false}
          onChange={() => handleToggleVisibility(record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
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
            title="Bạn có chắc muốn xóa thương hiệu này?"
            onConfirm={() => handleDelete(record._id)}
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
          Quản lý thương hiệu
        </h1>
        <p style={{ color: '#666', marginTop: 8 }}>
          Quản lý các thương hiệu đồng hồ
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng thương hiệu"
              value={stats.total}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Đang hiển thị"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Đã ẩn"
              value={stats.inactive}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={12}>
            <Search
              placeholder="Tìm theo tên thương hiệu..."
              allowClear
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm thương hiệu mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Brands Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredBrands}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredBrands.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} thương hiệu`,
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
            ? 'Thêm thương hiệu mới'
            : modalMode === 'edit'
            ? 'Chỉnh sửa thương hiệu'
            : 'Chi tiết thương hiệu'
        }
        open={isModalVisible}
        onOk={modalMode !== 'view' ? handleModalOk : handleModalCancel}
        onCancel={handleModalCancel}
        width={600}
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
        {modalMode === 'view' && selectedBrand ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ marginBottom: 16 }}>
                  <TagsOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                </div>
              </Col>
              <Col span={12}>
                <strong>Tên thương hiệu:</strong>
                <div>{selectedBrand.ten}</div>
              </Col>
              <Col span={12}>
                <strong>Slug:</strong>
                <div>{selectedBrand.slug || 'N/A'}</div>
              </Col>
              <Col span={12}>
                <strong>Số sản phẩm:</strong>
                <div>{selectedBrand.soLuongSanPham || 0} sản phẩm</div>
              </Col>
              <Col span={12}>
                <strong>Hiển thị:</strong>
                <div>
                  {selectedBrand.hienThi !== false ? (
                    <Tag color="green">Đang hiển thị</Tag>
                  ) : (
                    <Tag color="red">Đã ẩn</Tag>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <strong>Mô tả:</strong>
                <div style={{ marginTop: 8 }}>
                  {selectedBrand.moTa || 'Chưa có mô tả'}
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="ten"
              label="Tên thương hiệu"
              rules={[
                { required: true, message: 'Vui lòng nhập tên thương hiệu' },
                { max: 100, message: 'Tên thương hiệu không được quá 100 ký tự' },
              ]}
            >
              <Input placeholder="Nhập tên thương hiệu" prefix={<TagsOutlined />} />
            </Form.Item>
            
            <Form.Item
              name="moTa"
              label="Mô tả"
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả về thương hiệu"
                maxLength={500}
                showCount
              />
            </Form.Item>
            
            <Form.Item
              name="hienThi"
              label="Hiển thị trên website"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BrandsManagement;