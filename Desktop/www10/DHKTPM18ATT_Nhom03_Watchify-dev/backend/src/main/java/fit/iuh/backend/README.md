# Watchify Backend - Modular Monolith Architecture

## 📁 Cấu trúc Package

```
fit.iuh.backend/
├── config/                          # Application-wide configuration
│   └── OpenApiConfig.java
│
├── sharedkernel/                    # Shared components across all modules
│   ├── domain/                      # Base entities and value objects
│   ├── exception/                   # Common exceptions
│   ├── event/                       # Event infrastructure
│   └── util/                        # Utility classes
│
└── modules/                         # Business modules
    ├── identity/                    # Identity & Access Management
    │   ├── domain/
    │   │   ├── entity/             # User, Role, Address entities
    │   │   └── repository/         # JPA repositories
    │   ├── application/
    │   │   ├── service/            # Business logic
    │   │   ├── dto/                # Data transfer objects
    │   │   └── mapper/             # Entity-DTO mappers
    │   ├── web/
    │   │   └── controller/         # REST controllers
    │   └── api/                    # Public API interfaces
    │
    ├── catalog/                     # Product Catalog Management
    │   ├── domain/
    │   │   ├── entity/             # Product, Category, Brand entities
    │   │   └── repository/
    │   ├── application/
    │   │   ├── service/
    │   │   ├── dto/
    │   │   ├── mapper/
    │   │   └── specification/      # JPA Specifications for filtering
    │   ├── web/
    │   │   └── controller/
    │   ├── api/                    # Public API (CatalogApi)
    │   └── event/                  # Domain events
    │
    ├── inventory/                   # Inventory Management
    │   ├── domain/
    │   │   ├── entity/
    │   │   └── repository/
    │   ├── application/
    │   │   └── service/
    │   └── event/                  # Event listeners (OrderCreatedEvent)
    │
    ├── cart/                        # Shopping Cart & Wishlist
    │   ├── domain/
    │   │   ├── entity/
    │   │   └── repository/
    │   ├── application/
    │   │   └── service/
    │   └── web/
    │       └── controller/
    │
    ├── order/                       # Order Management
    │   ├── domain/
    │   │   ├── entity/
    │   │   └── repository/
    │   ├── application/
    │   │   └── service/
    │   ├── web/
    │   │   └── controller/
    │   ├── api/                    # Public API (OrderApi)
    │   └── event/                  # OrderCreatedEvent, OrderConfirmedEvent
    │
    ├── payment/                     # Payment Processing
    │   ├── domain/
    │   │   ├── entity/
    │   │   └── repository/
    │   ├── application/
    │   │   └── service/
    │   └── event/                  # PaymentSuccessEvent, PaymentFailedEvent
    │
    └── promotion/                   # Promotions & Coupons
        ├── domain/
        │   ├── entity/
        │   └── repository/
        ├── application/
        │   └── service/
        └── web/
            └── controller/
```

## I. Kiến trúc Nguyên tắc

### 1. **Shared Kernel**
- Chứa các thành phần dùng chung cho tất cả modules
- Base entities, common exceptions, utilities
- Event infrastructure cho inter-module communication

### 2. **Module Structure**
Mỗi module tuân theo cấu trúc chuẩn:
- **domain**: Entities, Repositories (Core business logic)
- **application**: Services, DTOs, Mappers (Use cases)
- **web**: Controllers (REST API endpoints)
- **api**: Public interfaces (Inter-module communication)
- **event**: Domain events (Async communication)

### 3. **Module Communication**
- **Synchronous**: Qua public API interfaces
- **Asynchronous**: Qua Spring Events (Event-driven)
- **No direct dependencies**: Modules không truy cập trực tiếp vào internal classes của nhau

## II. Development Guidelines

1. **Loose Coupling**: Modules chỉ giao tiếp qua API hoặc Events
2. **High Cohesion**: Mỗi module chịu trách nhiệm cho một domain cụ thể
3. **Single Responsibility**: Mỗi class có một trách nhiệm duy nhất
4. **Dependency Direction**: Dependencies luôn hướng vào trong (domain ← application ← web)

## III. Technology Stack

- **Spring Boot 3.x**
- **Spring Data JPA** (Hibernate)
- **Spring Security** + JWT
- **MariaDB**
- **OpenAPI 3** (Swagger)
