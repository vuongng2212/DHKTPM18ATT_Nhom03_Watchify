# Sequence Diagrams - Watchify Backend

## 📋 Mục Lục

- [1. Authentication Flows](#1-authentication-flows)
- [2. Product & Catalog Flows](#2-product--catalog-flows)
- [3. Shopping Cart Flows](#3-shopping-cart-flows)
- [4. Order & Checkout Flows](#4-order--checkout-flows)
- [5. Payment Processing Flows](#5-payment-processing-flows)
- [6. Coupon & Promotion Flows](#6-coupon--promotion-flows)
- [7. Event-Driven Flows](#7-event-driven-flows)

---

## 1. Authentication Flows

### 1.1. User Registration

```mermaid
sequenceDiagram
    actor User
    participant Controller as AuthController
    participant Service as AuthService
    participant UserRepo as UserRepository
    participant RoleRepo as RoleRepository
    participant Encoder as PasswordEncoder
    participant DB as Database

    User->>Controller: POST /auth/register
    activate Controller
    Controller->>Controller: Validate request (@Valid)
    
    Controller->>Service: register(RegisterRequest)
    activate Service
    
    Service->>UserRepo: existsByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: false
    UserRepo-->>Service: false
    
    Service->>Encoder: encode(password)
    Encoder-->>Service: hashedPassword
    
    Service->>RoleRepo: findByName("CUSTOMER")
    RoleRepo->>DB: SELECT * FROM roles WHERE name = 'CUSTOMER'
    DB-->>RoleRepo: Role entity
    RoleRepo-->>Service: Role
    
    Service->>Service: Create User entity
    Service->>UserRepo: save(user)
    UserRepo->>DB: INSERT INTO users ...
    DB-->>UserRepo: Saved user
    UserRepo-->>Service: User
    
    Service-->>Controller: RegisterResponse
    deactivate Service
    Controller-->>User: 201 Created + UserDto
    deactivate Controller
```

**Error Cases**:
- Email already exists → 409 Conflict
- Validation errors → 400 Bad Request

---

### 1.2. User Login & JWT Generation

```mermaid
sequenceDiagram
    actor User
    participant Controller as AuthController
    participant Service as AuthService
    participant UserRepo as UserRepository
    participant Encoder as PasswordEncoder
    participant JwtProvider as JwtTokenProvider
    participant RefreshTokenRepo as RefreshTokenRepository
    participant DB as Database

    User->>Controller: POST /auth/login
    activate Controller
    
    Controller->>Service: login(LoginRequest)
    activate Service
    
    Service->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: User entity
    UserRepo-->>Service: User
    
    alt User not found
        Service-->>Controller: throw InvalidCredentialsException
        Controller-->>User: 401 Unauthorized
    end
    
    Service->>Encoder: matches(rawPassword, encodedPassword)
    Encoder-->>Service: true/false
    
    alt Password mismatch
        Service-->>Controller: throw InvalidCredentialsException
        Controller-->>User: 401 Unauthorized
    end
    
    alt User is not ACTIVE
        Service-->>Controller: throw AccountLockedException
        Controller-->>User: 403 Forbidden
    end
    
    Service->>JwtProvider: generateAccessToken(user)
    JwtProvider-->>Service: accessToken
    
    Service->>JwtProvider: generateRefreshToken(user)
    JwtProvider-->>Service: refreshToken
    
    Service->>Service: Create RefreshToken entity
    Service->>RefreshTokenRepo: save(refreshToken)
    RefreshTokenRepo->>DB: INSERT INTO refresh_tokens ...
    DB-->>RefreshTokenRepo: Saved
    
    Service-->>Controller: LoginResponse
    deactivate Service
    
    Controller-->>User: 200 OK + {accessToken, refreshToken, user}
    deactivate Controller
```

---

### 1.3. Refresh Token Flow

```mermaid
sequenceDiagram
    actor User
    participant Controller as AuthController
    participant Service as AuthService
    participant RefreshTokenRepo as RefreshTokenRepository
    participant JwtProvider as JwtTokenProvider

    User->>Controller: POST /auth/refresh<br/>{refreshToken}
    
    Controller->>Service: refreshAccessToken(refreshToken)
    
    Service->>RefreshTokenRepo: findByToken(refreshToken)
    RefreshTokenRepo-->>Service: RefreshToken entity
    
    alt Token not found or expired
        Service-->>Controller: throw InvalidTokenException
        Controller-->>User: 401 Unauthorized
    end
    
    Service->>JwtProvider: generateAccessToken(user)
    JwtProvider-->>Service: new accessToken
    
    Service-->>Controller: LoginResponse
    Controller-->>User: 200 OK + {new accessToken}
```

---

### 1.4. Authenticated Request Flow

```mermaid
sequenceDiagram
    actor User
    participant Filter as JwtAuthenticationFilter
    participant Provider as JwtTokenProvider
    participant Security as SecurityContext
    participant Controller as AnyController
    participant Service as AnyService

    User->>Filter: HTTP Request<br/>Authorization: Bearer {token}
    
    Filter->>Provider: validateToken(token)
    Provider-->>Filter: valid/invalid
    
    alt Invalid token
        Filter-->>User: 401 Unauthorized
    else Valid token
        Filter->>Provider: getUserIdFromToken(token)
        Provider-->>Filter: userId
        
        Filter->>Filter: Create Authentication object
        Filter->>Security: setAuthentication(auth)
        
        Filter->>Controller: Proceed to controller
        Controller->>Service: Process request
        Service-->>Controller: Result
        Controller-->>User: Response
    end
```

---

## 2. Product & Catalog Flows

### 2.1. Browse Products with Filters

```mermaid
sequenceDiagram
    actor User
    participant Controller as ProductController
    participant Service as ProductService
    participant Spec as ProductSpecification
    participant Repo as ProductRepository
    participant DB as Database

    User->>Controller: GET /products?categoryId=xxx&minPrice=100&maxPrice=500&sort=price,asc&page=0&size=20
    
    Controller->>Service: getProducts(filter, pageable)
    
    Service->>Spec: Build specifications
    Note over Spec: hasCategory(categoryId)<br/>AND hasPriceBetween(100, 500)<br/>AND hasStatus(ACTIVE)
    
    Spec-->>Service: Specification<Product>
    
    Service->>Repo: findAll(spec, pageable)
    Repo->>DB: SELECT * FROM products<br/>WHERE category_id = ? AND price BETWEEN ? AND ?<br/>AND status = 'ACTIVE'<br/>ORDER BY price ASC<br/>LIMIT 20 OFFSET 0
    
    DB-->>Repo: List<Product>
    Repo-->>Service: Page<Product>
    
    Service->>Service: Map to DTOs
    Service-->>Controller: Page<ProductDto>
    
    Controller-->>User: 200 OK + {content, totalPages, totalElements, ...}
```

---

### 2.2. View Product Detail

```mermaid
sequenceDiagram
    actor User
    participant Controller as ProductController
    participant Service as ProductService
    participant Repo as ProductRepository
    participant DB as Database

    User->>Controller: GET /products/{id}
    
    Controller->>Service: getProductById(id)
    
    Service->>Repo: findById(id)
    Repo->>DB: SELECT p.*, c.*, b.*, pd.*, pi.*<br/>FROM products p<br/>JOIN categories c ON p.category_id = c.id<br/>JOIN brands b ON p.brand_id = b.id<br/>LEFT JOIN product_details pd ON p.id = pd.product_id<br/>LEFT JOIN product_images pi ON p.id = pi.product_id
    
    DB-->>Repo: Product (with eager loaded data)
    Repo-->>Service: Optional<Product>
    
    alt Product not found
        Service-->>Controller: throw ResourceNotFoundException
        Controller-->>User: 404 Not Found
    end
    
    Service->>Service: Increment view count
    Service->>Repo: save(product)
    Repo->>DB: UPDATE products SET view_count = view_count + 1
    
    Service->>Service: Map to ProductDto (with images, details, category, brand)
    Service-->>Controller: ProductDto
    
    Controller-->>User: 200 OK + ProductDto
```

---

## 3. Shopping Cart Flows

### 3.1. Add Product to Cart

```mermaid
sequenceDiagram
    actor User
    participant Controller as CartController
    participant Service as CartService
    participant CartRepo as CartRepository
    participant ItemRepo as CartItemRepository
    participant ProductRepo as ProductRepository
    participant DB as Database

    User->>Controller: POST /cart/items<br/>{productId, quantity}
    
    Controller->>Service: addItem(userId, productId, quantity)
    
    Service->>CartRepo: findByUserId(userId)
    CartRepo->>DB: SELECT * FROM carts WHERE user_id = ?
    
    alt Cart not found
        Service->>Service: Create new cart
        Service->>CartRepo: save(cart)
        CartRepo->>DB: INSERT INTO carts ...
    end
    
    Service->>ProductRepo: findById(productId)
    ProductRepo->>DB: SELECT * FROM products WHERE id = ?
    DB-->>ProductRepo: Product
    
    alt Product not available
        Service-->>Controller: throw ValidationException
        Controller-->>User: 400 Bad Request
    end
    
    Service->>ItemRepo: findByCartIdAndProductId(cartId, productId)
    
    alt Item already in cart
        Service->>Service: Update quantity
        Service->>ItemRepo: save(cartItem)
        ItemRepo->>DB: UPDATE cart_items SET quantity = quantity + ?
    else New item
        Service->>Service: Create cart item
        Service->>ItemRepo: save(cartItem)
        ItemRepo->>DB: INSERT INTO cart_items ...
    end
    
    Service->>Service: Map to CartDto
    Service-->>Controller: CartDto
    Controller-->>User: 200 OK + CartDto
```

---

## 4. Order & Checkout Flows

### 4.1. Create Order from Cart (Authenticated User)

```mermaid
sequenceDiagram
    actor User
    participant Controller as OrderController
    participant OrderService as OrderService
    participant CartService as CartService
    participant CouponService as CouponService
    participant InventoryService as InventoryService
    participant EventPublisher as ApplicationEventPublisher
    participant OrderRepo as OrderRepository
    participant DB as Database

    User->>Controller: POST /orders<br/>{couponCode?, paymentMethod, addressId, ...}
    
    Controller->>OrderService: createDirect(request, user)
    activate OrderService
    
    OrderService->>CartService: getCart(userId)
    CartService-->>OrderService: CartDto
    
    alt Cart is empty
        OrderService-->>Controller: throw ValidationException
        Controller-->>User: 400 Bad Request
    end
    
    opt Coupon provided
        OrderService->>CouponService: validateCoupon(code, userId, totalAmount)
        CouponService-->>OrderService: ValidateCouponResponse
        
        alt Coupon invalid
            OrderService-->>Controller: throw ValidationException
            Controller-->>User: 400 Bad Request
        end
        
        OrderService->>OrderService: Calculate discount
    end
    
    OrderService->>OrderService: Create Order entity
    OrderService->>OrderService: Create OrderItems from CartItems
    OrderService->>OrderService: Calculate final amount
    
    loop For each OrderItem
        OrderService->>InventoryService: reserve(productId, quantity)
        activate InventoryService
        InventoryService->>InventoryService: Check availability
        
        alt Insufficient stock
            InventoryService-->>OrderService: throw InsufficientStockException
            OrderService-->>Controller: throw ValidationException
            Controller-->>User: 400 Bad Request
        end
        
        InventoryService->>DB: UPDATE inventories SET reserved_quantity = reserved_quantity + ?
        deactivate InventoryService
    end
    
    OrderService->>OrderRepo: save(order)
    OrderRepo->>DB: INSERT INTO orders ...<br/>INSERT INTO order_items ...
    DB-->>OrderRepo: Saved order
    
    opt Coupon used
        OrderService->>CouponService: recordUsage(couponId, userId, orderId)
        CouponService->>DB: INSERT INTO coupon_usages ...<br/>UPDATE coupons SET used_count = used_count + 1
    end
    
    OrderService->>CartService: clearCart(userId)
    CartService->>DB: DELETE FROM cart_items WHERE cart_id = ?
    
    OrderService->>EventPublisher: publishEvent(OrderCreatedEvent)
    
    OrderService-->>Controller: OrderDto
    deactivate OrderService
    Controller-->>User: 201 Created + OrderDto
```

---

### 4.2. Guest Checkout

```mermaid
sequenceDiagram
    actor Guest
    participant Controller as OrderController
    participant Service as OrderService
    participant InventoryService as InventoryService
    participant DB as Database

    Guest->>Controller: POST /orders/guest<br/>{items[], guestEmail, guestName, shippingAddress, ...}
    
    Controller->>Service: createGuestOrder(request)
    
    Service->>Service: Validate request
    Service->>Service: Create Order (user_id = null)
    Service->>Service: Set guest info
    
    loop For each item
        Service->>InventoryService: check availability & reserve
        InventoryService-->>Service: reserved
    end
    
    Service->>DB: INSERT INTO orders (user_id = NULL, guest_email = ?, ...)
    DB-->>Service: Order created
    
    Service-->>Controller: OrderDto
    Controller-->>Guest: 201 Created + OrderDto + Payment URL
```

---

## 5. Payment Processing Flows

### 5.1. MoMo Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant OrderController
    participant OrderService
    participant PaymentController
    participant PaymentService
    participant MomoGateway as MomoPaymentGatewayService
    participant MomoAPI as MoMo API
    participant EventPublisher
    participant DB

    User->>Frontend: Select MoMo payment
    Frontend->>OrderController: POST /orders (paymentMethod=EWALLET)
    OrderController->>OrderService: createDirect(...)
    OrderService->>DB: Create order (status=PENDING)
    OrderService-->>OrderController: OrderDto
    
    OrderController->>PaymentService: createPayment(orderId)
    activate PaymentService
    
    PaymentService->>DB: INSERT INTO payments (status=PENDING)
    
    PaymentService->>MomoGateway: createPayment(order)
    activate MomoGateway
    
    MomoGateway->>MomoGateway: Build request parameters
    MomoGateway->>MomoGateway: Generate HMAC-SHA256 signature
    MomoGateway->>MomoAPI: POST /v2/gateway/api/create
    MomoAPI-->>MomoGateway: {payUrl, qrCodeUrl}
    deactivate MomoGateway
    
    PaymentService-->>OrderController: MomoPaymentResponse {payUrl}
    deactivate PaymentService
    
    OrderController-->>Frontend: {orderId, payUrl}
    Frontend-->>User: Redirect to payUrl
    
    User->>MomoAPI: Complete payment in MoMo app
    
    Note over MomoAPI,PaymentController: Async callback
    
    MomoAPI->>PaymentController: POST /payments/ipn/{orderId}<br/>{resultCode, transactionId, signature, ...}
    activate PaymentController
    
    PaymentController->>PaymentService: processPaymentIPN(orderId, params)
    activate PaymentService
    
    PaymentService->>MomoGateway: verifyPayment(params)
    MomoGateway->>MomoGateway: Verify signature
    MomoGateway-->>PaymentService: true/false
    
    alt Signature invalid
        PaymentService-->>PaymentController: throw SecurityException
        PaymentController-->>MomoAPI: 400 Bad Request
    end
    
    alt resultCode = 0 (Success)
        PaymentService->>DB: UPDATE payments SET status='COMPLETED', transaction_id=?
        PaymentService->>DB: UPDATE orders SET status='CONFIRMED'
        
        PaymentService->>EventPublisher: publishEvent(PaymentSuccessEvent)
        
        Note over EventPublisher: InventoryEventListener listens
        EventPublisher->>InventoryService: confirmReservation()
        InventoryService->>DB: UPDATE inventories<br/>SET quantity = quantity - ?,<br/>reserved_quantity = reserved_quantity - ?
        
    else resultCode != 0 (Failed)
        PaymentService->>DB: UPDATE payments SET status='FAILED'
        PaymentService->>DB: UPDATE orders SET status='CANCELLED'
        
        PaymentService->>EventPublisher: publishEvent(PaymentFailedEvent)
        
        EventPublisher->>InventoryService: releaseReservation()
        InventoryService->>DB: UPDATE inventories<br/>SET reserved_quantity = reserved_quantity - ?
    end
    
    PaymentService-->>PaymentController: Success
    deactivate PaymentService
    PaymentController-->>MomoAPI: 200 OK
    deactivate PaymentController
    
    MomoAPI->>Frontend: Redirect to return_url
    Frontend-->>User: Order confirmation page
```

---

### 5.2. Payment Callback (Return URL)

```mermaid
sequenceDiagram
    actor User
    participant MomoAPI as MoMo App
    participant PaymentController
    participant PaymentService
    participant Frontend

    User->>MomoAPI: Complete payment
    MomoAPI->>PaymentController: GET /payments/return?orderId=...&resultCode=...&signature=...
    
    PaymentController->>PaymentService: processPaymentReturn(params)
    PaymentService->>PaymentService: Verify signature
    PaymentService->>PaymentService: Get order & payment status from DB
    PaymentService-->>PaymentController: PaymentDto
    
    alt Payment success
        PaymentController-->>Frontend: Redirect to /order-success/{orderId}
    else Payment failed
        PaymentController-->>Frontend: Redirect to /order-failed/{orderId}
    end
    
    Frontend-->>User: Display result
```

---

## 6. Coupon & Promotion Flows

### 6.1. Validate Coupon

```mermaid
sequenceDiagram
    actor User
    participant Controller as CouponController
    participant Service as CouponService
    participant CouponRepo as CouponRepository
    participant UsageRepo as CouponUsageRepository
    participant DB as Database

    User->>Controller: POST /coupons/validate<br/>{code, orderAmount}
    
    Controller->>Service: validateCoupon(code, userId, orderAmount)
    
    Service->>CouponRepo: findByCode(code)
    CouponRepo->>DB: SELECT * FROM coupons WHERE code = ?
    DB-->>CouponRepo: Coupon
    
    alt Coupon not found
        Service-->>Controller: ValidateCouponResponse {valid=false, message}
        Controller-->>User: 200 OK + {valid: false}
    end
    
    Service->>Service: coupon.isValid()
    Note over Service: Check: isActive, validFrom/To, usageLimit
    
    alt Coupon not valid
        Service-->>Controller: ValidateCouponResponse {valid=false}
        Controller-->>User: 200 OK + {valid: false}
    end
    
    Service->>Service: coupon.canApplyToOrder(orderAmount)
    Note over Service: Check: minOrderAmount
    
    alt Order amount too low
        Service-->>Controller: ValidateCouponResponse {valid=false}
        Controller-->>User: 200 OK + {valid: false}
    end
    
    Service->>UsageRepo: countByUserIdAndCouponId(userId, couponId)
    UsageRepo->>DB: SELECT COUNT(*) FROM coupon_usages WHERE user_id = ? AND coupon_id = ?
    DB-->>UsageRepo: count
    
    alt Per-user limit exceeded
        Service-->>Controller: ValidateCouponResponse {valid=false}
        Controller-->>User: 200 OK + {valid: false}
    end
    
    Service->>Service: Calculate discount amount
    Service-->>Controller: ValidateCouponResponse {valid=true, discountAmount}
    Controller-->>User: 200 OK + {valid: true, discount: X}
```

---

## 7. Event-Driven Flows

### 7.1. Order Created Event Flow

```mermaid
sequenceDiagram
    participant OrderService
    participant EventPublisher as ApplicationEventPublisher
    participant InventoryListener as InventoryEventListener
    participant InventoryService
    participant DB

    OrderService->>EventPublisher: publishEvent(OrderCreatedEvent)
    
    Note over EventPublisher: Synchronous by default in Spring
    
    EventPublisher->>InventoryListener: onOrderCreated(event)
    activate InventoryListener
    
    InventoryListener->>InventoryService: reserveForOrder(orderId)
    activate InventoryService
    
    InventoryService->>DB: Get order items
    DB-->>InventoryService: OrderItems
    
    loop For each item
        InventoryService->>DB: UPDATE inventories<br/>SET reserved_quantity = reserved_quantity + ?<br/>WHERE product_id = ?
    end
    
    InventoryService-->>InventoryListener: Reserved
    deactivate InventoryService
    deactivate InventoryListener
```

---

### 7.2. Payment Success Event Flow

```mermaid
sequenceDiagram
    participant PaymentService
    participant EventPublisher
    participant OrderListener as OrderEventListener
    participant OrderService
    participant InventoryListener
    participant InventoryService
    participant DB

    PaymentService->>EventPublisher: publishEvent(PaymentSuccessEvent)
    
    par Parallel event handling
        EventPublisher->>OrderListener: onPaymentSuccess(event)
        activate OrderListener
        
        OrderListener->>OrderService: updateOrderStatus(orderId, CONFIRMED)
        OrderService->>DB: UPDATE orders SET status='CONFIRMED'
        
        OrderListener-->>EventPublisher: Completed
        deactivate OrderListener
        
    and
        EventPublisher->>InventoryListener: onPaymentSuccess(event)
        activate InventoryListener
        
        InventoryListener->>InventoryService: confirmReservation(orderId)
        InventoryService->>DB: UPDATE inventories<br/>SET quantity = quantity - ?,<br/>reserved_quantity = reserved_quantity - ?
        
        InventoryListener-->>EventPublisher: Completed
        deactivate InventoryListener
    end
```

---

### 7.3. Payment Failed Event Flow

```mermaid
sequenceDiagram
    participant PaymentService
    participant EventPublisher
    participant OrderListener
    participant InventoryListener
    participant InventoryService
    participant DB

    PaymentService->>EventPublisher: publishEvent(PaymentFailedEvent)
    
    par
        EventPublisher->>OrderListener: onPaymentFailed(event)
        OrderListener->>DB: UPDATE orders SET status='CANCELLED'
    and
        EventPublisher->>InventoryListener: onPaymentFailed(event)
        InventoryListener->>InventoryService: releaseReservation(orderId)
        InventoryService->>DB: UPDATE inventories<br/>SET reserved_quantity = reserved_quantity - ?
    end
```

---

## 8. Review & Wishlist Flows

### 8.1. Submit Product Review

```mermaid
sequenceDiagram
    actor User
    participant Controller as ReviewController
    participant Service as ReviewService
    participant OrderRepo as OrderRepository
    participant ReviewRepo as ReviewRepository
    participant DB

    User->>Controller: POST /products/{productId}/reviews<br/>{rating, title, content}
    
    Controller->>Service: createReview(productId, userId, dto)
    
    Service->>OrderRepo: Check if user purchased product
    OrderRepo->>DB: SELECT COUNT(*) FROM orders o<br/>JOIN order_items oi ON o.id = oi.order_id<br/>WHERE o.user_id = ? AND oi.product_id = ?<br/>AND o.status = 'DELIVERED'
    
    alt User hasn't purchased
        Service-->>Controller: throw ValidationException
        Controller-->>User: 400 Bad Request
    end
    
    Service->>Service: Create Review (status=PENDING)
    Service->>ReviewRepo: save(review)
    ReviewRepo->>DB: INSERT INTO reviews (status='PENDING')
    
    Service-->>Controller: ReviewDto
    Controller-->>User: 201 Created + ReviewDto
```

---

## 9. Kết Luận

Sequence diagrams mô tả các flows quan trọng:

✅ **Authentication**: Registration, login, JWT refresh

✅ **Product Browsing**: Filter, search, view details

✅ **Shopping**: Add to cart, update cart

✅ **Checkout**: Create order, apply coupon, reserve inventory

✅ **Payment**: MoMo integration, callback handling, event publishing

✅ **Promotions**: Validate and apply coupons

✅ **Event-Driven**: Async processing với domain events

Các flows được thiết kế với:
- Error handling
- Transaction boundaries
- Event-driven architecture
- Security validation
- Business rule enforcement

---

**[◀ Quay lại Components](components.md)** | **[Tiếp theo: Database ▶](database.md)**
