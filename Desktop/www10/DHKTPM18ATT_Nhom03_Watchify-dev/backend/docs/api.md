# API Documentation - Watchify Backend

## 📋 Mục Lục

- [1. Tổng Quan](#1-tổng-quan)
- [2. Authentication](#2-authentication)
- [3. Products & Catalog](#3-products--catalog)
- [4. Shopping Cart](#4-shopping-cart)
- [5. Orders](#5-orders)
- [6. Coupons](#6-coupons)
- [7. Reviews & Wishlist](#7-reviews--wishlist)
- [8. Error Handling](#8-error-handling)

---

## 1. Tổng Quan

### 1.1. Base Information

| Property | Value |
|----------|-------|
| **Base URL** | `http://localhost:8888/api/v1` |
| **Protocol** | HTTP/HTTPS |
| **Content Type** | `application/json` |
| **Authentication** | Bearer JWT Token |
| **API Version** | v1 |

### 1.2. Common Headers

```http
Content-Type: application/json
Authorization: Bearer {token}
```

### 1.3. HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource thành công |
| 204 | No Content | Xóa thành công |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Token invalid/missing |
| 403 | Forbidden | Không có quyền |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Lỗi server |

---

## 2. Authentication

### 2.1. Register User

Đăng ký tài khoản mới.

**Endpoint**: `POST /auth/register`

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation**:
- `email`: Required, valid email format
- `password`: Required, min 8 characters
- `firstName`: Required
- `lastName`: Required

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "ACTIVE",
  "roles": ["CUSTOMER"],
  "createdAt": "2024-12-03T10:00:00Z"
}
```

**Error Responses**:

`400 Bad Request` - Email already exists:
```json
{
  "error": "Duplicate Resource",
  "message": "Email already exists",
  "timestamp": "2024-12-03T10:00:00Z"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8888/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

### 2.2. Login

Đăng nhập và nhận JWT tokens.

**Endpoint**: `POST /auth/login`

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["CUSTOMER"]
  }
}
```

**Error Responses**:

`401 Unauthorized` - Invalid credentials:
```json
{
  "error": "Invalid Credentials",
  "message": "Email or password is incorrect",
  "timestamp": "2024-12-03T10:00:00Z"
}
```

---

### 2.3. Get Current User

Lấy thông tin user hiện tại.

**Endpoint**: `GET /auth/me`

**Auth Required**: ✅ Yes (Bearer Token)

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0987654321",
  "status": "ACTIVE",
  "roles": ["CUSTOMER"],
  "createdAt": "2024-12-03T10:00:00Z"
}
```

---

### 2.4. Refresh Token

Làm mới access token.

**Endpoint**: `POST /auth/refresh`

**Auth Required**: ❌ No (nhưng cần refresh token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: `200 OK`
```json
{
  "token": "new_access_token",
  "refreshToken": "same_or_new_refresh_token",
  "type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["CUSTOMER"]
  }
}
```

---

### 2.5. Logout

Đăng xuất (invalidate refresh token).

**Endpoint**: `POST /auth/logout`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: `200 OK`

---

## 3. Products & Catalog

### 3.1. List Products

Lấy danh sách sản phẩm với filter, sort, pagination.

**Endpoint**: `GET /products`

**Auth Required**: ❌ No

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | int | Số trang (0-based) | `0` |
| size | int | Số items per page | `12` |
| sortBy | string | Sort field | `createdAt` |
| sortDirection | string | Sort direction | `desc` |
| keyword | string | Tìm kiếm theo tên | `rolex` |
| categoryId | uuid | Lọc theo category | `uuid` |
| brandId | uuid | Lọc theo brand | `uuid` |
| minPrice | decimal | Giá tối thiểu | `1000` |
| maxPrice | decimal | Giá tối đa | `5000` |
| status | enum | Trạng thái | `ACTIVE` |

**Response**: `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Rolex Submariner",
      "slug": "rolex-submariner",
      "sku": "ROL-SUB-001",
      "price": 10000.00,
      "originalPrice": 12000.00,
      "discountPercentage": 17,
      "status": "ACTIVE",
      "category": {
        "id": "uuid",
        "name": "Luxury Watches",
        "slug": "luxury-watches"
      },
      "brand": {
        "id": "uuid",
        "name": "Rolex",
        "slug": "rolex"
      },
      "viewCount": 1250,
      "isFeatured": true,
      "isNew": false
    }
  ],
  "currentPage": 0,
  "totalPages": 5,
  "totalElements": 100,
  "pageSize": 12,
  "hasNext": true,
  "hasPrevious": false
}
```

**cURL Example**:
```bash
curl "http://localhost:8888/api/v1/products?page=0&size=20&sort=price,asc&categoryId=xxx&minPrice=1000&maxPrice=5000"
```

---

### 3.2. Get Product Detail

Lấy chi tiết sản phẩm.

**Endpoint**: `GET /products/{id}`

**Auth Required**: ❌ No

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "name": "Rolex Submariner",
  "slug": "rolex-submariner",
  "sku": "ROL-SUB-001",
  "description": "Iconic diving watch...",
  "price": 10000.00,
  "originalPrice": 12000.00,
  "discountPercentage": 17,
  "status": "ACTIVE",
  "category": {
    "id": "uuid",
    "name": "Luxury Watches"
  },
  "brand": {
    "id": "uuid",
    "name": "Rolex",
    "logoUrl": "https://example.com/rolex-logo.png"
  },
  "images": [
    {
      "id": "uuid",
      "imageUrl": "https://example.com/rolex-1.jpg",
      "altText": "Rolex Submariner front view",
      "displayOrder": 1,
      "isMain": true
    },
    {
      "id": "uuid",
      "imageUrl": "https://example.com/rolex-2.jpg",
      "altText": "Rolex Submariner side view",
      "displayOrder": 2,
      "isMain": false
    }
  ],
  "detail": {
    "movement": "Automatic",
    "caseMaterial": "Stainless Steel",
    "caseDiameter": "40mm",
    "caseThickness": "12mm",
    "dialColor": "Black",
    "strapMaterial": "Stainless Steel",
    "strapColor": "Steel",
    "waterResistance": "300m",
    "crystal": "Sapphire",
    "weight": "155g",
    "powerReserve": "48h",
    "warranty": "5 years",
    "origin": "Switzerland",
    "gender": "Men",
    "additionalFeatures": "Date display, luminous hands"
  },
  "viewCount": 1250,
  "isFeatured": true,
  "isNew": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-12-01T00:00:00Z"
}
```

**Error Responses**:

`404 Not Found`:
```json
{
  "error": "Resource Not Found",
  "message": "Product not found with id: xxx",
  "timestamp": "2024-12-03T10:00:00Z"
}
```

---

### 3.3. Get Product by Slug

**Endpoint**: `GET /products/slug/{slug}`

**Auth Required**: ❌ No

**Example**: `GET /products/slug/rolex-submariner`

**Response**: Same as Get Product Detail

---

### 3.4. Search Products

**Endpoint**: `GET /products/search?q={keyword}`

**Auth Required**: ❌ No

**Response**: Paginated product list

---

### 3.5. Get Featured Products

**Endpoint**: `GET /products/featured`

**Auth Required**: ❌ No

**Response**: Array of featured products

---

### 3.6. Get New Products

**Endpoint**: `GET /products/new`

**Auth Required**: ❌ No

**Response**: Array of new products

---

### 3.7. Create Product (Admin)

**Endpoint**: `POST /products`

**Auth Required**: ✅ Yes (Admin only)

**Request Body**:
```json
{
  "name": "New Watch",
  "slug": "new-watch",
  "sku": "NW-001",
  "description": "Description...",
  "price": 5000.00,
  "originalPrice": 6000.00,
  "discountPercentage": 17,
  "categoryId": "uuid",
  "brandId": "uuid",
  "isFeatured": false,
  "isNew": true
}
```

**Response**: `201 Created` + Product object

---

### 3.8. Update Product (Admin)

**Endpoint**: `PUT /products/{id}`

**Auth Required**: ✅ Yes (Admin only)

**Response**: `200 OK` + Updated product

---

### 3.9. Delete Product (Admin)

**Endpoint**: `DELETE /products/{id}`

**Auth Required**: ✅ Yes (Admin only)

**Response**: `204 No Content`

---

## 4. Shopping Cart

### 4.1. Get Cart

Xem giỏ hàng hiện tại.

**Endpoint**: `GET /cart`

**Auth Required**: ✅ Yes

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Rolex Submariner",
      "productImage": "https://example.com/rolex.jpg",
      "price": 10000.00,
      "quantity": 2,
      "subtotal": 20000.00
    }
  ],
  "totalPrice": 20000.00,
  "totalItems": 2
}
```

---

### 4.2. Add Item to Cart

Thêm sản phẩm vào giỏ hàng.

**Endpoint**: `POST /cart/items`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Response**: `200 OK` + Updated cart

**Logic**:
- Nếu product đã có trong cart → Tăng quantity
- Nếu chưa có → Thêm mới

---

### 4.3. Update Item Quantity

**Endpoint**: `PUT /cart/items/{productId}`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response**: `200 OK` + Updated cart

---

### 4.4. Remove Item from Cart

**Endpoint**: `DELETE /cart/items/{productId}`

**Auth Required**: ✅ Yes

**Response**: `200 OK` + Updated cart

---

### 4.5. Clear Cart

**Endpoint**: `DELETE /cart`

**Auth Required**: ✅ Yes

**Response**: `200 OK` + Empty cart

---

## 5. Orders

### 5.1. Create Order

Tạo đơn hàng từ giỏ hàng.

**Endpoint**: `POST /orders`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "paymentMethod": "EWALLET",
  "shippingAddress": "123 Main St, City, Country",
  "billingAddress": "123 Main St, City, Country",
  "notes": "Please deliver before 5 PM",
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ]
}
```

**Validation**:
- Cart must not be empty
- All products must be in stock
- Shipping address required

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "orderNumber": "ORD-2024-001",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Rolex Submariner",
      "quantity": 1,
      "unitPrice": 10000.00,
      "totalPrice": 10000.00
    }
  ],
  "totalAmount": 10000.00,
  "total": 10000.00,
  "status": "PENDING",
  "paymentMethod": "EWALLET",
  "shippingAddress": "123 Main St, City, Country",
  "billingAddress": "123 Main St, City, Country",
  "notes": "Please deliver before 5 PM",
  "orderDate": "2024-12-03T10:00:00Z",
  "createdAt": "2024-12-03T10:00:00Z"
}
```

**Error Responses**:

`400 Bad Request` - Out of stock:
```json
{
  "error": "Validation Error",
  "message": "Product 'Rolex Submariner' is out of stock",
  "timestamp": "2024-12-03T10:00:00Z"
}
```

---

### 5.2. Create Guest Order

Tạo đơn hàng không cần đăng nhập.

**Endpoint**: `POST /orders/guest`

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "guestEmail": "guest@example.com",
  "guestName": "Guest User",
  "guestPhone": "0987654321",
  "shippingAddress": "123 Main St, City, Country",
  "paymentMethod": "COD",
  "notes": "Optional notes"
}
```

**Response**: `201 Created` + Order object

---

### 5.3. Get User Orders

Lịch sử đơn hàng của user.

**Endpoint**: `GET /orders`

**Auth Required**: ✅ Yes

**Query Parameters**:
- `page`: Page number (default 0)
- `size`: Page size (default 20)
- `status`: Filter by status

**Response**: `200 OK` + Paginated orders

---

### 5.4. Get Order Detail

**Endpoint**: `GET /orders/{orderId}`

**Auth Required**: ✅ Yes

**Response**: `200 OK` + Order detail

**Authorization**: User chỉ xem được order của mình

---

### 5.5. Update Order Status (Admin)

**Endpoint**: `PUT /orders/{orderId}/status`

**Auth Required**: ✅ Yes (Admin only)

**Request Body**:
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Transitions**:
- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → PROCESSING, CANCELLED
- PROCESSING → SHIPPED
- SHIPPED → DELIVERED

**Response**: `200 OK` + Updated order

---

### 5.6. Cancel Order

**Endpoint**: `PUT /orders/{orderId}/cancel`

**Auth Required**: ✅ Yes

**Conditions**:
- Status must be PENDING or CONFIRMED
- User can only cancel own orders

**Response**: `200 OK` + Cancelled order

---

## 6. Coupons

### 6.1. Validate Coupon

Kiểm tra coupon có hợp lệ không.

**Endpoint**: `POST /coupons/validate`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "code": "SUMMER2024",
  "orderAmount": 10000.00
}
```

**Response**: `200 OK`
```json
{
  "valid": true,
  "discountAmount": 500.00,
  "finalAmount": 9500.00,
  "message": "Coupon applied successfully"
}
```

**Invalid Coupon Response**:
```json
{
  "valid": false,
  "discountAmount": 0,
  "message": "Coupon has expired"
}
```

---

### 6.2. Get Active Coupons

**Endpoint**: `GET /coupons/active`

**Auth Required**: ❌ No

**Response**: `200 OK` + Array of active coupons

---

### 6.3. Get Valid Coupons for User

**Endpoint**: `GET /coupons/valid`

**Auth Required**: ✅ Yes

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "code": "SUMMER2024",
    "description": "Summer sale 500k off",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 500.00,
    "minOrderAmount": 5000.00,
    "maxDiscountAmount": 500.00,
    "validFrom": "2024-06-01T00:00:00Z",
    "validTo": "2024-08-31T23:59:59Z",
    "remainingUsage": 50
  }
]
```

---

### 6.4. Create Coupon (Admin)

**Endpoint**: `POST /admin/coupons`

**Auth Required**: ✅ Yes (Admin only)

**Request Body**:
```json
{
  "code": "NEWYEAR2025",
  "description": "New Year Sale 20% off",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderAmount": 3000.00,
  "maxDiscountAmount": 1000.00,
  "usageLimit": 100,
  "perUserLimit": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-01-31T23:59:59Z",
  "isActive": true
}
```

**Response**: `201 Created` + Coupon object

---

## 7. Reviews & Wishlist

### 7.1. Get Product Reviews

**Endpoint**: `GET /api/v1/reviews/products/{productId}`

**Auth Required**: ❌ No

**Query Parameters**:
- `page`, `size`: Pagination

**Response**: `200 OK` + Paginated reviews

---

### 7.2. Submit Review

**Endpoint**: `POST /api/v1/reviews`

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "productId": "uuid",
  "rating": 5,
  "title": "Excellent watch!",
  "content": "Great quality and design..."
}
```

**Validation**:
- User must have purchased this product
- Rating: 1-5

**Response**: `201 Created` + Review (status=PENDING)

---

### 7.3. Get Wishlist

**Endpoint**: `GET /wishlist`

**Auth Required**: ✅ Yes

**Response**: `200 OK` + Array of wishlist items

---

### 7.4. Add to Wishlist

**Endpoint**: `POST /wishlist/{productId}`

**Auth Required**: ✅ Yes

**Response**: `201 Created` + Wishlist item

**Note**: Có endpoint thứ 2 với notification preferences: `POST /wishlist/{productId}/preferences?notifyOnSale=true&notifyOnStock=true`

---

### 7.5. Remove from Wishlist

**Endpoint**: `DELETE /wishlist/{productId}`

**Auth Required**: ✅ Yes

**Response**: `204 No Content`

---

## 8. Error Handling

### 8.1. Standard Error Response

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-12-03T10:00:00Z",
  "path": "/api/v1/products/invalid-id"
}
```

### 8.2. Validation Error Response

```json
{
  "error": "Validation Error",
  "message": "Invalid request body",
  "timestamp": "2024-12-03T10:00:00Z",
  "fieldErrors": {
    "email": "must be a well-formed email address",
    "password": "size must be between 8 and 100"
  }
}
```

### 8.3. Common Error Types

| HTTP Code | Error Type | Description |
|-----------|------------|-------------|
| 400 | Validation Error | Invalid input data |
| 401 | Invalid Credentials | Login failed |
| 401 | Invalid Token | JWT token invalid/expired |
| 403 | Access Denied | Không có quyền |
| 404 | Resource Not Found | Entity không tồn tại |
| 409 | Duplicate Resource | Email/SKU đã tồn tại |
| 500 | Internal Server Error | Lỗi server |

---

## 9. Pagination & Sorting

### 9.1. Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 0 | Page number (0-based) |
| size | int | 20 | Items per page |

### 9.2. Sorting Parameter

**Format**: `sortBy={field}&sortDirection={asc|desc}`

**Examples**:
- `sortBy=price&sortDirection=asc` - Giá tăng dần
- `sortBy=createdAt&sortDirection=desc` - Mới nhất trước (default)
- `sortBy=name&sortDirection=asc` - Tên A-Z

**Note**: Products sử dụng `sortBy` và `sortDirection`, không dùng Spring's `sort` parameter.

### 9.3. Pagination Response

**Custom Format** (cho Products, Orders):
```json
{
  "products": [...],  // hoặc "orders": [...]
  "currentPage": 0,
  "totalPages": 5,
  "totalElements": 100,
  "pageSize": 12,
  "hasNext": true,
  "hasPrevious": false
}
```

**Standard Spring Page** (cho Reviews, Wishlist paginated):
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 5,
  "totalElements": 100,
  "first": true,
  "last": false
}
```

---

## 10. Kết Luận

API của Watchify cung cấp:

✅ **RESTful design** - Tuân thủ REST principles

✅ **Clear documentation** - Dễ hiểu và sử dụng

✅ **Comprehensive** - Cover tất cả use cases

✅ **Secure** - JWT authentication, role-based access

✅ **Flexible** - Filter, sort, pagination

✅ **Well-structured errors** - Consistent error responses

✅ **OpenAPI compliant** - Swagger documentation available

**Swagger UI**: http://localhost:8888/swagger-ui.html

---

**[◀ Quay lại Database](database.md)** | **[Về đầu README ▲](../README.md)**
