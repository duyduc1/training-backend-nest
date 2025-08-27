# Mô tả API theo Request

## Cấu trúc project
``` bash 
backend-nest/
├── src/
│   ├── config/                              # Các cấu hình hệ thống
│   │   ├── cloudinary/                      # Cấu hình Cloudinary (upload file)
│   │   │   ├── cloudinary.module.ts
│   │   │   ├── cloudinary.provider.ts
│   │   └── database.config.ts               # Cấu hình TypeORM, database
│   │
│   ├── modules/                             # Các module chính
│   │   ├── auth/                            # Xác thực & phân quyền
│   │   │   ├── dto/                         # Data Transfer Objects cho Auth
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── reset-password.dto.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── google.strategy.ts           # OAuth Google
│   │   │   ├── jwt.strategy.ts              # JWT Strategy
│   │   │   ├── jwt-auth.guard.ts            # Guard JWT
│   │   │   ├── roles.decorator.ts           # Decorator cho phân quyền
│   │   │   └── roles.guard.ts               # Guard role-based
│   │   │
│   │   ├── excel/                           # Quản lý Excel Import/Export
│   │   │   ├── export/                      # Thư mục chứa tạm file excel sau khi đọc
│   │   │   ├── uploads/                     # Thư mục chứa file excel sau khi import
│   │   │   ├── excel.controller.ts
│   │   │   ├── excel.module.ts
│   │   │   └── excel.service.ts
│   │   │
│   │   ├── products/                        # Quản lý sản phẩm
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   ├── entities/           
│   │   │   │   ├── product.entity.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.module.ts
│   │   │   └── products.service.ts
│   │   │
│   │   ├── upload/                          # Upload file
│   │   │   ├── dto/
│   │   │   │   ├── create-upload.dto.ts
│   │   │   │   ├── update-upload.dto.ts
│   │   │   ├── entities/      
│   │   │   │   ├── upload.entity.ts
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.module.ts
│   │   │   └── upload.service.ts
│   │   │
│   │   └── users/                            # Quản lý user
│   │       ├── dto/
│   │       │   ├── create-user.dto.ts
│   │       │   ├── update-user.dto.ts
│   │       ├── entities/
│   │       │   ├── user.entity.ts
│   │       ├── users.controller.ts
│   │       ├── role.enum.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   │
│   ├── app.controller.spec.ts               
│   ├── app.controller.ts               
│   ├── app.module.ts              
│   ├── app.service.ts             
│   └── main.ts                    
│
├── test/                    
├── .env                            
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
```

## Cách chạy project backend nest 
``` bash
cd backend-nest
npm install
npm run start:dev
```

# 1. Tạo tài khoản, đăng nhập tài khoản và generate jwt

## 1. Register User
### Endpoint: POST /api/auth/register
### Request Body

``` json
{
  "Name": "Nguyen Van A",
  "Email": "user@example.com",
  "Password": "123456",
  "NumberPhone": "0123456789"
}
```

### Response (201 Created)
``` json 
{
  "user": {
    "id": "1",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "numberphone": "0123456789",
    "role": "user"
  }
}
```

### Logic
- Kiểm tra email đã tồn tại chưa (authService.findByEmail).

- Nếu tồn tại → trả về lỗi 400 và message Email already exists

- Nếu chưa tồn tại → mã hóa password và lưu vào DB (usersService.create).

## 2. Login User

### Endpoint: POST /api/auth/login
### Request Body

``` json 
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Response (200 OK)
``` json
{
  "message": "Login successfull",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "payload": {
    "id": 1,
    "role": "user",
    "email": "user@example.com",
    "numberphone": "123456",
    "username": "Nguyen Van A"
  }
}
```

### Logic

- Tìm user theo email (usersService.findByEmail).

- So sánh mật khẩu nhập vào với mật khẩu hash đã lưu trong DB (bcrypt.compare).

- Nếu đúng → tạo JWT Token với payload { id, email, name, numberphone, role }.

- Trả về token + thông tin user.

# 2. Social Login (Google OAuth2) Flow

## Cách chạy project frontend nextjs

``` bash
cd frontend-next
npm install
npm run build
npm run dev
```

## 1. Flow hoạt động
1. Frontend NextJS select tới Endpoint http://localhost:3001/auth/login bấm nút "Login with Google" → gọi API GET /api/auth/google.

2. API GET /api/auth/google → Passport chuyển hướng sang trang đăng nhập Google (scope: ["profile", "email"]).

3. Sau khi user đồng ý → Google trả về thông tin (profile, email…) qua API callback GET /api/auth/google/callback

4. Trong passport:
- Lấy email từ Google.
- Tìm user trong DB (userService.findByEmail).
- Nếu chưa có → tạo mới user (userService.create).
- Trả về user cho Passport.

5. authController.googleCallback nhận req.user, tạo JWT token, rồi redirect về frontend:

``` http
http://localhost:3001?token=<jwt_token>
```

# 3. Gửi email

## 1. Forgot Password (Yêu cầu đặt lại mật khẩu)
### Endpoint: POST /api/auth/forgot-password
### Request Body

``` json 
{
  "email": "user@example.com"
}
```

### Logic 
1. Nhận email từ client

- Gọi usersService.findByEmail(email) để kiểm tra user có tồn tại không.

- Nếu không có → throw NotFoundException('User not found').

2. Sinh reset token JWT

- Payload chứa { sub: user.id } (sub = subject = userId).

- Thời gian sống: 15m (15 phút).

3. Tạo thời gian hết hạn riêng (expiry Date object) để lưu DB.

4. Lưu token + expiry vào DB (qua usersService.saveResetToken).

→ Điều này giúp verify token hợp lệ và chưa hết hạn khi reset mật khẩu.

5. Tạo reset link
``` bash
http://localhost:3000/api/auth/reset-password?token=abcxyz...
```

6. Gửi email cho user

- Nội dung chứa link để họ click vào đặt lại mật khẩu.

7. Trả về message cho client

"Reset password link sent to email".

## 2. Reset Password (Đặt lại mật khẩu mới)

### Endpoint: POST /api/auth/reset-password?token=<reset_token>
### Request Body
``` json
{
  "password": "newpassword123"
}
```

### Logic

1. Giải mã token (jwtService.verify)

- Xác thực token có hợp lệ không (ký đúng secret, chưa hết hạn).

- Lấy sub (userId) từ payload.

2. Tìm user theo ID

- Lấy user từ DB qua usersService.findById(decoded.sub).

3. Kiểm tra token

- So sánh token gửi vào có bằng với user.resetToken trong DB không.

- Kiểm tra user.resetTokenExpiration còn hạn không.

- Nếu không hợp lệ → throw BadRequestException("Invalid or expired token").

4. Hash mật khẩu mới

- Dùng bcrypt.hash(newPassword, 10) để mã hóa password.

5. Cập nhật mật khẩu trong DB

- Gọi usersService.updatePassword(user.id, hashedPassword).

- Có thể đồng thời xoá resetToken & resetTokenExpiration để tránh reuse.

6. Trả kết quả thành công
``` json
{ 
    "message": "Password reset successfully"
}
```
7. Xử lý lỗi

- Nếu token sai / hết hạn / verify fail → catch và throw BadRequestException("Invalid or expired token").

# 4. Upload file

## 4.1 Upload File
### Endpoint: POST /api/upload
### Request (Form-Data)
``` bash
Field	            Type	              Description
──────────────────────────────────────────────────────
NameUpload	        text	              Tiêu đề file
──────────────────────────────────────────────────────
Description	        text	              Mô tả file
──────────────────────────────────────────────────────
file	        	File                  ảnh upload (Cloudinary sẽ lưu)
```

### Response (200 OK)

``` json
{
  "id": 1,                       
  "NameUpload": "Tên file/dữ liệu bạn gửi trong DTO",
  "Description": "Mô tả (nếu có trong DTO, có thể null)",
  "ImageUrl": "https://res.cloudinary.com/.../abc.jpg"  
}
```

## 4.2 Get All Files
### Endpoint: GET /api/upload
### Response (200 OK)

``` json 
[
  {
    "id": 1,
    "NameUpload": "profile_pic",
    "Description": "Ảnh đại diện",
    "ImageUrl": "https://res.cloudinary.com/.../pic1.jpg"
  },
  {
    "id": 2,
    "NameUpload": "document",
    "Description": null,
    "ImageUrl": "https://res.cloudinary.com/.../doc1.pdf"
  }
]
```

## 4.3 Get File By ID
### Endpoint: GET /api/upload/:id
### Response (200 OK)
``` json
{
   "id": 1,
   "NameUpload": "profile_pic",
   "Description": "Ảnh đại diện",
   "ImageUrl": "https://res.cloudinary.com/.../pic1.jpg"
}
```

## 4.4 Update File (Title & Description)
### Endpoint: PUT /api/upload/:id
### Request Body (JSON)
``` json
{
  "NameUpload": "profile_pic_updated",
  "Description": "Cập nhật ảnh đại diện"
}
```

### Response (200 OK)
``` json
{
  "id": 1,
  "NameUpload": "profile_pic_updated",
  "Description": "Ảnh đại diện mới",
  "ImageUrl": "https://res.cloudinary.com/.../new_avatar.png"
}
```

## 4.5 Delete File
### Endpoint: DELETE /api/upload/:id
### Response (200 OK)
``` json
{
  "id": 5,
  "NameUpload": "old_avatar",
  "Description": "Ảnh cũ",
  "ImageUrl": "https://res.cloudinary.com/.../old.png"
}
```

# 5. Đọc, ghi file excel
## 1. Upload & đọc dữ liệu từ file Excel
### Endpoint: POST /api/excel/import

### Request:

- Loại request: multipart/form-data

- Tham số:

file: file Excel (.xlsx, .xls)

- Ví dụ (Postman → Body → form-data):

``` makefile
Key: file
Type: File
Value: sample.xlsx
```

### Response: 200 OK
``` json
{
  "data": [
    { "Name": "Alice", "Age": 22 },
    { "Name": "Bob", "Age": 28 }
  ]
}
```

## 2. Export Excel
### Endpoint: POST /api/excel/export

### Request:

- Loại request: application/json

- Body:
``` json
{
  "data": [
    { "Name": "Alice", "Age": 22 },
    { "Name": "Bob", "Age": 28 }
  ]
}
```

### Response:

- Trả về file Excel để tải về (tên file dạng export_<timestamp>.xlsx).

- Ví dụ tải về: export_1693159312374.xlsx

# 6. API CURD có kết nối Database MySQL

## 6.1 Lấy danh sách sản phẩm
### Endpoint: GET /api/products
### Response 200 (OK)

``` json
[
  {
    "id": 1,
    "ProductName": "iPhone 15",
    "Price": 2500,
    "Description": "Apple smartphone"
  },
  {
    "id": 2,
    "ProductName": "MacBook Pro",
    "Price": 3200,
    "Description": "Apple laptop"
  }
]
```
## 6.2 Lấy sản phẩm theo ID
### Endpoint: GET /api/products/:id
### Request Example: GET /api/products/1
### Response 200 (OK):
``` json
{
   "id": 1,
   "ProductName": "iPhone 15",
   "Price": 2500,
   "Description": "Apple smartphone"
},
```

## 6.3 Tạo sản phẩm
### Request
1. Authentication
- API đều cần JWT Token và là token ADMIN.
- Thêm vào request header:

``` bash
Authorization: Bearer <your_token>
```

### Endpoint: POST /api/products
### Request Example: POST /api/products
### request body
``` json 
{
  "ProductName": "iPhone 15",
  "Price": 2500,
  "Description": "Apple smartphone"
}
```

### Response 200 (OK):
``` json 
{
  "message": "Product create successfull",
  "newProduct": {
    "id": 1,
    "ProductName": "iPhone 15",
    "Price": 2500,
    "Description": "Apple smartphone"
  }
}
```

## 6.4 Cập nhât sản phẩm
### Request
1. Authentication
- API đều cần JWT Token và là token ADMIN.
- Thêm vào request header:

``` bash
Authorization: Bearer <your_token>
```

### Request Example: PUT /api/products/:id
### Endpoint: PUT /api/products/1
### request body
``` json
{
  "ProductName": "iPhone 15 Pro",
  "Price": 2800
}
```

### Response 200 (OK):
``` json
{
  "message": "Product was updated",
  "productUpdate": {
    "id": 1,
    "ProductName": "iPhone 15 Pro",
    "Price": 2800,
    "Description": "Apple smartphone"
  }
}
```

## 6.5 Xoá sản phẩm
### Request
1. Authentication
- API đều cần JWT Token và là token ADMIN.
- Thêm vào request header:

``` bash
Authorization: Bearer <your_token>
```

### Request Example: /api/products/:id
### Endpoint: DELETE /api/products/1
### Response (200 OK)
``` json
{
  "message": "Product deleted successfully"
}
```

### Tóm lại:

- GET /api/products → Lấy tất cả sản phẩm

- GET /api/products/:id → Lấy 1 sản phẩm theo ID

- POST /api/products → Thêm sản phẩm mới

- PUT /api/products/:id → Cập nhật sản phẩm

- DELETE /api/products/:id → Xóa sản phẩm