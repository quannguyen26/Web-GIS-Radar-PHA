# 📡 Web-GIS Radar PHA - Backend Service

> Backend API service phục vụ xác thực người dùng, bảo vệ dữ liệu và truyền phát chuỗi thời gian sản phẩm Ra đa thời gian thực qua Server-Sent Events (SSE).

---

## 📋 Mục lục

- [Kiến trúc & Tính năng chính](#-kiến-trúc--tính-năng-chính)
- [Cơ chế Thời gian thực (SSE & PostgreSQL LISTEN/NOTIFY)](#-cơ-chế-thời-gian-thực-sse--postgresql-listennotify)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
- [Biến môi trường (.env)](#-biến-môi-trường-env)
- [Thiết lập Database & Trigger](#-thiết-lập-database--trigger)
- [Danh sách API Endpoints](#-danh-sách-api-endpoints)

---

## 🛠️ Kiến trúc & Tính năng chính

- **Cấu trúc ES Modules**: Sử dụng chuẩn `import/export` hiện đại trên Node.js.
- **Mô hình kết nối kép (Dual Database Pools)**:
  - `dbGeoserver.js`: Kết nối CSDL lưu chỉ mục ảnh radar của GeoServer (truy vấn thời gian ingestion, lắng nghe trigger cập nhật ảnh).
  - `dbWebApp.js`: Kết nối CSDL ứng dụng chính (quản lý người dùng, bản tin, mẫu báo cáo).
- **Hệ thống xác thực bảo mật**:
  - Mã hóa mật khẩu bằng `bcrypt`.
  - Cặp khóa Access Token (thời hạn ngắn) & Refresh Token (thời hạn dài lưu trong cookie `httpOnly`).
  - Middleware `protectedRoute` kiểm tra tính hợp lệ của token trước khi truy cập tài nguyên bảo mật.

---

## ⚡ Cơ chế Thời gian thực (SSE & PostgreSQL LISTEN/NOTIFY)

Hệ thống theo dõi dữ liệu radar không sử dụng polling liên tục mà dùng kiến trúc hướng sự kiện (Event-driven):

```
GeoServer Ingestion
        │
        ▼ (INSERT Row)
PostgreSQL Table: max_mosaic_index / hmax_mosaic_index
        │
        ▼ (AFTER INSERT Trigger)
Function: notify_radar_product_update(product_label)
        │
        ▼ (PERFORM pg_notify)
PostgreSQL Channel: 'radar_product_update'
        │
        ▼ (LISTEN via initPostgresListener.js)
Express SSE Broadcaster (timeController.js)
        │
        ▼ (text/event-stream)
Frontend Client (React MapView)
```

1. Khi có ảnh radar mới nạp vào CSDL GeoServer, Trigger PostgreSQL phát tín hiệu `NOTIFY 'radar_product_update'`.
2. `initPostgresListener.js` đón nhận sự kiện, lấy timestamp mới nhất của sản phẩm tương ứng.
3. Express Server đẩy bản tin mới tới các client đang kết nối qua luồng Server-Sent Events (`/api/time?product=MAX`).

---

## 📁 Cấu trúc thư mục

```
backend/
├── libs/
│   ├── dbGeoserver.js          # Pool kết nối CSDL GeoServer
│   ├── dbWebApp.js             # Pool kết nối CSDL Web App
│   ├── initPostgresListener.js # Lắng nghe sự kiện NOTIFY từ PostgreSQL
│   └── SQL.txt                 # Script tạo Trigger và Function trong PostgreSQL
├── src/
│   ├── controllers/
│   │   ├── authController.js   # Xử lý đăng ký, đăng nhập, refresh token, đăng xuất
│   │   ├── timeController.js   # Quản lý SSE client và phát timestamp radar
│   │   └── userController.js   # Xử lý thông tin tài khoản người dùng
│   ├── middleware/
│   │   └── authMiddleware.js   # Middleware kiểm tra và xác thực JWT token
│   ├── routes/
│   │   ├── authRoute.js        # Định nghĩa các tuyến /api/auth
│   │   ├── timesRoute.js       # Định nghĩa tuyến /api/time (SSE)
│   │   └── userRoute.js        # Định nghĩa tuyến /api/users
│   └── server.js               # Khởi tạo Express app, cấu hình CORS, middleware & ports
├── package.json
└── README.md
```

---

## ⚙️ Cài đặt & Khởi chạy

### Cài đặt thư viện

```bash
npm install
```

### Chạy chế độ phát triển (Development với Nodemon)

```bash
npm run dev
```

Mặc định server sẽ chạy tại `http://localhost:5001`.

### Chạy chế độ sản xuất (Production)

```bash
npm start
```

---

## 🔑 Biến môi trường (.env)

Tạo file `.env` tại thư mục `backend/`:

```env
PORT=5001

# Cấu hình CSDL PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWD=your_strong_password

# Tên CSDL ứng dụng (Users, Profiles, Bulletins)
DB_APP_NAME=web_gis_app

# Tên CSDL chứa các bảng index radar của GeoServer
DB_GEO_NAME=geoserver_db

# Số lượng mốc thời gian tải ban đầu cho client
LIMIT_PRODUCTS=12

# Bí mật mã hóa JWT
ACCESS_TOKEN_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
```

---

## 🗄️ Thiết lập Database & Trigger

Chạy đoạn script sau trên CSDL chứa dữ liệu GeoServer (`DB_GEO_NAME`):

```sql
-- 1. Tạo hàm tổng bắn NOTIFY kèm nhãn sản phẩm
CREATE OR REPLACE FUNCTION notify_radar_product_update()
RETURNS trigger AS $$
DECLARE
  product_name text;
BEGIN
  product_name := TG_ARGV[0];

  PERFORM pg_notify(
    'radar_product_update',
    json_build_object('product', product_name)::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Gắn Trigger vào các bảng sản phẩm tương ứng
CREATE TRIGGER trigger_max_product_insert
AFTER INSERT ON max_mosaic_index
FOR EACH ROW
EXECUTE FUNCTION notify_radar_product_update('MAX');

CREATE TRIGGER trigger_hmax_product_insert
AFTER INSERT ON hmax_mosaic_index
FOR EACH ROW
EXECUTE FUNCTION notify_radar_product_update('HMAX');
```

---

## 📡 Danh sách API Endpoints

### 1. Xác thực (`/api/auth`)

| Phương thức | Endpoint            | Mô tả                                          | Quyền truy cập         |
| ----------- | ------------------- | ---------------------------------------------- | ---------------------- |
| `POST`      | `/api/auth/signup`  | Đăng ký tài khoản người dùng mới               | Không công khai        |
| `POST`      | `/api/auth/signin`  | Đăng nhập hệ thống, cấp Access & Refresh Token | Công khai              |
| `POST`      | `/api/auth/signout` | Đăng xuất, xóa Refresh Token cookie            | Công khai              |
| `POST`      | `/api/auth/refresh` | Cấp mới Access Token bằng Refresh Token        | Công khai (cần cookie) |

### 2. Dữ liệu thời gian Radar SSE (`/api/time`)

| Phương thức | Endpoint                | Mô tả                                                   | Header yêu cầu              |
| ----------- | ----------------------- | ------------------------------------------------------- | --------------------------- |
| `GET`       | `/api/time?product=MAX` | Kết nối luồng Server-Sent Events nhận danh sách mốc ảnh | `Accept: text/event-stream` |

- **Phản hồi ban đầu**: Gửi mảng `LIMIT_PRODUCTS` mốc thời gian gần nhất dạng ISO string (ví dụ: `2026-11-02T01:30:00Z`).
- **Phản hồi cập nhật**: Tự động phát khi có ảnh mới: `{ product: "MAX", latestTime: "..." }`.

### 3. Người dùng (`/api/users`)

| Phương thức | Endpoint        | Mô tả                            | Quyền truy cập                      |
| ----------- | --------------- | -------------------------------- | ----------------------------------- |
| `GET`       | `/api/users/me` | Lấy thông tin tài khoản hiện tại | Yêu cầu xác thực (`protectedRoute`) |
