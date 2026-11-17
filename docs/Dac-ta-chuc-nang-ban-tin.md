# Đặc tả chức năng Bản tin — Web GIS Ra đa Pha Đin

Ngày lập: 16/11/2026. Trạng thái: **đã duyệt** ngày 17/11/2026 (bước 0.1), chưa viết mã.
Nguồn: README, hai mẫu bản tin docx, mã nguồn hiện tại và các câu trả lời của chủ dự án trong buổi trao đổi 16/11/2026.

## 1. Phạm vi

**Làm trong đợt này**

- Phân quyền theo vai trò và đơn vị.
- Bản tin Trạm ra đa: soạn theo mẫu, lưu nháp, xem trước, xuất docx/pdf.
- Ban hành, đánh số, lưu trữ, tra cứu, sửa và gửi lại.
- Gửi email qua Gmail của đơn vị, đính kèm pdf.
- Phương án khi server lỗi: bộ làm thủ công và nhập bổ sung.

**Để sau, nhưng thiết kế phải chừa chỗ**

- Bản tin Đài tỉnh (mẫu chưa hoàn thiện; tất cả đài tỉnh dùng chung một mẫu, chỉ khác tên tỉnh).
- Quy trình phê duyệt trước khi ban hành.

**Không làm**

- Gửi Zalo (người dùng tải file về tự gửi).
- Đánh giá bản tin.
- Trình thiết kế mẫu kéo-thả trên web.

## 2. Các quyết định đã chốt

| Vấn đề | Quyết định |
|---|---|
| Ban hành | User tự ban hành, không qua duyệt |
| Người chịu trách nhiệm | Mỗi bản tin một người, là người soạn |
| Chữ ký {26} | Ảnh PNG gắn theo tài khoản; user tự tải lên, Admin đơn vị thay được; chưa có thì không ban hành được |
| Số bản tin {1} | Đếm chung cả đơn vị, reset 1/1 hằng năm, cấp lúc ban hành; Admin đơn vị đặt số khởi đầu |
| Nội dung | Một đoạn, một ảnh; {9} có thể gồm nhiều tỉnh |
| Thời gian | Định dạng 24h, phút tròn chục; giờ phát tin phải sau giờ ảnh |
| Tên file | `<mã 4 ký tự>_<DONG hoặc MLDR>_<yyyymmdd>_<hh>h<mm>`, ngày 8 ký tự |
| Hướng di chuyển {12} | 32 hướng, chọn trên vòng tròn la bàn |
| Lựa chọn có sẵn ({5}, {20}, {23}) | Chọn hoặc gõ tay; câu gõ tay không lưu lại thành lựa chọn |
| Xã/phường | Lấy từ lớp `radar:all_new_meger_sub_district`, địa giới sau sáp nhập 2025, 16 tỉnh từ Thanh Hóa trở ra |
| Ảnh ra đa | Dán, tải lên, hoặc chụp bản đồ web đang hiển thị; cả ba đều cắt được |
| Email | Mỗi đơn vị một hộp Gmail riêng (mật khẩu ứng dụng); danh sách nhận cố định do Admin đơn vị sửa; chỉ đính kèm pdf |
| Sau ban hành | Người soạn và Admin đơn vị của người soạn được sửa và gửi lại; phiên bản mới ghi tên người sửa; không xóa |
| Mẫu | Cố định, nhưng thêm/sửa trường không phải viết lại giao diện |
| Khách (chưa đăng nhập) | Xem được nội dung bản tin đã ban hành trên web, chỉ đọc; không tải được docx/pdf, không thấy ảnh chữ ký; không xem được bản nháp |
| Tải docx/pdf | Chỉ người đã đăng nhập (file có ảnh chữ ký thật) |
| Giao diện mobile | Tạm thời chỉ xem danh sách và nội dung bản tin đã ban hành. Soạn, ban hành, sửa và gửi lại chỉ có trên desktop |
| Thông tin công khai | API công khai chỉ trả về tên người soạn và đơn vị, không trả về email, số điện thoại hay thông tin tài khoản khác |
| Server production | Ubuntu 24.04 LTS |

## 3. Phân quyền

Vai trò đang có trong bảng `roles`: `SYSTEM_ADMIN`, `ADMIN`, `USER`. Đơn vị có hai loại: `RADAR_STATION`, `PROVINCIAL_STATION`.

| Việc | SYSTEM_ADMIN | ADMIN (đơn vị mình) | USER |
|---|---|---|---|
| Quản lý đơn vị | Có | Không | Không |
| Tạo tài khoản Admin | Có | Không | Không |
| Thêm/sửa/khóa user | Có | Trong đơn vị mình | Không |
| Cấu hình đơn vị (Gmail, người nhận, số khởi đầu) | Có | Trong đơn vị mình | Không |
| Soạn và ban hành bản tin | Không | Có | Có |
| Sửa và gửi lại | Không | Bản mình soạn và bản của mọi người trong đơn vị mình | Chỉ bản mình soạn |
| Xem bản tin đã ban hành của mọi đơn vị | Có | Có | Có |
| Tải docx/pdf bản đã ban hành | Có | Có | Có |
| Xem bản nháp | Không | Chỉ của mình | Chỉ của mình |

Khách (chưa đăng nhập): chỉ xem nội dung bản tin đã ban hành trên web; không tải docx/pdf, không thấy ảnh chữ ký, không xem bản nháp.

Thay đổi so với mã hiện tại:

- `/api/auth/signup` hiện cho mọi người đã đăng nhập tạo tài khoản với bất kỳ vai trò nào. Sẽ khóa lại theo bảng trên.
- Access token hiện chứa `roleId` và `organizationId`. Sẽ thêm mã vai trò và thêm middleware kiểm tra vai trò, đơn vị cho từng API.
- System Admin không thuộc đơn vị nào, nên `users.organization_id` sẽ cho phép để trống với riêng vai trò này.

## 4. Mẫu bản tin

Mỗi mẫu gồm hai phần:

1. **File docx** có placeholder, giữ đúng thể thức văn bản.
2. **Bản mô tả trường**: với mỗi trường ghi rõ loại (số, chữ, chọn một, chọn nhiều, giờ, ảnh), các lựa chọn, giá trị mặc định, ràng buộc và trường nào tự điền.

Form nhập và việc kiểm tra dữ liệu đều sinh ra từ bản mô tả trường. Thêm hoặc sửa một trường là sửa bản mô tả và file docx. Mẫu Đài tỉnh sau này là thêm một cặp mới, gắn với loại đơn vị `PROVINCIAL_STATION`.

### Các trường của mẫu Trạm ra đa

| Trường | Nội dung | Cách nhập |
|---|---|---|
| {1} | Số bản tin | Tự cấp lúc ban hành |
| {2}–{4} | Ngày ban hành | Tự điền |
| {5} | Tiêu đề | Chọn MƯA DÔNG (mặc định) hoặc MƯA DÔNG DIỆN RỘNG, hoặc gõ tay |
| {6}, {7} | Giờ quan trắc | Tự lấy theo giờ ảnh {15}, {16} |
| {8} | Lời dẫn | Tùy chọn, mặc định bỏ trống |
| {9} | Tỉnh có mưa dông | Chọn nhiều trong 16 tỉnh |
| {10} | Zmax (dBZ) | Số, 30–65 |
| {11} | Tỉnh có Zmax | Chọn 1–3 tỉnh |
| {12} | Hướng di chuyển | Vòng tròn la bàn 32 hướng |
| {13}, {14} | Tốc độ (km/h) | 5–50, min ≤ max |
| {15}–{19} | Giờ và ngày của ảnh | Tự điền khi chụp từ web; nhập tay khi dán hoặc tải ảnh |
| {20} | Nhận định 1–3 giờ tới | Chọn câu có sẵn hoặc gõ tay |
| {21}, {22} | Xã/phường và tỉnh cảnh báo | Chọn trên bản đồ hoặc tìm theo tên; hệ thống tự ghép câu, sửa tay được |
| {23} | Hiện tượng cần đề phòng | Chọn câu có sẵn hoặc gõ tay |
| {24}, {25} | Giờ phát tin | Tự điền, tròn chục, phải sau giờ ảnh |
| {26}, {27} | Chữ ký, họ tên | Lấy từ tài khoản |
| {28} | Ảnh ra đa | Dán, tải lên hoặc chụp bản đồ |

### Quy tắc ghép {21} và {22}

- Tỉnh chỉ chọn một phần xã nằm ở {21}: `xã 1, xã 2 (Tỉnh A); xã 3 (Tỉnh B)`.
- Tỉnh được chọn hết mọi xã chuyển sang {22}: `các xã phường thuộc tỉnh C, D`.

### Tên file và tiêu đề mail

- Tên file: `PDIN_DONG_20260928_01h20.docx` (và `.pdf`). Loại là `MLDR` khi {5} là MƯA DÔNG DIỆN RỘNG, còn lại là `DONG`.
- Tiêu đề mail: `28.09.2026 - Bản tin cảnh báo mưa dông. RĐPĐ-913`. Khi gửi lại thêm ` (gửi lại)` ở cuối.

## 5. Luồng sử dụng

1. Mục **Bản tin** trên Sidebar (hiện đã có nút nhưng chưa hoạt động) mở danh sách bản tin, có lọc theo đơn vị, loại, ngày, người soạn.
2. **Tạo bản tin**: hệ thống chọn mẫu theo loại đơn vị của người dùng.
3. Màn hình soạn hai cột: form bên trái, bản xem trước giống văn bản thật bên phải.
4. Bản nháp tự lưu lên server; nội dung đang soạn cũng được giữ tạm trên trình duyệt phòng khi mất mạng.
5. **Ban hành**: kiểm tra ràng buộc, cấp số, chốt giờ phát, sinh docx và pdf, lưu trữ, gửi mail.
6. Sau ban hành: tải docx/pdf, người soạn hoặc Admin đơn vị được **sửa và gửi lại** (giữ số, tạo phiên bản mới ghi tên người sửa, tiêu đề mail thêm "(gửi lại)").

### Ảnh ra đa

- **Dán** từ clipboard hoặc **tải file** lên: dùng cho ảnh chụp từ phần mềm quan trắc.
- **Chụp bản đồ web**: chụp đúng phần đang hiển thị (sản phẩm MAX, nền, ranh giới, thang màu, nhãn giờ) rồi kéo khung để cắt.
- Rủi ro chưa kiểm tra: trình duyệt chỉ đọc lại được ảnh bản đồ khi GeoServer và nền ArcGIS cho phép (CORS). Phương án thay thế là tính năng chụp tab của trình duyệt, luôn chạy nhưng mỗi lần chụp phải cấp quyền. Sẽ thử ở bước đầu của phần ảnh.

## 6. Khi server lỗi

**Lỗi hoàn toàn**

1. Mỗi máy trực tải sẵn "bộ làm bản tin thủ công": file docx mẫu và danh sách người nhận. Tải lại khi Admin đổi mẫu hoặc danh sách.
2. User điền mẫu trong Word, xuất pdf, gửi từ hộp Gmail đơn vị.
3. Số kế tiếp lấy từ tiêu đề mail gần nhất trong mục "Đã gửi", cộng 1.
4. Khi server chạy lại, dùng **Nhập bản tin làm thủ công**: tải file đã ban hành lên, khai số, giờ phát và các trường chính. Bản tin được lưu là đã ban hành với nhãn "làm thủ công", không gửi mail lại, bộ đếm được đẩy lên, số trùng bị báo lỗi. Bản nhập bổ sung không sửa và gửi lại được.

**Lỗi một phần**

| Phần bị lỗi | Xử lý |
|---|---|
| Gửi Gmail | Bản tin vẫn ban hành, ghi trạng thái "gửi mail thất bại", có nút gửi lại; user tải pdf tự gửi |
| Chuyển pdf | Cho tải docx để tự xuất pdf bằng Word |
| GeoServer, bản đồ | Vẫn dán hoặc tải ảnh |
| Mất mạng lúc soạn | Giữ tạm trên trình duyệt, có mạng lại thì lưu tiếp |

## 7. Dữ liệu

Chưa có migration; mọi thay đổi sẽ gửi dưới dạng SQL để duyệt và chỉ chạy trên DB local.

**Bổ sung bảng hiện có**

- `organizations`: mã tên file 4 ký tự (`PDIN`), ký hiệu văn bản (`RĐPĐ`), địa danh ghi trong ngày tháng (`Pha Đin`), địa chỉ Gmail, mật khẩu ứng dụng (lưu mã hóa), danh sách người nhận. Giữ nguyên cột `code` hiện có (`RDPD`, `SOLA`).
- `users`: ảnh chữ ký; cho phép `organization_id` trống với System Admin.

**Bảng mới**

- Mẫu bản tin: loại đơn vị áp dụng, file docx, bản mô tả trường, phiên bản.
- Bản tin: đơn vị, người soạn, mẫu, giá trị các trường, ảnh, trạng thái (nháp, đã ban hành), số, năm, giờ ban hành, nhãn làm thủ công, file docx/pdf đã sinh.
- Phiên bản bản tin: nội dung từng lần gửi lại.
- Bộ đếm số: theo đơn vị và năm, kèm số khởi đầu; cấp số trong giao dịch để hai người ban hành cùng lúc không trùng số.
- Nhật ký gửi mail: thời điểm, người nhận, kết quả.

File ảnh, docx, pdf lưu trên đĩa server; CSDL lưu đường dẫn.

## 8. API dự kiến

Tất cả đặt sau `protectedRoute` và kiểm tra vai trò, trừ phần đọc bản tin đã ban hành (bên dưới).

- `/api/bulletins` (cần đăng nhập): tạo nháp, xem nháp, sửa nháp, ban hành, sửa và gửi lại, gửi lại mail, nhập bản làm thủ công.
- `/api/bulletins/published` (công khai, chỉ đọc): danh sách bản tin đã ban hành và xem chi tiết nội dung. Không trả về bản nháp, ảnh chữ ký hay file docx/pdf. Thông tin về người soạn chỉ gồm tên và đơn vị (đã chốt ở mục 2).
- Tải docx/pdf bản đã ban hành: cần đăng nhập (đặt trong `/api/bulletins`).
- `/api/bulletin-templates`: lấy mẫu và bản mô tả trường theo loại đơn vị; tải bộ làm thủ công.
- `/api/uploads`: tải ảnh ra đa, ảnh chữ ký.
- `/api/organizations`: cấu hình đơn vị (Gmail, người nhận, số khởi đầu).
- `/api/users`: thêm, sửa, khóa user theo quyền.

## 9. Cần chủ dự án duyệt trước khi cài

Quy tắc dự án: không cài gói khi chưa được duyệt. Tên gói cụ thể sẽ xác nhận lại lúc triển khai.

| Nhu cầu | Dự kiến |
|---|---|
| Điền dữ liệu và ảnh vào docx | Thư viện điền mẫu docx phía backend |
| Chuyển docx sang pdf | LibreOffice chạy nền, cài trên server Ubuntu và trên máy dev Windows |
| Gửi mail | Thư viện SMTP phía backend |
| Nhận file tải lên | Thư viện upload phía backend; nâng giới hạn dung lượng riêng cho API ảnh |
| Cắt ảnh, chụp bản đồ | Thư viện phía frontend, hoặc tự viết nếu đủ gọn |
| Mã hóa mật khẩu ứng dụng | Thêm một khóa bí mật trong `backend/.env` |

## 10. Thứ tự triển khai

1. Phân quyền và quản lý user theo đơn vị.
2. Mẫu, form soạn, xem trước, lưu nháp.
3. Ảnh: dán, tải lên, cắt; sau đó chụp bản đồ.
4. Xuất docx, pdf.
5. Ban hành, đánh số, danh sách và tra cứu, sửa và gửi lại.
6. Gửi Gmail, cấu hình đơn vị.
7. Bộ làm thủ công và nhập bổ sung.
8. Mẫu Đài tỉnh.

## 11. Việc còn mở

- Danh sách tên 32 hướng bằng tiếng Việt: sẽ đề xuất để chủ dự án duyệt.
- Lớp `radar:all_new_meger_sub_district` có thuộc tính tên tỉnh để nhóm xã theo tỉnh hay không: kiểm tra khi triển khai.
- Danh sách câu có sẵn đầy đủ cho {5}, {20}, {23}.
- CORS của GeoServer và nền ArcGIS cho chức năng chụp bản đồ.
- Triển khai production (Nginx, nơi lưu file) chưa rõ.