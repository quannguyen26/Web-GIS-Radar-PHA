# 🗺️ Web-GIS Radar PHA - Frontend Application

> Giao diện người dùng Web-GIS hiển thị trực quan dữ liệu Ra đa thời tiết, hỗ trợ tương tác đa lớp bản đồ, điều khiển chuỗi ảnh động (animation) và kết nối GeoServer.

---

## 📋 Mục lục

- [Công nghệ & Thư viện](#-công-nghệ--thư-viện)
- [Kiến trúc giao diện & Bản đồ](#-kiến-trúc-giao-diện--bản-đồ)
- [Hệ thống Quản lý Trạng thái (Context API)](#-hệ-thống-quản-lý-trạng-thái-context-api)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tương tác dịch vụ GeoServer](#-tương-tác-dịch-vụ-geoserver)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
- [Cấu hình biến môi trường](#-cấu-hình-biến-môi-trường)

---

## 🛠️ Công nghệ & Thư viện

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/vite`
- **Bản đồ số**:
  - [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
  - [@turf/turf](https://turfjs.org/): Tính toán và xử lý không gian địa lý
- **Biểu tượng**: [Lucide React](https://lucide.dev/)
- **Định tuyến & Gọi API**: [React Router DOM v7](https://reactrouter.com/), [Axios](https://axios-http.com/)

---

## 🗺️ Kiến trúc giao diện & Bản đồ

### 1. Phân tầng hiển thị bản đồ (Map Panes)
Để đảm bảo các lớp dữ liệu không bị đè khuất nhau, bản đồ được tổ chức thành các `pane` với `zIndex` chuyên biệt:

| Tên Pane | zIndex | Mục đích sử dụng |
|---|---|---|
| `paneMaskProvinces` | 550 | Lớp mặt nạ phủ ngoài khu vực quan sát |
| `paneRadarProducts` | 600 | Lớp ảnh gạch (WMS-C Tiles) của sản phẩm Radar (MAX, HMAX) |
| `paneDistricts` | 640 | Lớp ranh giới hành chính cấp quận/huyện |
| `panePointForecast` | 650 | Lớp điểm dự báo chuyên đề |
| `paneBoundaryProvinces` | 660 | Lớp viền ranh giới tỉnh/thành phố |
| `paneRadarStations` | 700 | Điểm đánh dấu vị trí các trạm radar thời tiết |

### 2. Tọa độ & Phạm vi mặc định
- **Tâm bản đồ**: Trạm Ra đa Pha Đin (`[21.57139, 103.51694]`).
- **Phạm vi hiển thị (Bounds)**: Khu vực Bắc Bộ Việt Nam (`[17.7, 101.5]` đến `[25.2, 108.0]`).

### 3. Bộ công cụ điều khiển
- **AnimationControl**: Trình phát chuỗi mốc thời gian (Play / Pause, điều chỉnh tốc độ khung hình, tua theo từng mốc ảnh radar).
- **LayerControlToggle**: Bật / tắt hiển thị các lớp phủ (Vị trí trạm radar, điểm dự báo, ranh giới).
- **ProductLegend**: Thang màu chuẩn hiển thị giá trị độ phản hồi vô tuyến (dBZ) hoặc độ cao đỉnh mây (km).
- **GetMapInfoHandler**: Tương tác click trên bản đồ gửi truy vấn WMS `GetFeatureInfo` để hiển thị giá trị số đo tức thời.

---

## 🔄 Hệ thống Quản lý Trạng thái (Context API)

1. **`ThemeContext`**: Quản lý chế độ giao diện Sáng / Tối (`light` / `dark`), đồng bộ thuộc tính `html.dark` và lưu trạng thái vào `localStorage`.
2. **`SelectionContext`**:
   - Quản lý sản phẩm radar đang chọn (`MAX`, `HMAX`,...).
   - Danh sách mốc thời gian nhận từ SSE Server.
   - Mốc thời gian hiện tại đang hiển thị.
   - Trạng thái phát animation (đang chạy/dừng, tốc độ phát).
3. **`LayerToggleContext`**: Quản lý trạng thái bật/tắt hiển thị của các layer phụ trợ.

---

## 📁 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── assets/                 # Logo trạm, biểu tượng, hình minh họa
│   ├── components/
│   │   ├── layout/             # Cấu trúc khung giao diện
│   │   │   ├── Header.jsx      # Thanh tiêu đề, chọn sản phẩm, chuyển theme
│   │   │   ├── SideBar.jsx     # Thanh điều hướng trái
│   │   │   └── MainContent.jsx # Khu vực hiển thị trung tâm chứa MapView
│   │   ├── map/                # Các thành phần chuyên dụng của bản đồ Leaflet
│   │   │   ├── MapView.jsx     # MapContainer chính và tích hợp các lớp
│   │   │   ├── MapPanes.jsx    # Định nghĩa cấu trúc z-index cho Panes
│   │   │   ├── ProductLayer.jsx# Lớp hiển thị ảnh WMS-C Radar
│   │   │   ├── WFSLayer.jsx    # Lớp lấy dữ liệu vector WFS từ GeoServer
│   │   │   ├── ForecastPointLayer.jsx # Lớp hiển thị các điểm dự báo
│   │   │   ├── GetMapInfoHandler.jsx  # Bắt sự kiện click để đọc giá trị dBZ
│   │   │   └── CenterUpdate.jsx
│   │   └── ui/                 # Các tiện ích điều khiển trên giao diện
│   │       ├── AnimationControl.jsx   # Thanh trượt và nút điều khiển tua ảnh
│   │       ├── LayerControlToggle.jsx # Bảng bật tắt lớp
│   │       ├── ProductLegend.jsx      # Chú giải thang màu radar
│   │       ├── Logo.jsx
│   │       └── Navigation.jsx
│   ├── context/
│   │   ├── LayerToggleContext.jsx
│   │   ├── SelectionContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/
│   │   ├── config/             # Cấu hình danh mục dropdown, menu và legend
│   │   ├── constants.js        # Cấu hình URL GeoServer, tọa độ, panes
│   │   ├── createOnEachFeature.js
│   │   └── formatTime.js       # Hàm định dạng ngày giờ chuẩn Việt Nam
│   ├── pages/
│   │   ├── DashBoard.jsx       # Trang điều khiển chính
│   │   └── NotFound.jsx        # Trang thông báo 404
│   ├── App.jsx                 # Bộ định tuyến Router
│   ├── index.css               # Thiết lập Tailwind CSS
│   └── main.jsx                # Entry point ReactDOM
├── package.json
└── README.md
```

---

## 🌐 Tương tác dịch vụ GeoServer

Hệ thống kết nối tới GeoServer thông qua các dịch vụ chuẩn OGC:
- **WMS-C (Tile Cache)**: `https://radarphadin.com.vn/geoserver/radar/gwc/service/wms` (Hiển thị các lát ảnh radar tốc độ cao).
- **WMS (GetFeatureInfo)**: `https://radarphadin.com.vn/geoserver/radar/wms` (Truy vấn thông số chi tiết tại tọa độ click).
- **WMTS**: `https://radarphadin.com.vn/geoserver/gwc/service/wmts` (Lớp nền và ranh giới hành chính).
- **WFS**: `https://radarphadin.com.vn/geoserver/radar/wfs` (Lấy dữ liệu GeoJSON trạm radar và địa giới).

---

## 🚀 Cài đặt & Khởi chạy

### Cài đặt gói thư viện
```bash
npm install
```

### Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Mặc định ứng dụng chạy tại: `http://localhost:5173`

### Kiểm tra cú pháp (Lint)
```bash
npm run lint
```

### Đóng gói ứng dụng (Build Production)
```bash
npm run build
```
Thư mục sau khi build: `frontend/dist/` (sẵn sàng để Nginx phục vụ).

