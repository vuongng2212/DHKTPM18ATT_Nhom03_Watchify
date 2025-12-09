# Reviews Management - Quản lý Đánh giá Sản phẩm

## Tổng quan

Module quản lý đánh giá sản phẩm cho admin, cho phép duyệt hoặc từ chối các đánh giá từ khách hàng.

## Tính năng

### 1. Xem danh sách đánh giá chờ duyệt
- Hiển thị tất cả đánh giá có trạng thái `PENDING`
- Thông tin hiển thị:
  - ID sản phẩm
  - Tên người đánh giá
  - Số sao đánh giá (1-5)
  - Tiêu đề
  - Trạng thái (Chờ duyệt/Đã duyệt/Đã từ chối)
  - Ngày tạo

### 2. Xem chi tiết đánh giá
- Modal hiển thị đầy đủ thông tin:
  - Sản phẩm ID (có thể copy)
  - Người đánh giá
  - Đánh giá sao
  - Tiêu đề đánh giá
  - Nội dung chi tiết
  - Trạng thái
  - Ngày tạo & cập nhật

### 3. Duyệt đánh giá
- Admin có thể duyệt đánh giá
- Đánh giá đã duyệt sẽ hiển thị trên trang sản phẩm
- Có confirmation dialog trước khi duyệt

### 4. Từ chối đánh giá
- Admin có thể từ chối đánh giá không phù hợp
- Đánh giá bị từ chối sẽ không hiển thị
- Có confirmation dialog trước khi từ chối

## API Endpoints

### GET `/api/v1/reviews/pending`
Lấy danh sách đánh giá chờ duyệt (chỉ admin)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "userId": "uuid",
      "userFullName": "Nguyễn Văn A",
      "rating": 5,
      "title": "Sản phẩm tuyệt vời",
      "content": "Rất hài lòng với chất lượng...",
      "status": "PENDING",
      "helpfulCount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### PUT `/api/v1/reviews/{reviewId}/approve`
Duyệt đánh giá (chỉ admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Review approved successfully"
}
```

### PUT `/api/v1/reviews/{reviewId}/reject`
Từ chối đánh giá (chỉ admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Review rejected successfully"
}
```

## Component Structure

```
ReviewsManagement/
├── ReviewsManagement.jsx    # Main component
├── index.js                 # Export file
└── README.md               # Documentation
```

## Cách sử dụng

### Trong Dashboard

1. Component đã được tích hợp vào Dashboard
2. Truy cập qua tab "Đánh giá" (icon ⭐)
3. Chỉ admin mới có quyền truy cập

### Standalone

```jsx
import ReviewsManagement from './ReviewsManagement/ReviewsManagement';

function AdminPage() {
  return (
    <div>
      <ReviewsManagement />
    </div>
  );
}
```

## States

- `reviews` - Danh sách đánh giá
- `loading` - Trạng thái loading khi fetch data
- `selectedReview` - Đánh giá được chọn để xem chi tiết
- `detailModalVisible` - Hiển thị/ẩn modal chi tiết
- `actionLoading` - Trạng thái loading khi approve/reject

## Dependencies

- `antd` - UI components (Table, Button, Modal, Rate, Card, Typography, Spin, Tag, Space, message)
- `@ant-design/icons` - Icons (CheckOutlined, CloseOutlined, EyeOutlined)
- `../../../services/api` - API functions

## Phân quyền

- Chỉ user có role `ROLE_ADMIN` mới được truy cập
- Backend sẽ verify token và role trước khi thực hiện action
- Frontend có check role ở Dashboard component

## Best Practices

1. **Luôn có confirmation** trước khi approve/reject
2. **Reload danh sách** sau khi thực hiện action thành công
3. **Hiển thị error message** chi tiết từ backend
4. **Loading states** để UX tốt hơn
5. **Pagination** cho danh sách dài

## Troubleshooting

### Không thấy danh sách đánh giá
- Kiểm tra user có role admin không
- Kiểm tra token authentication
- Kiểm tra backend API endpoint
- Mở Console để xem error logs

### Không approve/reject được
- Kiểm tra permission
- Kiểm tra reviewId có đúng không
- Kiểm tra network request trong DevTools

### Modal không hiển thị
- Kiểm tra `detailModalVisible` state
- Kiểm tra `selectedReview` có data không

## Future Improvements

1. [ ] Thêm filter theo trạng thái (All, Pending, Approved, Rejected)
2. [ ] Thêm search theo tên người dùng hoặc sản phẩm
3. [ ] Hiển thị tên sản phẩm thay vì ID
4. [ ] Thêm bulk actions (approve/reject nhiều reviews cùng lúc)
5. [ ] Export danh sách reviews ra Excel/CSV
6. [ ] Thống kê số lượng reviews theo trạng thái
7. [ ] Gửi email thông báo cho user khi review được duyệt/từ chối
8. [ ] Thêm tính năng reply review từ admin

## Version History

- **v1.0.0** (2024) - Initial release
  - Xem danh sách reviews chờ duyệt
  - Approve/Reject reviews
  - View chi tiết review