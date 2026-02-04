# AquaCare Backend API Specification

This document describes the API endpoints that the mobile app expects. Use this as a reference when building the backend.

## Base URL
```
Production: https://api.aquacare.com/api
Development: http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a Bearer token in the header:
```
Authorization: Bearer {token}
```

---

## 1. Authentication Endpoints

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "customer@test.com",
  "password": "password123",
  "role": "customer" | "agent" | "dealer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "U001",
      "email": "customer@test.com",
      "name": "John Customer",
      "phone": "+91 98765 43210",
      "role": "customer",
      "referralCode": "JOHN100",
      "createdAt": "2026-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Signup
```
POST /auth/signup
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "password": "password123",
  "role": "customer",
  "referralCode": "REF123" // optional
}
```

**Response:** Same as Login

### Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Service Endpoints

### Get All Services
```
GET /services?page=1&pageSize=10&category=purifier
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `searchQuery` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "S001",
      "title": "RO Service",
      "description": "Complete RO water purifier servicing",
      "price": 399,
      "rating": 4.5,
      "category": "purifier",
      "imageUrl": "https://...",
      "duration": "45 mins"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalItems": 45
  }
}
```

### Get Service Details
```
GET /services/:serviceId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "S001",
    "title": "RO Service",
    "description": "Complete RO water purifier servicing",
    "price": 399,
    "detailedDescription": "...",
    "includes": ["Filter replacement", "Cleaning"],
    "rating": 4.5,
    "reviewCount": 128,
    "category": "purifier",
    "imageUrl": "https://...",
    "duration": "45 mins"
  }
}
```

### Book Service
```
POST /bookings
Headers: Authorization: Bearer {token}
```

**Request:**
```json
{
  "serviceId": "S001",
  "scheduledDate": "2026-02-05",
  "scheduledTime": "10:00 AM",
  "addressId": "A001",
  "notes": "Please call before arriving"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "B001",
    "serviceId": "S001",
    "status": "confirmed",
    "scheduledDate": "2026-02-05",
    "scheduledTime": "10:00 AM",
    "totalAmount": 399
  }
}
```

---

## 3. Product Endpoints

### Get All Products
```
GET /products?page=1&pageSize=10&category=filter
```

**Query Parameters:** Same as services

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "P001",
      "name": "Kent RO Membrane",
      "description": "Replacement membrane for Kent RO",
      "price": 1299,
      "originalPrice": 1599,
      "rating": 4.3,
      "category": "spare",
      "imageUrl": "https://...",
      "inStock": true
    }
  ],
  "pagination": { ... }
}
```

### Add to Cart
```
POST /cart/items
Headers: Authorization: Bearer {token}
```

**Request:**
```json
{
  "productId": "P001",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cartItemId": "CI001",
    "productId": "P001",
    "quantity": 2
  }
}
```

---

## 4. Order Endpoints

### Create Order
```
POST /orders
Headers: Authorization: Bearer {token}
```

**Request:**
```json
{
  "items": [
    { "productId": "P001", "quantity": 2 }
  ],
  "addressId": "A001",
  "paymentMethod": "cod"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "O001",
    "items": [...],
    "totalAmount": 2598,
    "status": "pending",
    "createdAt": "2026-02-02T20:00:00Z"
  }
}
```

### Get User Orders
```
GET /orders?page=1&pageSize=10
Headers: Authorization: Bearer {token}
```

**Response:** Paginated list of orders

---

## 5. User Profile Endpoints

### Get Profile
```
GET /user/profile
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "U001",
    "name": "John Customer",
    "email": "john@example.com",
    "phone": "+91 98765 43210",
    "role": "customer",
    "referralCode": "JOHN100"
  }
}
```

### Update Profile
```
PUT /user/profile
Headers: Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+91 98765 00000"
}
```

### Get Addresses
```
GET /user/addresses
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "A001",
      "line1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "type": "home"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Common Error Codes:**
- `INVALID_CREDENTIALS` - Login failed
- `UNAUTHORIZED` - Token missing/invalid
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

---

## How to Connect

1. Build backend with these endpoints
2. Deploy backend and get URL
3. In mobile app, update `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```
4. In `src/services/authService.ts` and other services, switch from mock to API calls
