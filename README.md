Web GIS Ra đa Pha Đin

1. Tích hợp làm bản tin

# Bộ công cụ phục vụ ban hành bản tin tại trạm Ra đa, Đài

# Thêm vào tùy chọn Bản tin của sidebar

# Gồm các chức năng:

1.1 Đăng ký, đăng nhập, phân quyền

- Gồm 3 loại chính: System Admin, Admins và Users
- Loại System Admin :
  - 1 tài khoản duy nhất
  - quản lý organizations (trạm Ra đa, Đài tỉnh)
  - xem toàn bộ users
  - xem toàn bộ bản tin
  - quản lý templates

- Loại Admin (2 loại):
  - Do System Admin tạo ra
  - admin quản lý users thuộc trạm ra đa (các trạm radar gồm: Pha Đin, Việt Trì, Phù Liễn)
  - admin quản lý users thuộc đài tỉnh (các đài tỉnh gồm: Sơn La, Điện Biên, Lai Châu vv ...)
  - chức năng admin:
    - quyền thêm - xóa - sửa users thuộc quyền quản lý theo trạm ra đa/tỉnh
- Loại users (2 loại):
  - Do Admin tạo ra
  - users thuộc trạm ra đa
  - users thuộc đài tỉnh
    - quyền tạo, ban hành, xem các bản tin đã ban hành

      1.2 Tạo bản tin theo mẫu

  - Bản tin Trạm Ra đa
    - Sử dụng bởi users trạm ra đa
    - Thêm các nội dung và nhận định thời tiết vào mẫu bản tin;
    - Tùy chọn ảnh radar trực tiếp từ web hoặc cắt/thêm ảnh ra đa từ nguồn khác đưa vào bản tin
    - Lưu nháp khi làm dở
    - Xem lại trước trước khi ban hành.
    - Xuất bản tin ra file: pdf, docx
  - Bản tin Đài tỉnh
    - Sử dụng bởi user Đài tỉnh
    - Thêm các nội dung và nhận định thời tiết vào mẫu bản tin;
    - Tùy chọn ảnh radar trực tiếp từ web hoặc cắt/thêm ảnh ra đa từ nguồn khác đưa vào bản tin
    - Lưu nháp khi làm dở
    - Xem lại trước trước khi ban hành.
    - Xuất bản tin ra file: pdf, docx

      1.3 Ban hành bản tin

  - Lưu trữ vào cơ sở dữ liệu phục vũ truy vấn
  - Ban hành bản tin qua email, zalo, trực tiếp lên hệ thống web để các user khác tham khảo

    1.4 Lưu trữ, truy vấn, chỉnh sửa, đánh giá các bản tin
    - users:
      - lưu bản tin đã ban hành vào CSDL của user đó
      - xem lại bản tin đã ban hành của chính user đó
      - xem bản tin của các users thuộc trạm ra đa đã ban hành
      - xem bản tin của các users thuộc các đài tỉnh khác đã ban hành

    - admin
      - tạo, thiết kế và cập nhật các biểu mẫu bản tin ngay trên giao diện web
      - quản lý các bản tin (xóa,sửa), mẫu bản tin thuộc quyền

      - xem, chỉnh sửa lại bản tin do user quản lí ban hành
      - xem tất cả các ban tin của các user trạm ra đa và đài tỉnh

Các kiên thức:

- Database (học lại),
- Đăng nhâp/Xác thực, Phân Quyền
  => sản phẩm chức nănng đăng ký, đăng nhập,

2. Thêm sản phẩm tham khảo

# Cung cấp thêm cho người xem các sản phẩm ra đa (thông tin, hướng dẫn, cảnh báo)

2.1) Thêm các sản phẩm Ra đa: VIL, TOP, RAIN1,.....
2.2) Thêm chú thích, hướng dẫn về sản phẩm (chatbot, phòng tập luyện)

3. Tích hợp Trạng thái hệ thống Ra đa

# Công cụ theo dõi hoạt động hệ thống Ra đa thời gian thực

# Thu thấp các thông số từ hệ thống đưa lên nền web
