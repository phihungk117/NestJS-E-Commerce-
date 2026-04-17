# 🚀 Dự Án Backend NestJS E-Commerce

Chào mừng bạn đến với dự án E-Commerce được xây dựng bằng kiến trúc mạnh mẽ và chặt chẽ của **NestJS** kết hợp với **TypeORM** và **MySQL**.

## ⚙️ Hướng Dẫn Cài Đặt và Khởi Chạy (Getting Started)

1. **Cài đặt thư viện:**
   Mở terminal tại thư mục gốc và chạy lệnh:

   ```bash
   npm install
   ```

2. **Chạy Server (Chế độ Development):**
   Chạy lệnh này khởi động máy chủ cùng tính năng tự động tải lại code khi có thay đổi:
   ```bash
   npm run start:dev
   ```
   > 🎯 _Máy chủ sẽ khởi động tại `http://localhost:3000/api/v1`_

---

## 📖 Bảng Cửu Chương Test Bằng POSTMAN

> **QUAN TRỌNG:** `baseUrl` `http://localhost:3000/api/v1`.

### 1. 🛡️ NHÓM AUTH (ĐĂNG KÝ / ĐĂNG NHẬP)

**1.1 Đăng ký tài khoản (Register)**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Auth Type:** None
- **Body (raw - JSON):**
  ```json
  {
    "email": "khachhang@gmail.com",
    "password": "password123",
    "fullName": "Khách Hàng VIP",
    "phone": "0987654321",
    "address": "123 Đường B, Quận 1"
  }
  ```

**1.2 Đăng nhập (Login)**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Auth Type:** None
- **Body (raw - JSON):**
  `json
{
  "email": "khachhang@gmail.com",
  "password": "password123"
}
`
  > _(Quan trọng: Lấy đoạn mã `access_token` ở kết quả trả về để dùng cho các API yêu cầu Auth Type = Bearer Token bên dưới)._

---

### 2. 👤 NHÓM USERS (NGƯỜI DÙNG)

**2.1 Xem thông tin cá nhân (Profile)**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/users/me`
- **Auth Type:** Bearer Token (Gắn mã Token mới đăng nhập vào)
- **Body:** None

**2.2 Cập nhật thông tin cá nhân**

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/users/me`
- **Auth Type:** Bearer Token
- **Body (raw - JSON):**
  `json
{
  "fullName": "Bùi Xuân Huấn",
  "address": "Phố đi bộ"
}
`
  > _(Trừ 2 API trên, các API còn lại trong nhánh `/users/:id` đều bắt buộc Token phải là của **Admin**)._

---

### 3. 📂 NHÓM DANH MỤC (CATEGORIES)

**3.1 Tạo danh mục mới (Chỉ ADMIN)**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/categories`
- **Auth Type:** Bearer Token (Phải là Token của Admin)
- **Body (raw - JSON):**
  `json
{
  "name": "Giày Thể Thao",
  "description": "Chuyên giày Sneakers siêu cấp"
}
`
  > _(Copy ID của category vừa tạo để đem thả vào lúc tạo Sản phẩm)._

**3.2 Xem toàn bộ danh mục**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/categories`
- **Auth Type:** None (Ai cũng xem được)
- **Body:** None

---

### 4. 👕 NHÓM SẢN PHẨM (PRODUCTS)

**4.1 Tạo sản phẩm mới (Chỉ ADMIN)**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/products`
- **Auth Type:** Bearer Token (Admin)
- **Body (raw - JSON):**
  `json
{
  "name": "Giày Nike Air Max",
  "description": "Cao su mềm êm ái",
  "price": 1500000,
  "stock": 50,
  "categoryId": "CẮM_ID_CỦA_CATEGORY_VÀO_ĐÂY"
}
`
  > _(Copy cái ID của Product sinh ra để mang đi mua hàng)._

**4.2 Xem toàn bộ sản phẩm (Kèm tìm kiếm)**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/products?page=1&limit=10&search=Nike`
- **Auth Type:** None (Khách vãng lai cũng xem được)
- **Body:** None

**4.3 Xem chi tiết 1 sản phẩm**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/products/CẮM_ID_CỦA_PRODUCT_VÀO_ĐÂY`
- **Auth Type:** None

---

### 5. 🛒 NHÓM GIỎ HÀNG (CART)

**5.1 Thêm vào giỏ hàng**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/cart`
- **Auth Type:** Bearer Token (Của Khách mua hàng)
- **Body (raw - JSON):**
  ```json
  {
    "productId": "CẮM_ID_CỦA_PRODUCT_VÀO_ĐÂY",
    "quantity": 2
  }
  ```

**5.2 Xem giỏ hàng của tôi**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/cart`
- **Auth Type:** Bearer Token
- **Body:** None

**5.3 Sửa số lượng của 1 món trong giỏ**

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/cart/CẮM_CART_ITEM_ID_VÀO_ĐÂY` _(Lưu ý đây là ID của dòng Item trong Cart, KHÔNG phải ID Product)_
- **Auth Type:** Bearer Token
- **Body (raw - JSON):**
  ```json
  {
    "quantity": 5
  }
  ```

**5.4 Dọn sạch giỏ hàng (Clear Cart)**

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/cart/clear`
- **Auth Type:** Bearer Token

---

### 6. 📦 NHÓM ĐƠN HÀNG (ORDERS)

**6.1 Đặt hàng (Checkout xuất kho từ Giỏ Hàng)**

- **Method:** `POST`
- **URL:** `{{baseUrl}}/orders`
- **Auth Type:** Bearer Token
- **Body (raw - JSON):**
  `json
{
  "shippingAddress": "456 Đường C, Lầu 2, phòng 204",
  "note": "Gửi cho lễ tân dùm",
  "items": [] 
}
`
  > _(Mảng items để rỗng `[]` hệ thống sẽ tự bế toàn bộ Giỏ hàng đi tính tiền)._

**6.2 Xem danh sách đơn hàng đã đặt**

- **Method:** `GET`
- **URL:** `{{baseUrl}}/orders/my`
- **Auth Type:** Bearer Token
- **Body:** None

**6.3 Khách tự hủy đơn hàng (Cancel)**

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/orders/CẮM_ID_ĐƠN_HÀNG_VÀO_ĐÂY/cancel`
- **Auth Type:** Bearer Token
- **Body:** None

**6.4 Quản lý giao hàng (Chỉ ADMIN)**

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/orders/CẮM_ID_ĐƠN_HÀNG_VÀO_ĐÂY/status`
- **Auth Type:** Bearer Token (Token Admin)
- **Body (raw - JSON):**
  ```json
  {
    "status": "shipped"
  }
  ```
